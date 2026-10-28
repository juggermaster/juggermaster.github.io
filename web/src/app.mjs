import { defaults, cleanSound, presets, clamp, finiteMatch, setMatch, remainingTime, advanceTime, matchWinner, newGame, awardPoint, nextSection, finishTimedMatch, adjustStones, restoreSnapshot } from './core.mjs';
import { texts, translate } from './i18n.mjs';
import { locales, resolveLanguage, moveLanguageFocus } from './locale.mjs';
import { BeatClock } from './clock.mjs';
import { unlockAudio, importAudioFile, deleteAudioFile, audioTime, playBeat, playEndSignal, stopAudio, onAudioInterruption } from './audio.mjs';
import { audioFile } from './audio-files.mjs';
import { instruments } from './instruments.mjs';
import { restoreResults, saveResult, resultsCsv } from './results.mjs';
import { importTeamLogo } from './team-logos.mjs';
import { setupOffline, applyUpdate, offlineState } from './offline.mjs';

const root = document.getElementById('jm-arena'), app = root.querySelector('.jm-app');
const $ = selector => root.querySelector(selector), $$ = selector => [...root.querySelectorAll(selector)];
const storageKey = 'juggermaster:state:v2';
let config = { ...defaults }, sound = cleanSound(), game = newGame(config), history = [], teams = [];
let results = restoreResults();
let soundTarget = 'beat', soundBusy = false, soundError = null;
const customFiles = { beat: null, signal: null }, profileKeys = ['pitch', 'metal', 'attack', 'decay'];
const editedSound = () => soundTarget === 'beat' ? sound : sound.end;
let language = 'de', theme = 'dark', view = ['info', 'sound', 'setup'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'match', running = false, starting = false, previewing = false;
let countdown = -1, requestId = 0, currentDialog = null, countdownDialog = null, lastFocus = null, wakeLock = null;
let noticeKey = null, lastSave = '', storageError = false, freshState = true;
let updatingRanges = false;
const logoBusy = new Set(), logoErrors = new Set();
const defaultLogos = {
  defaultTeamA: new URL('./images/team-raven.png', import.meta.url).href,
  defaultTeamB: new URL('./images/team-wolf.png', import.meta.url).href
};
const ranges = new Map(), t = (key, values) => translate(language, key, values);
const decimal = value => Number(value).toLocaleString(locales[language].tag, { maximumFractionDigits: 1 });
const time = milliseconds => { const seconds = Math.floor(milliseconds / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const snapshot = JSON.parse(saved), restored = restoreSnapshot(snapshot);
    if (!restored) throw Error('Invalid saved match');
    ({ config, sound, game, history, language, theme, teams } = restored);
    results = restoreResults(snapshot.results || snapshot.matchLog);
    freshState = false;
  }
  const preferred = localStorage.getItem('juggermaster:language');
  language = resolveLanguage(navigator.languages || [navigator.language], preferred);
} catch { noticeKey = 'restoreFailed'; }
if (noticeKey === 'restoreFailed') language = resolveLanguage(navigator.languages || [navigator.language]);
if (freshState) for (const side of ['teamA', 'teamB']) rememberTeam(side);

if (!globalThis.Framework7) throw Error('Framework7 konnte nicht geladen werden.');
const f7 = new Framework7({ el: app, name: 'JUGGERMASTER', theme: 'ios', darkMode: false,
  dialog: { closeByBackdropClick: false }, touch: { fastClicks: false, tapHold: false } });

function persist() {
  const serialize = archive => JSON.stringify({ version: 2, language, theme, config, sound, game, history, teams, results: { ...results, archive } });
  let json = serialize(results.archive);
  if (json === lastSave) return;
  try {
    try { localStorage.setItem(storageKey, json); }
    catch (error) {
      if (error.name !== 'QuotaExceededError' || !results.archive.length) throw error;
      // Find the largest suffix that fits without repeatedly discarding single records.
      const archive = results.archive;
      let low = 1, high = archive.length - 1, retained = null;
      while (low <= high) {
        const count = Math.floor((low + high) / 2), candidate = archive.slice(archive.length - count), value = serialize(candidate);
        try { localStorage.setItem(storageKey, value); retained = candidate; json = value; low = count + 1; }
        catch (failure) { if (failure.name !== 'QuotaExceededError') throw failure; high = count - 1; }
      }
      if (retained === null) throw error;
      results.archive = retained;
    }
    lastSave = json; storageError = false; if (noticeKey === 'storageFailed') noticeKey = null;
  }
  catch { storageError = true; noticeKey = 'storageFailed'; }
}

function remember() { history.push({ ...game }); if (history.length > 30) history.shift(); }
function applyGame(next) {
  if (game.ended || next.ended) saveResult(results, game, next, [teamName('teamA'), teamName('teamB')]);
  game = next;
}
function rememberTeam(side) {
  const name = config[side], color = config[side === 'teamA' ? 'colorA' : 'colorB'], defaultName = config[`${side}Default`];
  if (!name) return;
  const saved = teams.find(team => team.name.toLowerCase() === name.toLowerCase());
  if (saved) Object.assign(saved, { name, color, defaultName }); else teams.push({ name, color, defaultName });
}
function setText(name, value) { $(`[data-read="${name}"]`).textContent = value; }
function configuredTeamName(side) { return config[`${side}Default`] ? t(config[`${side}Default`]) : config[side]; }
function savedTeamName(team) { return team.defaultName ? t(team.defaultName) : team.name; }
function teamName(side) { return configuredTeamName(side) || t(side); }
function currentTeam(side) { return teams.find(team => team.name.toLowerCase() === config[side].toLowerCase()); }
function teamLogo(side) {
  const team = currentTeam(side);
  return team?.logo === '' ? null : team?.logo || defaultLogos[team?.defaultName || config[`${side}Default`]];
}
function setLocalizedText(element, text) {
  element.replaceChildren(...text.split(/(JUGGERMASTER)/).map(part => {
    if (part !== 'JUGGERMASTER') return part;
    const name = document.createElement('strong'); name.textContent = part; return name;
  }));
}

function renderLanguage() {
  const instrumentPrompt = new Option(t('chooseInstrument'), ''); instrumentPrompt.disabled = true;
  $('[data-instrument]').replaceChildren(instrumentPrompt,
    ...Object.entries(instruments).map(([name, instrument]) => new Option(t(instrument.label), name)),
    ...Object.entries({ stone: 'stoneOnMetal', deep: 'gong', drum: 'drum' }).map(([name, label]) => new Option(t(label), name)));
  $$('.jm-document [data-locale]').forEach(section => { section.hidden = section.dataset.locale !== language; });
  $$('[data-home-steps]').forEach(list => list.replaceChildren(...t(list.dataset.homeSteps).split('\n').map(text => { const item = document.createElement('li'); setLocalizedText(item, text); return item; })));
  root.lang = language; document.documentElement.lang = language; document.documentElement.dir = locales[language].dir || 'ltr';
  document.title = t('appTitle');
  document.head.querySelectorAll('[data-i18n-content]').forEach(meta => { meta.content = t(meta.dataset.i18nContent); });
  document.head.querySelector('meta[property="og:locale"]').content = locales[language].tag.replace('-', '_');
  $$('[data-i18n]').forEach(element => { setLocalizedText(element, t(element.dataset.i18n)); });
  $$('[data-i18n-aria]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  $('[data-read=language-flag]').dataset.language = language;
  $('[data-read=language-flag]').src = new URL(`./images/flag-${locales[language].flag}.svg`, import.meta.url).href;
  $$('[data-language-option]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.languageOption === language)));
}
function phase() {
  if (game.ended) return t('matchEnded');
  if (game.golden) return t('goldenJugg');
  if (game.periods === 0) return t('freeDrumming');
  return t(setMatch(game) ? 'setNumber' : 'roundNumber', { number: game.period });
}
async function emailResults(button, notice) {
  if (!results.archive.length) return;
  button.disabled = true; notice.hidden = true;
  try {
    const file = new File([resultsCsv(results.archive, t)], 'juggermaster-results.csv', { type: 'text/csv' });
    const title = `JUGGERMASTER · ${t('resultsTitle')}`, text = t('resultsEmailBody');
    try {
      if (navigator.canShare?.({ files: [file] }) && typeof navigator.share === 'function') {
        await navigator.share({ files: [file], title, text }); return;
      }
    } catch (error) { if (error.name === 'AbortError') return; }
    const url = URL.createObjectURL(file), download = document.createElement('a');
    download.className = 'external'; download.href = url; download.download = file.name; document.body.append(download); download.click(); download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    notice.textContent = t('csvDownloaded', { file: file.name }); notice.hidden = false;
    const mail = document.createElement('a');
    mail.className = 'external'; mail.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
    document.body.append(mail); mail.click(); mail.remove();
  } catch { notice.textContent = t('csvExportFailed'); notice.hidden = false; }
  finally { button.disabled = !results.archive.length; }
}
function showResults() {
  pause(); closeLanguages(); lastFocus = $('[data-action=results]');
  const title = t('resultsTitle');
  currentDialog = f7.dialog.create({ title, cssClass: 'jm-history-dialog', text: '<div class="jm-results-list" tabindex="0" role="region"></div>', destroyOnClose: true,
    buttons: [{ text: t('emailResults'), close: false, onClick: () => emailResults(exportButton, notice) }, { text: t('close'), strong: true }],
    on: { opened(instance) { instance.el.querySelector('[data-dialog-action=close]').focus(); }, closed() { currentDialog = null; lastFocus?.focus(); } } });
  currentDialog.el.setAttribute('role', 'dialog'); currentDialog.el.setAttribute('aria-modal', 'true'); currentDialog.el.setAttribute('aria-label', title);
  const list = currentDialog.el.querySelector('.jm-results-list'); list.setAttribute('aria-label', title);
  const entries = document.createElement('ul');
  let shown = 0;
  const loadMore = () => {
    const fragment = document.createDocumentFragment(), end = Math.min(shown + 30, results.archive.length);
    while (shown < end) {
      const result = results.archive[results.archive.length - 1 - shown++];
      const row = document.createElement('li'), teams = document.createElement('strong'), detail = document.createElement('small');
      teams.textContent = result.teams.join(' — ');
      let score = result.periods < 0 ? t('setsScore', { a: result.setsA, b: result.setsB }) : result.a + ' : ' + result.b;
      if (result.periods === -2 && !result.setComplete) score += ' · ' + t('setPointsScore', { a: result.a, b: result.b });
      detail.textContent = new Date(result.at).toLocaleString(locales[language].tag, { dateStyle: 'short', timeStyle: 'short' }) + ' · ' + score;
      row.append(teams, detail); fragment.append(row);
    }
    entries.append(fragment);
  };
  loadMore();
  if (entries.childElementCount) list.append(entries);
  else { const empty = document.createElement('p'); empty.textContent = t('emptyResults'); list.append(empty); }
  const fillVisible = () => {
    while (shown < results.archive.length && list.clientHeight > 0 && list.scrollHeight - list.scrollTop - list.clientHeight < 160) loadMore();
  };
  list.addEventListener('scroll', fillVisible);
  currentDialog.once('opened', fillVisible);
  const [exportButton, closeButton] = currentDialog.el.querySelectorAll('.dialog-button');
  exportButton.dataset.dialogAction = 'email-csv'; exportButton.disabled = !results.archive.length;
  closeButton.dataset.dialogAction = 'close';
  const notice = document.createElement('p'); notice.className = 'jm-note'; notice.setAttribute('role', 'status'); notice.hidden = true;
  currentDialog.el.querySelector('.dialog-text').append(notice);
  currentDialog.open();
}
root.addEventListener('toggle', async event => {
  const details = event.target;
  if (!details.matches('details[data-document], details[data-license]') || !details.open || details.dataset.loaded || details.dataset.loading) return;
  const content = details.querySelector('.jm-document');
  details.dataset.loading = 'true'; content.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(details.dataset.license || `./${details.dataset.document}`);
    if (!response.ok) throw Error('Document unavailable');
    if (details.dataset.license) {
      const text = document.createElement('pre'); text.dir = 'ltr'; text.textContent = await response.text();
      content.replaceChildren(text); details.dataset.loaded = 'true'; return;
    }
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const sections = [...page.querySelectorAll('main > [data-locale]')];
    if (!sections.length) throw Error('Document content missing');
    sections.forEach(section => {
      section.hidden = section.dataset.locale !== language;
      section.querySelectorAll('a[href]').forEach(link => link.classList.add('external'));
      if (details.dataset.document === 'lizenzen.html') section.querySelectorAll('a[href]').forEach(link => {
        const url = new URL(link.getAttribute('href'), location.href);
        if (url.origin !== location.origin || !url.pathname.endsWith('.txt')) return;
        const license = document.createElement('details'), summary = document.createElement('summary'), body = document.createElement('div');
        license.dataset.license = link.getAttribute('href'); body.className = 'jm-document';
        summary.append(...link.cloneNode(true).childNodes);
        (link.parentElement.tagName === 'P' ? link.parentElement : link).replaceWith(license);
        body.append(link); license.append(summary, body);
      });
    });
    content.replaceChildren(...sections); details.dataset.loaded = 'true';
  } catch {
    // Keep the direct document link available; reopening retries the request.
  } finally { delete details.dataset.loading; content.removeAttribute('aria-busy'); }
}, true);
function render() {
  const finite = finiteMatch(game), timedSets = game.periods === -2, remaining = Math.max(0, game.limit - game.consumed);
  const complete = finite && remaining === 0;
  const next = complete ? nextSection(game) : null;
  const sectionLabel = next?.golden ? 'startGolden' : next?.ended ? 'confirmResult' : 'startPeriod';
  app.style.colorScheme = theme;
  document.documentElement.style.colorScheme = theme;
  setText('format', timedSets ? t('timedSetFormat', { minutes: game.minutes ?? defaults.minutes, sets: game.setsToWin, points: game.targetPoints }) : setMatch(game) ? t('setFormat', { sets: game.setsToWin, points: game.targetPoints }) : game.periods === 0 ? t('freeFormat') : t('limitedFormat', { periods: game.periods, limit: game.limit }));
  setText('phase', phase());
  setText('status', t(game.ended ? 'statusEnded' : countdown >= 0 ? 'counting' : running ? 'statusRunning' : 'statusPaused'));
  $('[data-read=status]').dataset.running = String(running || countdown >= 0);
  const stoneCounter = $('[data-read=stones]'), displayed = config.direction === 'down' && finite ? remaining : game.consumed;
  if (document.activeElement !== stoneCounter) stoneCounter.value = displayed;
  $('.jm-stones').style.setProperty('--jm-stone-digits', String(Math.max(1, stoneCounter.value.length)));
  stoneCounter.max = finite ? game.limit : 999999; stoneCounter.disabled = timedSets || game.ended;
  stoneCounter.setAttribute('aria-label', t(config.direction === 'down' && finite ? 'stonesLeft' : 'stonesPlayed'));
  $('.jm-counter').hidden = timedSets;
  $('[data-read=match-clock]').hidden = !timedSets;
  setText('remaining-time', time(Math.ceil(remainingTime(game) / 1000) * 1000));
  setText('caption', t(timedSets ? 'timeRemaining' : config.direction === 'down' && finite ? 'stonesLeft' : 'stonesPlayed'));
  for (const [label, side] of [['team-a', 'teamA'], ['team-b', 'teamB']]) {
    setText(label, teamName(side).toLocaleUpperCase(language)); $(`[data-read=${label}]`).title = teamName(side);
  }
  setText('score-a', game.a); setText('score-b', game.b);
  $$('[data-team-side]').forEach(team => {
    const color = config[team.dataset.teamSide === 'teamA' ? 'colorA' : 'colorB'];
    team.style.setProperty('--jm-team-color', color || 'transparent'); team.dataset.teamColor = String(Boolean(color));
  });
  setText('elapsed', time(game.elapsed)); setText('period-time', time(game.periodTime)); setText('playtime', time(game.playtime)); setText('pace', `${decimal(config.pace)} s`);
  const blocked = game.ended || game.setComplete, nextSetReady = setMatch(game) && game.setComplete && !game.ended;
  $('[data-action=score-a-plus]').disabled = blocked; $('[data-action=score-b-plus]').disabled = blocked;
  $('[data-action=score-a-minus]').disabled = blocked || !game.a; $('[data-action=score-b-minus]').disabled = blocked || !game.b;
  $('[data-action=toggle]').disabled = !game.ended && blocked && !nextSetReady;
  setText('start-label', t(countdown >= 0 ? 'cancelCountdown' : running ? 'pauseMatch' : game.ended ? 'newMatch' : nextSetReady ? 'nextSet' : complete ? sectionLabel : game.period === 1 && (timedSets ? game.elapsed === 0 : game.consumed === 0) && !game.golden ? 'startMatch' : 'resumeMatch'));
  $('[data-action=toggle] [data-icon=play]').toggleAttribute('hidden', running || countdown >= 0);
  $('[data-action=toggle] [data-icon=pause]').toggleAttribute('hidden', !running && countdown < 0);
  $('[data-action=undo]').disabled = !history.length;
  if (countdownDialog && countdown >= 0) setText('countdown', ['3', '2', '1', 'JUGGER'][countdown]);
  $('[data-read=sets]').hidden = !setMatch(game);
  setText('sets', t('setsScore', { a: game.setsA, b: game.setsB }));
  $$('[data-view]').forEach(element => { element.hidden = element.dataset.view !== view; element.classList.toggle('tab-active', element.dataset.view === view); });
  $$('[data-tab]').forEach(element => {
    element.classList.toggle('tab-link-active', element.dataset.tab === view);
    if (element.dataset.tab === view) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
  });
  $$('[data-setting]').forEach(input => {
    const key = input.dataset.setting, value = ['teamA', 'teamB'].includes(key) ? configuredTeamName(key) : config[key];
    if (['colorA', 'colorB'].includes(key)) {
      input.disabled = false; if (value && input !== document.activeElement) input.value = value;
      input.closest('.jm-color-actions').dataset.empty = String(!value);
      input.setAttribute('aria-label', value ? t(key) : `${t(key)} · ${t('noTeamColor')}`);
    }
    else if (input !== document.activeElement) { if (input.type === 'checkbox') input.checked = value; else input.value = value; }
  });
  $$('[data-team-color-remove]').forEach(button => { button.disabled = !config[button.dataset.teamColorRemove === 'teamA' ? 'colorA' : 'colorB']; button.title = t('removeTeamColor'); });
  const hapticsAvailable = typeof navigator.vibrate === 'function';
  $$('[data-setting=hapticStones], [data-setting=hapticPoints]').forEach(input => { input.disabled = !hapticsAvailable; });
  $('[data-read=haptics-unavailable]').hidden = hapticsAvailable;
  $$('[data-team-choice]').forEach(select => {
    if (view !== 'setup' || select === document.activeElement) return;
    select.replaceChildren(new Option(t('chooseTeam'), ''), ...teams.map(team => new Option(savedTeamName(team), team.name)));
    const saved = teams.find(team => team.name === config[select.dataset.teamChoice] && team.color.toLowerCase() === config[select.dataset.teamChoice === 'teamA' ? 'colorA' : 'colorB'].toLowerCase());
    select.value = saved?.name || '';
  });
  $$('[data-team-delete]').forEach(button => { button.disabled = !teams.some(team => team.name.toLowerCase() === config[button.dataset.teamDelete].toLowerCase()); });
  $$('[data-team-logo]').forEach(image => {
    const logo = teamLogo(image.dataset.teamLogo);
    image.hidden = !logo;
    if (logo && image.getAttribute('src') !== logo) image.src = logo;
    else if (!logo) image.removeAttribute('src');
  });
  $$('[data-team-logo-file]').forEach(input => { input.disabled = !config[input.dataset.teamLogoFile] || logoBusy.has(input.dataset.teamLogoFile); });
  $$('[data-team-logo-remove]').forEach(button => { button.hidden = !teamLogo(button.dataset.teamLogoRemove); button.disabled = logoBusy.has(button.dataset.teamLogoRemove); button.title = t('removeTeamLogo'); });
  $$('[data-team-logo-notice]').forEach(notice => { notice.hidden = !logoErrors.has(notice.dataset.teamLogoNotice); });
  $('[data-read=set-settings]').hidden = !setMatch(config);
  $('[data-setting=setsToWin]').closest('.jm-field').hidden = !setMatch(config);
  $('[data-setting=minutes]').closest('.jm-field').hidden = config.periods !== -2;
  $('[data-setting=limit]').closest('.jm-fields-pair').hidden = !finiteMatch(config);
  $('[data-setting=rounds]').closest('.jm-field').hidden = config.periods <= 0;
  $('[data-setting=direction]').closest('.jm-field').hidden = !finiteMatch(config);
  $('[data-i18n=timedSetDescription]').hidden = config.periods !== -2;
  $('[data-output=pace]').textContent = `${decimal(config.pace)} s`;
  const profile = editedSound(), sampled = ['spessa', 'custom'].includes(profile.kind);
  const decayMax = profile.kind === 'custom' ? 30 : 6;
  if (Number($('[data-sound=decay]').max) !== decayMax) {
    $('[data-sound=decay]').max = decayMax;
    const range = ranges.get($('[data-sound=decay]')); if (range) { range.max = decayMax; range.params.max = decayMax; }
  }
  $$('[data-sound]').forEach(input => { input.value = (profileKeys.includes(input.dataset.sound) ? profile : sound)[input.dataset.sound]; });
  for (const key of [...profileKeys, 'volume', 'signalVolume']) {
    const value = (profileKeys.includes(key) ? profile : sound)[key];
    $(`[data-output=${key}]`).textContent = `${decimal(key === 'pitch' && sampled ? value / 110 * 100 : value)}${key === 'pitch' ? sampled ? ' %' : ' Hz' : key === 'decay' ? ' s' : ' %'}`;
  }
  $('[data-sound=metal]').closest('.jm-field').hidden = sampled;
  // Framework7 emits input events when synchronizing the displayed values too.
  updatingRanges = true;
  ranges.forEach((range, input) => { if (range.getValue() !== Number(input.value)) range.setValue(Number(input.value), true); });
  updatingRanges = false;
  $$('[data-sound-target]').forEach(button => {
    const selected = button.dataset.soundTarget === soundTarget;
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; button.disabled = soundBusy;
    if (selected) $('#jm-sound-editor').setAttribute('aria-labelledby', button.id);
  });
  $('[data-instrument]').value = profile.kind === 'spessa' ? profile.instrument : Object.keys(presets).find(name => presets[name].kind === profile.kind) || '';
  $('[data-instrument]').disabled = soundBusy;
  $('[data-audio-file]').disabled = soundBusy;
  $('[data-read=custom-file]').hidden = !customFiles[soundTarget];
  $('[data-action=use-custom]').textContent = customFiles[soundTarget]?.name || '';
  $('[data-action=delete-custom]').title = t('removeCustom');
  $('[data-action=use-custom]').setAttribute('aria-pressed', String(profile.kind === 'custom'));
  for (const action of ['use-custom', 'delete-custom', 'beat-preview', 'signal-preview']) $(`[data-action=${action}]`).disabled = soundBusy;
  $('[data-read=sound-notice]').hidden = !soundError;
  $('[data-read=sound-notice]').textContent = soundError ? t(soundError) : '';
  $('[data-action=beat-preview]').setAttribute('aria-pressed', String(previewing));
  $('[data-action=beat-preview]').hidden = soundTarget !== 'beat';
  $('[data-action=signal-preview]').hidden = soundTarget !== 'signal';
  $('[data-setting=signalCount]').closest('.jm-field').hidden = soundTarget !== 'signal';
  $('[data-sound=volume]').closest('.jm-volume').hidden = soundTarget !== 'beat';
  $('[data-sound=signalVolume]').closest('.jm-volume').hidden = soundTarget !== 'signal';
  $('[data-i18n=previewBeat]').textContent = t(previewing ? 'stopBeat' : 'previewBeat');
  $$('.jm-wave span').forEach((bar, index) => { bar.style.height = `${6 + Math.abs(Math.sin(index * 1.9 + sound.pitch / 60)) * 40 * Math.exp(-index / (sound.decay * 7 + 4))}px`; });
  const notice = $('[data-read=notice]'); notice.hidden = !noticeKey; if (noticeKey) notice.textContent = t(noticeKey);
  $('[data-read=offline]').textContent = t(offlineState.status === 'ready' ? navigator.onLine ? 'offlineReady' : 'offlineUsing' : offlineState.status === 'unsupported' ? 'offlineUnsupported' : offlineState.status === 'error' ? 'offlineFailed' : 'offlineLoading');
  $('.jm-offline').hidden = ['loading', 'ready'].includes(offlineState.status);
  $('[data-action=offline-retry]').hidden = offlineState.status !== 'error';
  $('[data-read=update]').hidden = !offlineState.waiting;
  $('[data-action=update]').disabled = running || previewing || countdown >= 0 || starting;
}

async function keepAwake() {
  if (wakeLock) return;
  const token = requestId;
  try {
    if (!navigator.wakeLock) throw Error('Wake lock unavailable');
    const lock = await navigator.wakeLock.request('screen');
    if (token !== requestId || (!running && !previewing && countdown < 0 && !slotActive())) { await lock.release(); return; }
    wakeLock = lock;
    lock.addEventListener('release', () => {
      if (wakeLock === lock) wakeLock = null;
      if (!document.hidden && (running || previewing || countdown >= 0 || slotActive())) { noticeKey = 'wakeFailed'; render(); }
    });
  } catch { if (running || previewing || countdown >= 0 || slotActive()) { noticeKey = 'wakeFailed'; render(); } }
}
function releaseWake() { const lock = wakeLock; wakeLock = null; lock?.release().catch(() => {}); }
function slotActive() { return game.periods === -2 && game.deadline != null && !game.ended; }
function announceTimeEnd() {
  pause(false);
  if (currentDialog) { currentDialog.once('closed', showWinner); currentDialog.close(); }
  else showWinner();
  if (!document.hidden) playEndSignal(sound, config.signalCount);
}
function updateSlotClock() {
  if (!slotActive()) return;
  const next = advanceTime(game, 0);
  if (next.ended) remember();
  applyGame(next);
  if (game.ended) announceTimeEnd();
  render();
}
const interrupted = () => { if (running || previewing || countdown >= 0) pause(); };
function vibrate(pattern) { try { navigator.vibrate?.(pattern); } catch {} }
onAudioInterruption(interrupted);
const matchClock = new BeatClock({ now: audioTime,
  schedule({ at, index }) {
    if (countdown >= 0) { if (config.beatEnabled && index <= 4) playBeat(sound, at); }
    else if (config.beatEnabled && (!finiteMatch(game) || startConsumed + index < game.limit)) playBeat(sound, at);
  },
  frame(seconds) {
    if (!running || countdown >= 0) return;
    const next = advanceTime(game, seconds * 1000);
    if (next.ended) remember();
    applyGame(next);
    if (game.ended) announceTimeEnd();
    render();
  },
  tick({ index }) {
    if (countdown >= 0) {
      countdown = index - 1;
      if (index === 5) { countdown = -1; countdownDialog?.close(false); beginMatchClock(); }
      render(); return;
    }
    if (game.periods === -2) { if (config.hapticStones) vibrate(35); persist(); return; }
    const next = finishTimedMatch({ ...game, consumed:game.consumed + 1 });
    if (next.ended) remember();
    applyGame(next);
    if (finiteMatch(game) && game.consumed >= game.limit) {
      pause(false); if (game.ended) showWinner(); playEndSignal(sound, config.signalCount);
    }
    if (config.hapticStones) vibrate(35);
    persist(); render();
  }, interrupted });
let startConsumed = 0;
const previewClock = new BeatClock({ now: audioTime, schedule: ({ at }) => playBeat(sound, at), interrupted });
function beginMatchClock() {
  if (game.periods === -2 && game.deadline == null) { game = { ...game, deadline: Date.now() + remainingTime(game) }; persist(); }
  running = true; startConsumed = game.consumed; matchClock.start(config.pace);
}
function showCountdown() {
  countdownDialog = f7.dialog.create({ title: '', cssClass: 'jm-countdown-dialog', text: '<div class="jm-countdown" data-read="countdown" role="status" aria-live="assertive">3</div>', destroyOnClose: true,
    on: { opened(instance) { instance.el.focus(); matchClock.start(.25, true); }, closed() { countdownDialog = null; focusMatchButton(); } } });
  countdownDialog.el.setAttribute('role', 'dialog'); countdownDialog.el.setAttribute('aria-modal', 'true'); countdownDialog.el.setAttribute('aria-label', t('startCountdown')); countdownDialog.el.tabIndex = -1;
  countdownDialog.open(false);
}
function pause(silence = true) {
  if (config.hapticStones || config.hapticPoints) vibrate(0);
  requestId++; running = false; starting = false; countdown = -1; previewing = false;
  countdownDialog?.close(false);
  matchClock.stop(); previewClock.stop(); stopAudio(!silence); if (!slotActive()) releaseWake(); persist(); render();
}
async function start() {
  if (starting || running || countdown >= 0 || game.ended || game.setComplete || (finiteMatch(game) && game.consumed >= game.limit)) return;
  pause(); const token = ++requestId; starting = true;
  render(); const unlocked = await unlockAudio(sound);
  if (token !== requestId || view !== 'match') return;
  starting = false;
  if (!unlocked && (config.beatEnabled || sound.signalVolume)) { noticeKey = 'audioFailed'; render(); return; }
  if (config.countdown) {
    countdown = 0;
    if (currentDialog) currentDialog.once('closed', () => { if (token === requestId) showCountdown(); });
    else showCountdown();
  }
  else beginMatchClock();
  render(); keepAwake(); navigator.storage?.persist?.().catch(() => {});
}
async function startPreview() {
  if (previewing || starting || soundBusy || view !== 'sound' || document.hidden) return;
  pause(); const token = ++requestId; starting = true; soundError = null;
  render(); const unlocked = await unlockAudio(sound, 'beat');
  if (token !== requestId) return;
  starting = false;
  if (!unlocked) { noticeKey = soundError = 'audioFailed'; render(); return; }
  previewing = true; previewClock.start(config.pace, true); render(); keepAwake();
}
async function endSignal() {
  const token = requestId;
  if (!sound.signalVolume) return;
  if (await unlockAudio(sound, 'signal')) { if (token === requestId) playEndSignal(sound, config.signalCount); }
  else { noticeKey = soundError = 'audioFailed'; render(); }
}
async function selectSound(values) {
  pause(); soundError = null; Object.assign(editedSound(), values); persist(); render();
  if (soundTarget === 'beat') await startPreview(); else await endSignal();
}
function fitMatch() {
  const pane = $('.jm-scroll'), body = $('.jm-body'), match = $('[data-view=match]');
  if (match.hidden) { delete body.dataset.fitMatch; return; }
  body.dataset.fitMatch = '';
  body.style.setProperty('--jm-match-scale', 1);
  body.style.setProperty('--jm-match-content-height', '0px');
  const padding = getComputedStyle(body);
  const inset = parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom);
  const otherHeight = [...pane.children].filter(element => element !== body).reduce((sum, element) => {
    const style = getComputedStyle(element);
    return sum + (element.hidden ? 0 : element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom));
  }, 0);
  const naturalHeight = match.offsetHeight;
  const available = Math.max(1, pane.clientHeight - otherHeight - inset - 1);
  const scale = Math.max(.01, Math.min(1, available / Math.max(1, naturalHeight)));
  body.style.setProperty('--jm-match-scale', scale);
  body.style.setProperty('--jm-match-content-height', `${available / scale}px`);
  body.style.setProperty('--jm-match-height', `${Math.ceil(available + inset)}px`);
  pane.scrollTop = 0;
}
function focusMatchButton() {
  $('[data-action=toggle]').focus({ preventScroll: true });
}
function resetMatch() {
  pause();
  rememberTeam('teamA'); rememberTeam('teamB');
  history = []; game = newGame(config); results.currentId = null; noticeKey = storageError ? 'storageFailed' : null; persist(); showView('match');
  currentDialog.once('closed', focusMatchButton);
}
function showWinner() {
  const sets = setMatch(game), a = sets ? game.setsA : game.a, b = sets ? game.setsB : game.b;
  const winnerSide = matchWinner(game), team = teamName(winnerSide === 'a' ? 'teamA' : 'teamB');
  const resultKey = winnerSide ? 'matchResult' : 'drawResult';
  dialog(t('matchEnded'), t(resultKey, { team, a, b }), t('newMatch'), resetMatch, t('close'));
  currentDialog.el.classList.add('jm-result-dialog');
  const message = currentDialog.el.querySelector('.jm-dialog-description');
  message.classList.add('jm-winner-message');
  if (winnerSide) {
    const [before, after] = t(resultKey, { team:'\0', a, b }).split('\0').map(text => {
      const part = document.createElement('span'); part.textContent = text; return part;
    });
    const winner = document.createElement('span'); winner.className = 'jm-result-team';
    winner.textContent = team; winner.title = winner.textContent;
    message.replaceChildren(before, winner, after);
  }
  if (game.periods === -2) {
    const points = document.createElement('p'); points.className = 'jm-note';
    points.textContent = t('setPointsScore', { a: game.setComplete ? 0 : game.a, b: game.setComplete ? 0 : game.b });
    message.after(points);
  }
  const scoreboard = document.createElement('div'); scoreboard.className = 'jm-final-score';
  for (const [team, score] of [['teamA', a], ['teamB', b]]) {
    const name = document.createElement('strong'), points = document.createElement('b');
    name.textContent = teamName(team); name.title = name.textContent; points.textContent = score;
    scoreboard.append(name, points);
  }
  currentDialog.el.querySelector('.dialog-text').prepend(scoreboard);
}
function dialog(title, text, label, action, cancelLabel = t('cancel')) {
  pause(); closeLanguages(); lastFocus = document.activeElement;
  const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  currentDialog = f7.dialog.create({ title: safe(title), text: '<span class="jm-dialog-description">' + safe(text) + '</span>', verticalButtons: true, destroyOnClose: true,
    buttons: [{ text: label, strong: true, onClick: action }, { text: cancelLabel }],
    on: { opened(instance) { instance.el.querySelector('.dialog-button').focus(); }, closed() { currentDialog = null; lastFocus?.focus(); } } });
  currentDialog.el.setAttribute('role', 'dialog'); currentDialog.el.setAttribute('aria-modal', 'true'); currentDialog.el.setAttribute('aria-label', title);
  currentDialog.el.querySelectorAll('.dialog-button').forEach((button, index) => { button.dataset.dialogAction = index ? 'cancel' : 'confirm'; });
  currentDialog.open();
}
function showView(next) {
  if (running || countdown >= 0 || starting || (view === 'sound' && next !== view)) pause();
  view = next; closeLanguages(); f7.tab.show($(`#jm-${view}`), false); render(); $('.jm-scroll').scrollTop = 0;
  globalThis.history.replaceState(null, '', next === 'match' ? location.pathname + location.search : `#${next}`);
  ranges.forEach(range => { range.calcSize(); range.layout(); });
}
function closeLanguages(focus = false) {
  $('#jm-languages').hidden = true; $('[data-action=language-menu]').setAttribute('aria-expanded', 'false');
  if (focus) $('[data-action=language-menu]').focus();
}
function openLanguages() {
  const menu = $('#jm-languages'); menu.hidden = !menu.hidden;
  $('[data-action=language-menu]').setAttribute('aria-expanded', String(!menu.hidden));
  if (!menu.hidden) $(`[data-language-option=${language}]`).focus();
}
function changeStoneCount(delta) {
  if (game.periods === -2 || game.ended || currentDialog?.opened || countdown >= 0) return;
  const next = finishTimedMatch(adjustStones(game, delta, config.direction));
  if (next.consumed === game.consumed && next.ended === game.ended) return;
  pause(); remember(); applyGame(next); persist(); render();
  if (game.ended) showWinner();
}
function showStonePicker() {
  if (game.periods === -2 || game.ended || currentDialog?.opened) return;
  const counter = $('[data-read=stones]'), maximum = Number(counter.max);
  const initial = config.direction === 'down' && finiteMatch(game) ? Math.max(0, game.limit - game.consumed) : game.consumed;
  const selected = counter.validity.valid ? counter.valueAsNumber : initial;
  let picker, syncing = true;
  // Keep only nearby numbers in the wheel, including in unlimited matches.
  const valuesAround = value => {
    const first = Math.max(0, Math.min(maximum - 200, value - 100));
    return Array.from({ length: Math.min(201, maximum + 1) }, (_, index) => String(first + index));
  };
  const setWheel = (instance, value) => {
    const column = instance.cols[0], first = Number(column.values[0]), last = Number(column.values.at(-1));
    syncing = true;
    if ((value < first + 20 && first > 0) || (value > last - 20 && last < maximum)) column.replaceValues(valuesAround(value));
    instance.setValue([String(value)]); syncing = false;
  };
  dialog(counter.getAttribute('aria-label'), '', t('stoneApply'), () => {
    if (!input.reportValidity()) return;
    const value = input.valueAsNumber;
    editor.once('closed', () => { focusMatchButton(); changeStoneCount(value - initial); }); editor.close();
  });
  const editor = currentDialog;
  editor.params.buttons[0].close = false;
  editor.el.classList.add('jm-stone-dialog');
  const content = editor.el.querySelector('.jm-dialog-description');
  content.innerHTML = '<input class="jm-stone-entry" type="number" inputmode="numeric" min="0" step="1" required><div class="jm-stone-wheel"></div>';
  const input = content.querySelector('input'), confirm = editor.el.querySelector('[data-dialog-action=confirm]');
  input.max = counter.max; input.value = selected; input.setAttribute('aria-label', counter.getAttribute('aria-label'));
  const updateValidity = () => { confirm.disabled = !input.validity.valid; };
  input.addEventListener('input', () => {
    updateValidity();
    if (!input.validity.valid || !picker) return;
    setWheel(picker, input.valueAsNumber);
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); if (input.validity.valid) confirm.click(); }
  });
  editor.once('opened', () => {
    picker = f7.picker.create({ containerEl: content.querySelector('.jm-stone-wheel'), toolbar: false, rotateEffect: true,
      value: [String(selected)], cols: [{ values: valuesAround(selected) }],
      on: { change(instance, values) {
        instance.cols[0].el.setAttribute('aria-valuenow', values[0]);
        if (syncing) return;
        input.value = Number(values[0]); updateValidity(); setWheel(instance, Number(values[0]));
      } }
    });
    syncing = false;
    picker.cols.forEach(column => {
      column.el.tabIndex = 0; column.el.setAttribute('role', 'spinbutton');
      column.el.setAttribute('aria-label', counter.getAttribute('aria-label'));
      column.el.setAttribute('aria-valuemin', '0'); column.el.setAttribute('aria-valuemax', counter.max); column.el.setAttribute('aria-valuenow', column.value);
      column.el.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const value = event.key === 'Home' ? 0 : event.key === 'End' ? maximum : clamp(Number(column.value) + (event.key === 'ArrowUp' ? 1 : -1), 0, maximum);
        setWheel(picker, value); input.value = value; updateValidity();
      });
    });
  });
  editor.once('closed', () => picker?.destroy());
}
for (const type of ['contextmenu', 'selectstart', 'dragstart']) {
  root.addEventListener(type, event => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (target && !target.closest('input, textarea, select, [contenteditable], [data-view=info], .jm-legal')) event.preventDefault();
  });
}
root.addEventListener('click', async event => {
  if (event.target.matches('[data-read=stones]')) { showStonePicker(); return; }
  const colorKey = event.target.dataset.setting;
  if (['colorA', 'colorB'].includes(colorKey) && !config[colorKey] && /^#[0-9a-f]{6}$/i.test(event.target.value)) {
    config[colorKey] = event.target.value; rememberTeam(colorKey === 'colorA' ? 'teamA' : 'teamB'); persist(); render(); return;
  }
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  const wasEnded = game.ended; updateSlotClock();
  if (!wasEnded && game.ended) return;
  if (button.dataset.languageOption) { language = button.dataset.languageOption; try { localStorage.setItem('juggermaster:language', language); } catch {} closeLanguages(true); renderLanguage(); render(); persist(); return; }
  if (button.dataset.tab) { showView(button.dataset.tab); return; }
  if (button.dataset.soundTarget) { pause(); soundTarget = button.dataset.soundTarget; soundError = null; render(); ranges.forEach(range => { range.calcSize(); range.layout(); }); return; }
  if (button.dataset.teamColorRemove) {
    const side = button.dataset.teamColorRemove;
    config[side === 'teamA' ? 'colorA' : 'colorB'] = ''; rememberTeam(side); persist(); render(); return;
  }
  if (button.dataset.teamLogoRemove) {
    const side = button.dataset.teamLogoRemove;
    if (!currentTeam(side)) rememberTeam(side);
    const team = currentTeam(side);
    if (team) team.logo = '';
    logoErrors.delete(button.dataset.teamLogoRemove); persist(); render(); return;
  }
  if (button.dataset.teamDelete) {
    const index = teams.findIndex(team => team.name.toLowerCase() === config[button.dataset.teamDelete].toLowerCase());
    if (index < 0) return;
    const [removed] = teams.splice(index, 1), next = teams[index] || teams[0];
    for (const side of ['teamA', 'teamB']) if (config[side].toLowerCase() === removed.name.toLowerCase()) {
      config[side] = next?.name || '';
      config[`${side}Default`] = next?.defaultName || '';
      if (next) config[side === 'teamA' ? 'colorA' : 'colorB'] = next.color;
    }
    render(); persist(); return;
  }
  let action = button.dataset.action;
  if (action === 'toggle') action = game.ended ? 'new' : game.setComplete || (finiteMatch(game) && game.consumed >= game.limit) ? 'next' : 'toggle';
  if (action === 'language-menu') openLanguages();
  else if (action === 'theme') { theme = theme === 'dark' ? 'light' : 'dark'; render(); persist(); }
  else if (action === 'toggle') { if (running || countdown >= 0 || starting) pause(); else await start(); }
  else if (action === 'beat-preview') { if (previewing || starting) pause(); else await startPreview(); }
  else if (action === 'signal-preview') await endSignal();
  else if (action === 'results') showResults();
  else if (action === 'undo') {
    pause(); const deadline = game.deadline; let next = history.pop() || game;
    if (next.periods === -2 && deadline != null) next = advanceTime({ ...next, deadline }, 0);
    applyGame(next);
    persist(); render(); if (game.ended) showWinner();
  }
  else if (action === 'defaults') {
    pause(); config = { ...defaults };
    for (const side of ['teamA', 'teamB']) {
      const team = currentTeam(side);
      if (team) delete team.logo;
      logoErrors.delete(side);
    }
    render(); persist();
  }
  else if (action === 'sound-defaults') { pause(); sound = cleanSound(); config.signalCount = defaults.signalCount; render(); persist(); }
  else if (action === 'use-custom' && customFiles[soundTarget]) await selectSound({ kind: 'custom', pitch: 110, attack: 75, decay: Math.max(.4, customFiles[soundTarget].duration) });
  else if (action === 'delete-custom') {
    pause(); soundBusy = true; render();
    try {
      await deleteAudioFile(soundTarget); customFiles[soundTarget] = null;
      if (editedSound().kind === 'custom') Object.assign(editedSound(), presets.drum);
      soundError = null; persist();
    } catch { soundError = 'customFileFailed'; }
    finally { soundBusy = false; render(); }
  }
  else if (action === 'new') dialog(t('newMatchQuestion'), t('newMatchDescription'), t('newMatch'), resetMatch);
  else if (action === 'next') {
    const sets = setMatch(game), next = nextSection(game);
    if (next === game) return;
    const title = sets ? 'nextSetQuestion' : next.golden ? 'tieQuestion' : next.ended ? 'finishQuestion' : 'nextPeriodQuestion';
    const description = sets ? t('nextSetDescription') : next.golden ? t('goldenDescription') : next.ended ? `${teamName('teamA')} ${game.a} : ${game.b} ${teamName('teamB')}` : t('nextPeriodDescription');
    dialog(t(title), description, t(sets ? 'nextSet' : next.golden ? 'startGolden' : next.ended ? 'confirmResult' : 'startPeriod'), () => {
      updateSlotClock(); if (game.ended) return;
      remember(); applyGame(next); persist(); render();
      currentDialog.once('closed', () => { if (game.ended) showWinner(); else focusMatchButton(); });
      if (!game.ended) start();
    });
    if (next.ended) currentDialog.el.classList.add('jm-result-dialog');
  } else if (action?.startsWith('score-')) {
    const key = action.includes('-a-') ? 'a' : 'b', delta = action.endsWith('plus') ? 1 : -1;
    const next = finishTimedMatch(awardPoint(game, key, delta)); if (next === game) return;
    remember(); if (config.pausePoint || game.golden || next.setComplete) pause(delta < 0);
    applyGame(next); render(); persist();
    if (game.ended) showWinner();
    if (delta > 0) { if (config.hapticPoints) vibrate([70, 40, 70]); if (config.pointSoundEnabled) await endSignal(); }
  } else if (action === 'offline-retry') setupOffline(render);
  else if (action === 'update') { if (running || previewing || countdown >= 0 || starting) return; persist(); if (!await applyUpdate()) { noticeKey = 'updateFailed'; render(); } }
});
document.addEventListener('click', event => { if (!event.target.closest('.jm-language-picker')) closeLanguages(); });
root.addEventListener('keydown', event => {
  if (event.target.matches('[data-read=stones]') && ['Enter', 'Escape'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Escape') event.target.value = config.direction === 'down' && finiteMatch(game) ? Math.max(0, game.limit - game.consumed) : game.consumed;
    event.target.blur(); return;
  }
  if (event.target.matches('[data-sound-target]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const tabs = $$('[data-sound-target]'), current = tabs.indexOf(event.target), rtl = document.documentElement.dir === 'rtl';
    const direction = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + direction + tabs.length) % tabs.length;
    tabs[next].click(); tabs[next].focus(); return;
  }
  if ($('#jm-languages').hidden && event.target.matches('[data-action=language-menu]') && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); openLanguages(); return; }
  if (!$('#jm-languages').hidden) {
    if (event.key === 'Escape') { event.preventDefault(); closeLanguages(true); }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); moveLanguageFocus($$('[data-language-option]'), event.key, document.activeElement); }
    else if (event.key === 'Tab') closeLanguages();
  }
  if (countdownDialog?.opened) {
    if (event.key === 'Escape') { event.preventDefault(); pause(); }
    else if (event.key === 'Tab') event.preventDefault();
    return;
  }
  if (!currentDialog?.opened) return;
  if (event.key === 'Escape') { event.preventDefault(); currentDialog.close(); }
  if (event.key === 'Tab') { const items = currentDialog.el.querySelectorAll('input:not(:disabled), .dialog-button:not(:disabled), [tabindex="0"]'), first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
});
root.addEventListener('change', event => {
  const input = event.target, key = input.dataset.setting;
  const side = input.dataset.teamChoice || (['teamA', 'colorA'].includes(key) ? 'teamA' : ['teamB', 'colorB'].includes(key) ? 'teamB' : null);
  if (!side) return;
  const name = (input.dataset.teamChoice ? input.value : config[side]).toLowerCase();
  const saved = teams.find(team => team.name.toLowerCase() === name) || (!input.dataset.teamChoice && teams.find(team => savedTeamName(team).toLowerCase() === name));
  if (input.dataset.teamChoice && !saved) return;
  if (saved && (input.dataset.teamChoice || key === side)) {
    config[side] = saved.name; config[side === 'teamA' ? 'colorA' : 'colorB'] = saved.color;
    config[`${side}Default`] = saved.defaultName || '';
  }
  rememberTeam(side); render(); persist();
});
root.addEventListener('change', async event => {
  const input = event.target;
  if (input.matches('[data-read=stones]')) {
    if (input.validity.valid && Number.isInteger(input.valueAsNumber)) {
      const displayed = config.direction === 'down' && finiteMatch(game) ? Math.max(0, game.limit - game.consumed) : game.consumed;
      changeStoneCount(input.valueAsNumber - displayed);
    }
    render(); return;
  }
  if (input.dataset.teamLogoFile && input.files.length) {
    const side = input.dataset.teamLogoFile, file = input.files[0];
    rememberTeam(side); const team = currentTeam(side);
    if (!team || logoBusy.has(side)) return;
    logoBusy.add(side); logoErrors.delete(side); render();
    try {
      const logo = await importTeamLogo(file);
      if (teams.includes(team)) { team.logo = logo; persist(); }
    } catch { logoErrors.add(side); }
    finally { input.value = ''; logoBusy.delete(side); render(); }
    return;
  }
  if (input.dataset.sound) {
    if (view !== 'sound' || document.hidden || soundBusy) return;
    if (soundTarget === 'beat') return;
    pause(); soundError = null; const token = requestId, target = soundTarget; render();
    const unlocked = await unlockAudio(sound, target);
    if (token !== requestId) return;
    if (unlocked) playBeat(sound, audioTime(), target === 'signal');
    else { soundError = 'audioFailed'; render(); }
    return;
  }
  if (input.matches('[data-instrument]') && Object.hasOwn(presets, input.value)) { await selectSound(presets[input.value]); return; }
  if (input.matches('[data-instrument]') && Object.hasOwn(instruments, input.value)) {
    const instrument = input.value;
    await selectSound({ kind: 'spessa', instrument, pitch: 110, attack: 75, decay: instruments[instrument].decay });
    return;
  }
  if (!input.matches('[data-audio-file]') || !input.files.length) return;
  const file = input.files[0], target = soundTarget;
  pause(); soundBusy = true; soundError = null; render();
  try {
    const duration = await importAudioFile(target, file);
    customFiles[target] = { name: file.name, duration };
    Object.assign(target === 'beat' ? sound : sound.end, { kind: 'custom', pitch: 110, attack: 75, decay: duration });
    persist();
  } catch (error) {
    console.warn('Audio import failed:', error.cause?.name || error.name, error.cause?.message || error.message);
    soundError = 'customFileFailed';
  }
  finally { input.value = ''; soundBusy = false; render(); }
});
root.addEventListener('input', event => {
  if (updatingRanges) return;
  const input = event.target;
  if (input.matches('[data-read=stones]')) {
    $('.jm-stones').style.setProperty('--jm-stone-digits', String(Math.max(1, input.value.length))); return;
  }
  if (input.dataset.sound) {
    const value = Number(input.value); if (!Number.isFinite(value)) return;
    (profileKeys.includes(input.dataset.sound) ? editedSound() : sound)[input.dataset.sound] = clamp(value, Number(input.min), Number(input.max));
    render(); persist();
    if (soundTarget === 'beat' && input.dataset.sound !== 'signalVolume') startPreview();
  }
  if (input.dataset.setting) {
    const key = input.dataset.setting;
    if (['teamA', 'teamB'].includes(key)) { config[key] = input.value.trim().slice(0, 255); config[`${key}Default`] = ''; }
    else if (['colorA', 'colorB'].includes(key)) { if (/^#[0-9a-f]{6}$/i.test(input.value)) config[key] = input.value; }
    else if (input.type === 'checkbox') { config[key] = input.checked; if (['hapticStones', 'hapticPoints'].includes(key) && !input.checked) vibrate(0); }
    else if (key === 'direction') config[key] = input.value;
    else {
      const value = Number(input.value); if (!Number.isFinite(value) || input.value === '') return;
      if (key === 'periods') { if (![-2, -1, 0, 2].includes(value)) return; config[key] = value; }
      else config[key] = key === 'pace' ? clamp(value, .5, 3) : clamp(Math.round(value), Number(input.min), Number(input.max));
      if (key === 'pace' && previewing) previewClock.interval = config.pace;
    }
    render(); persist();
  }
});
root.addEventListener('focusin', event => {
  if (event.target.matches('[data-read=stones]')) { pause(); event.target.select(); }
});
root.addEventListener('focusout', event => { if (event.target.dataset.setting || event.target.matches('[data-read=stones]')) render(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (running || previewing || countdown >= 0)) pause();
  else if (document.hidden) { requestId++; stopAudio(); }
  updateSlotClock(); if (!document.hidden && slotActive()) keepAwake();
});
window.addEventListener('pagehide', () => pause());
window.addEventListener('online', () => { render(); setupOffline(render); });
window.addEventListener('offline', render);
$('.jm-wave').replaceChildren(...Array.from({ length: 34 }, () => document.createElement('span')));
renderLanguage(); render();
for (const target of ['beat', 'signal']) audioFile(target).then(saved => {
  if (saved?.file) customFiles[target] = { name: saved.file.name, duration: saved.duration };
  render();
}).catch(() => {});
$$('.jm-range').forEach(input => {
  const wrapper = document.createElement('div'); wrapper.className = 'jm-range-wrap range-slider'; input.before(wrapper); wrapper.append(input);
  const range = f7.range.create({ el: wrapper, draggableBar: false, min: Number(input.min), max: Number(input.max), step: Number(input.step) || 1, value: Number(input.value),
    on: { change(instance, value) { if (Number(input.value) === value) return; input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); } } });
  ranges.set(input, range);
});
setText('version', '__VERSION__');
app.dataset.ready = 'true'; app.inert = false; app.removeAttribute('aria-busy');
setupOffline(render);
const matchLayout = new ResizeObserver(() => requestAnimationFrame(fitMatch));
['.jm-scroll', '[data-view=match]', '.jm-update', '.jm-offline'].forEach(selector => matchLayout.observe($(selector)));
fitMatch();
setInterval(updateSlotClock, 100);
updateSlotClock(); if (slotActive()) keepAwake();
console.assert(Object.values(texts).every(value => JSON.stringify(Object.keys(value).sort()) === JSON.stringify(Object.keys(texts.de).sort())), 'Übersetzungen vollständig');
