import { defaults, defaultSound, presets, clamp, finiteMatch, setMatch, remainingTime, advanceTime, matchWinner, newGame, awardPoint, nextSection, finishTimedMatch, adjustStones, restoreSnapshot } from './core.mjs';
import { texts, translate } from './i18n.mjs';
import { locales, resolveLanguage, moveLanguageFocus } from './locale.mjs';
import { BeatClock } from './clock.mjs';
import { unlockAudio, audioTime, playBeat, playEndSignal, stopAudio, onAudioInterruption } from './audio.mjs';
import { setupOffline, applyUpdate, offlineState } from './offline.mjs';

const root = document.getElementById('jm-arena'), app = root.querySelector('.jm-app');
const $ = selector => root.querySelector(selector), $$ = selector => [...root.querySelectorAll(selector)];
const storageKey = 'juggermaster:state:v2';
let config = { ...defaults }, sound = { ...defaultSound }, game = newGame(config), history = [], teams = [];
let language = 'de', theme = 'dark', view = ['info', 'sound', 'setup'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'match', running = false, starting = false, previewing = false;
let countdown = -1, requestId = 0, currentDialog = null, lastFocus = null, wakeLock = null;
let noticeKey = null, lastSave = '', storageError = false, freshState = true;
let stoneHold = null, ignoreStoneClick = null;
const ranges = new Map(), t = (key, values) => translate(language, key, values);
const decimal = value => Number(value).toLocaleString(locales[language].tag, { maximumFractionDigits: 1 });
const time = milliseconds => { const seconds = Math.floor(milliseconds / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const snapshot = JSON.parse(saved), restored = restoreSnapshot(snapshot);
    if (!restored) throw Error('Invalid saved match');
    ({ config, sound, game, history, language, theme, teams } = restored);
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
  const json = JSON.stringify({ version: 2, language, theme, config, sound, game, history, teams });
  if (json === lastSave) return;
  try { localStorage.setItem(storageKey, json); lastSave = json; storageError = false; }
  catch { storageError = true; noticeKey = 'storageFailed'; }
}

function remember() { history.push({ ...game }); if (history.length > 30) history.shift(); }
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
function setLocalizedText(element, text) {
  element.replaceChildren(...text.split(/(JUGGERMASTER)/).map(part => {
    if (part !== 'JUGGERMASTER') return part;
    const name = document.createElement('strong'); name.textContent = part; return name;
  }));
}

function renderLanguage() {
  $$('.jm-document [data-locale]').forEach(section => { section.hidden = section.dataset.locale !== language; });
  $$('[data-home-steps]').forEach(list => list.replaceChildren(...t(list.dataset.homeSteps).split('\n').map(text => { const item = document.createElement('li'); setLocalizedText(item, text); return item; })));
  root.lang = language; document.documentElement.lang = language; document.documentElement.dir = locales[language].dir || 'ltr';
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
  setText('stones', config.direction === 'down' && finite ? remaining : game.consumed);
  $('.jm-counter').hidden = timedSets;
  $('[data-read=match-clock]').hidden = !timedSets;
  setText('remaining-time', time(Math.ceil(remainingTime(game) / 1000) * 1000));
  setText('caption', t(timedSets ? 'timeRemaining' : config.direction === 'down' && finite ? 'stonesLeft' : 'stonesPlayed'));
  const track = $('.jm-track'); track.hidden = !finite;
  track.setAttribute('aria-valuemax', game.limit); track.setAttribute('aria-valuenow', remaining);
  track.firstElementChild.style.width = `${remaining / game.limit * 100}%`;
  for (const [label, side] of [['team-a', 'teamA'], ['team-b', 'teamB']]) {
    setText(label, teamName(side).toLocaleUpperCase(language)); $(`[data-read=${label}]`).title = teamName(side);
  }
  setText('score-a', game.a); setText('score-b', game.b);
  $$('.jm-team').forEach((team, index) => team.style.setProperty('--jm-team-color', index ? config.colorB : config.colorA));
  setText('elapsed', time(game.elapsed)); setText('period-time', time(game.periodTime)); setText('playtime', time(game.playtime)); setText('pace', `${decimal(config.pace)} s`);
  const blocked = game.ended || game.setComplete, nextSetReady = setMatch(game) && game.setComplete && !game.ended;
  $('[data-action=score-a-plus]').disabled = blocked; $('[data-action=score-b-plus]').disabled = blocked;
  $('[data-action=score-a-minus]').disabled = blocked || !game.a; $('[data-action=score-b-minus]').disabled = blocked || !game.b;
  $('[data-action=stone-minus]').disabled = timedSets || (config.direction === 'down' && finite ? remaining : game.consumed) === 0 || game.ended;
  $('[data-action=stone-plus]').disabled = timedSets || game.ended;
  $('[data-action=toggle]').disabled = !game.ended && blocked && !nextSetReady;
  setText('start-label', t(countdown >= 0 ? 'cancelCountdown' : running ? 'pauseMatch' : game.ended ? 'newMatch' : nextSetReady ? 'nextSet' : complete ? sectionLabel : game.period === 1 && (timedSets ? game.elapsed === 0 : game.consumed === 0) && !game.golden ? 'startMatch' : 'resumeMatch'));
  $('[data-action=toggle] [data-icon=play]').toggleAttribute('hidden', running || countdown >= 0);
  $('[data-action=toggle] [data-icon=pause]').toggleAttribute('hidden', !running && countdown < 0);
  $('[data-action=undo]').disabled = !history.length;
  $('[data-read=countdown]').hidden = countdown < 0;
  if (countdown >= 0) setText('countdown', [t('attention'), '3', '2', '1', t('jugg')][countdown]);
  $('[data-read=sets]').hidden = !setMatch(game);
  setText('sets', t('setsScore', { a: game.setsA, b: game.setsB }));
  $$('[data-view]').forEach(element => { element.hidden = element.dataset.view !== view; element.classList.toggle('tab-active', element.dataset.view === view); });
  $$('[data-tab]').forEach(element => {
    element.classList.toggle('tab-link-active', element.dataset.tab === view);
    if (element.dataset.tab === view) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
  });
  $$('[data-setting]').forEach(input => { if (input === document.activeElement) return; const key = input.dataset.setting, value = ['teamA', 'teamB'].includes(key) ? configuredTeamName(key) : config[key]; if (input.type === 'checkbox') input.checked = value; else input.value = value; });
  $$('[data-team-choice]').forEach(select => {
    if (view !== 'setup' || select === document.activeElement) return;
    select.replaceChildren(new Option(t('chooseTeam'), ''), ...teams.map(team => new Option(savedTeamName(team), team.name)));
    const saved = teams.find(team => team.name === config[select.dataset.teamChoice] && team.color.toLowerCase() === config[select.dataset.teamChoice === 'teamA' ? 'colorA' : 'colorB'].toLowerCase());
    select.value = saved?.name || '';
  });
  $$('[data-team-delete]').forEach(button => { button.disabled = !teams.some(team => team.name.toLowerCase() === config[button.dataset.teamDelete].toLowerCase()); });
  $('[data-read=set-settings]').hidden = !setMatch(config);
  $('[data-setting=setsToWin]').closest('.jm-field').hidden = !setMatch(config);
  $('[data-setting=minutes]').closest('.jm-field').hidden = config.periods !== -2;
  $('[data-setting=limit]').closest('.jm-fields-pair').hidden = !finiteMatch(config);
  $('[data-setting=rounds]').closest('.jm-field').hidden = config.periods <= 0;
  $('[data-setting=direction]').closest('.jm-field').hidden = !finiteMatch(config);
  $('[data-i18n=timedSetDescription]').hidden = config.periods !== -2;
  $('[data-output=pace]').textContent = `${decimal(config.pace)} s`;
  $$('[data-sound]').forEach(input => { if (input.type === 'checkbox') input.checked = sound[input.dataset.sound]; else input.value = sound[input.dataset.sound]; });
  for (const key of ['pitch', 'metal', 'attack', 'decay', 'volume', 'signalVolume']) $(`[data-output=${key}]`).textContent = `${decimal(sound[key])}${key === 'pitch' ? ' Hz' : key === 'decay' ? ' s' : ' %'}`;
  ranges.forEach((range, input) => { if (range.getValue() !== Number(input.value)) range.setValue(Number(input.value)); });
  $$('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(presets[button.dataset.preset].kind === sound.kind)));
  $('[data-action=beat-preview]').setAttribute('aria-pressed', String(previewing));
  $('[data-i18n=previewBeat]').textContent = t(previewing ? 'stopBeat' : 'previewBeat');
  $$('.jm-wave span').forEach((bar, index) => { bar.style.height = `${6 + Math.abs(Math.sin(index * 1.9 + sound.pitch / 60)) * 40 * Math.exp(-index / (sound.decay * 7 + 4))}px`; });
  const notice = $('[data-read=notice]'); notice.hidden = !noticeKey; if (noticeKey) notice.textContent = t(noticeKey);
  $('[data-read=offline]').textContent = t(offlineState.status === 'ready' ? navigator.onLine ? 'offlineReady' : 'offlineUsing' : offlineState.status === 'unsupported' ? 'offlineUnsupported' : offlineState.status === 'error' ? 'offlineFailed' : 'offlineLoading');
  $('.jm-offline').hidden = offlineState.status === 'ready';
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
  playEndSignal(sound, config.signalCount);
}
function updateSlotClock() {
  if (!slotActive()) return;
  const next = advanceTime(game, 0);
  if (next.ended) remember();
  game = next;
  if (game.ended) announceTimeEnd();
  render();
}
const interrupted = () => { if (running || previewing || countdown >= 0) pause(); };
onAudioInterruption(interrupted);
const matchClock = new BeatClock({ now: audioTime,
  schedule({ at, index }) {
    if (countdown >= 0) { if (config.beatEnabled) playBeat(sound, at); }
    else if (config.beatEnabled && (!finiteMatch(game) || startConsumed + index < game.limit)) playBeat(sound, at);
  },
  frame(seconds) {
    if (!running || countdown >= 0) return;
    const next = advanceTime(game, seconds * 1000);
    if (next.ended) remember();
    game = next;
    if (game.ended) announceTimeEnd();
    render();
  },
  tick({ index }) {
    if (countdown >= 0) {
      countdown = index - 1;
      if (index === 5) { countdown = -1; beginMatchClock(); }
      render(); return;
    }
    if (game.periods === -2) { persist(); return; }
    const next = finishTimedMatch({ ...game, consumed:game.consumed + 1 });
    if (next.ended) remember();
    game = next;
    if (finiteMatch(game) && game.consumed >= game.limit) {
      pause(false); if (game.ended) showWinner(); playEndSignal(sound, config.signalCount);
    }
    persist(); render();
  }, interrupted });
let startConsumed = 0;
const previewClock = new BeatClock({ now: audioTime, schedule: ({ at }) => playBeat(sound, at), interrupted });
function beginMatchClock() {
  if (game.periods === -2 && game.deadline == null) { game = { ...game, deadline: Date.now() + remainingTime(game) }; persist(); }
  running = true; startConsumed = game.consumed; matchClock.start(config.pace);
}
function pause(silence = true) {
  requestId++; running = false; starting = false; countdown = -1; previewing = false;
  matchClock.stop(); previewClock.stop(); stopAudio(!silence); if (!slotActive()) releaseWake(); persist(); render();
}
async function start() {
  if (starting || running || countdown >= 0 || game.ended || game.setComplete || (finiteMatch(game) && game.consumed >= game.limit)) return;
  pause(); const token = ++requestId; starting = true;
  const unlocked = await unlockAudio();
  if (token !== requestId || view !== 'match') return;
  starting = false;
  if (!unlocked && (config.beatEnabled || sound.signalVolume)) { noticeKey = 'audioFailed'; render(); return; }
  if (config.countdown) { countdown = 0; matchClock.start(config.pace, true); }
  else beginMatchClock();
  render(); keepAwake(); navigator.storage?.persist?.().catch(() => {});
}
async function togglePreview() {
  if (previewing) { pause(); return; }
  pause(); const token = ++requestId; starting = true;
  const unlocked = await unlockAudio();
  if (token !== requestId) return;
  starting = false;
  if (!unlocked) { noticeKey = 'audioFailed'; render(); return; }
  previewing = true; previewClock.start(config.pace, true); render(); keepAwake();
}
async function endSignal() { const token = requestId; if (sound.signalVolume && await unlockAudio() && token === requestId) playEndSignal(sound, config.signalCount); }
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
  rememberTeam('teamA'); rememberTeam('teamB');
  history = []; game = newGame(config); noticeKey = storageError ? 'storageFailed' : null; persist(); showView('match');
  currentDialog.once('closed', focusMatchButton);
  start();
}
function showWinner() {
  const sets = setMatch(game), a = sets ? game.setsA : game.a, b = sets ? game.setsB : game.b;
  const winnerSide = matchWinner(game), team = teamName(winnerSide === 'a' ? 'teamA' : 'teamB');
  const resultKey = winnerSide ? 'matchResult' : 'drawResult';
  dialog(t('matchEnded'), t(resultKey, { team, a, b }), t('startNewMatch'), resetMatch, t('close'));
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
  stopStoneHold(true);
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
  stopStoneHold(true);
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
function stopStoneHold(suppressClick = false) {
  if (!stoneHold) return;
  clearTimeout(stoneHold.timer);
  if (suppressClick && stoneHold.repeated) ignoreStoneClick = stoneHold.button;
  stoneHold = null;
}
root.addEventListener('pointerdown', event => {
  stopStoneHold(); ignoreStoneClick = null;
  const button = event.target.closest('[data-action=stone-minus], [data-action=stone-plus]');
  if (!button || button.disabled || event.button !== 0 || !event.isPrimary) return;
  const hold = stoneHold = { button, pointer: event.pointerId, started: performance.now(), repeated: false };
  const repeat = () => {
    if (stoneHold !== hold || button.disabled) { stopStoneHold(true); return; }
    hold.repeated = true; button.click();
    if (stoneHold === hold) hold.timer = setTimeout(repeat, Math.max(45, 260 - (performance.now() - hold.started) / 8));
  };
  button.setPointerCapture(event.pointerId);
  hold.timer = setTimeout(repeat, 400);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(type, event => {
  if (stoneHold?.pointer === event.pointerId) stopStoneHold(true);
});
for (const type of ['contextmenu', 'selectstart', 'dragstart']) {
  root.addEventListener(type, event => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (target && !target.closest('input, textarea, select, [contenteditable], [data-view=info], .jm-legal')) event.preventDefault();
  });
}
root.addEventListener('click', event => {
  if (ignoreStoneClick && event.detail && event.target.closest('button') === ignoreStoneClick) {
    ignoreStoneClick = null; event.preventDefault(); event.stopImmediatePropagation();
  }
}, true);
window.addEventListener('blur', () => stopStoneHold(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) stopStoneHold(true); });
root.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  const wasEnded = game.ended; updateSlotClock();
  if (!wasEnded && game.ended) return;
  if (button.dataset.languageOption) { language = button.dataset.languageOption; try { localStorage.setItem('juggermaster:language', language); } catch {} closeLanguages(true); renderLanguage(); render(); persist(); return; }
  if (button.dataset.tab) { showView(button.dataset.tab); return; }
  if (button.dataset.preset) { stopAudio(true); Object.assign(sound, presets[button.dataset.preset]); if (previewing) previewClock.start(config.pace, true); else await togglePreview(); render(); persist(); return; }
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
  else if (action === 'beat-preview') await togglePreview();
  else if (action === 'signal-preview') await endSignal();
  else if (action === 'undo') {
    pause(); const deadline = game.deadline; game = history.pop() || game;
    if (game.periods === -2 && deadline != null) game = advanceTime({ ...game, deadline }, 0);
    persist(); render(); if (game.ended) showWinner();
  }
  else if (action === 'defaults') { pause(); config = { ...defaults }; render(); persist(); }
  else if (action === 'sound-defaults') { pause(); sound = { ...defaultSound }; config.signalCount = defaults.signalCount; render(); persist(); }
  else if (action === 'new') dialog(t('newMatchQuestion'), t('newMatchDescription'), t('startNewMatch'), resetMatch);
  else if (action === 'next') {
    const sets = setMatch(game), next = nextSection(game);
    if (next === game) return;
    const title = sets ? 'nextSetQuestion' : next.golden ? 'tieQuestion' : next.ended ? 'finishQuestion' : 'nextPeriodQuestion';
    const description = sets ? t('nextSetDescription') : next.golden ? t('goldenDescription') : next.ended ? `${teamName('teamA')} ${game.a} : ${game.b} ${teamName('teamB')}` : t('nextPeriodDescription');
    dialog(t(title), description, t(sets ? 'nextSet' : next.golden ? 'startGolden' : next.ended ? 'confirmResult' : 'startPeriod'), () => {
      updateSlotClock(); if (game.ended) return;
      remember(); game = next; persist(); render();
      currentDialog.once('closed', () => { if (game.ended) showWinner(); else focusMatchButton(); });
      if (!game.ended) start();
    });
    if (next.ended) currentDialog.el.classList.add('jm-result-dialog');
  } else if (action?.startsWith('score-')) {
    const key = action.includes('-a-') ? 'a' : 'b', delta = action.endsWith('plus') ? 1 : -1;
    const next = finishTimedMatch(awardPoint(game, key, delta)); if (next === game) return;
    remember(); if (config.pausePoint || game.golden || next.setComplete) pause(delta < 0);
    game = next; render(); persist();
    if (game.ended) showWinner();
    if (delta > 0) await endSignal();
  } else if (action === 'stone-minus' || action === 'stone-plus') {
    pause(); remember(); game = finishTimedMatch(adjustStones(game, action === 'stone-plus' ? 1 : -1, config.direction));
    persist(); render(); if (game.ended) showWinner();
  } else if (action === 'offline-retry') setupOffline(render);
  else if (action === 'update') { if (running || previewing || countdown >= 0 || starting) return; persist(); if (!await applyUpdate()) { noticeKey = 'updateFailed'; render(); } }
});
document.addEventListener('click', event => { if (!event.target.closest('.jm-language-picker')) closeLanguages(); });
root.addEventListener('keydown', event => {
  if ($('#jm-languages').hidden && event.target.matches('[data-action=language-menu]') && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); openLanguages(); return; }
  if (!$('#jm-languages').hidden) {
    if (event.key === 'Escape') { event.preventDefault(); closeLanguages(true); }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); moveLanguageFocus($$('[data-language-option]'), event.key, document.activeElement); }
    else if (event.key === 'Tab') closeLanguages();
  }
  if (!currentDialog?.opened) return;
  if (event.key === 'Escape') { event.preventDefault(); currentDialog.close(); }
  if (event.key === 'Tab') { const a = $('[data-dialog-action=confirm]'), b = $('[data-dialog-action=cancel]'); if (event.shiftKey && document.activeElement === a) { event.preventDefault(); b.focus(); } else if (!event.shiftKey && document.activeElement === b) { event.preventDefault(); a.focus(); } }
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
root.addEventListener('input', event => {
  const input = event.target;
  if (input.dataset.sound) {
    if (input.type === 'checkbox') sound[input.dataset.sound] = input.checked;
    else { const value = Number(input.value); if (!Number.isFinite(value)) return; sound[input.dataset.sound] = clamp(value, Number(input.min), Number(input.max)); }
    render(); persist();
  }
  if (input.dataset.setting) {
    const key = input.dataset.setting;
    if (['teamA', 'teamB'].includes(key)) { config[key] = input.value.trim().slice(0, 255); config[`${key}Default`] = ''; }
    else if (['colorA', 'colorB'].includes(key)) { if (/^#[0-9a-f]{6}$/i.test(input.value)) config[key] = input.value; }
    else if (input.type === 'checkbox') config[key] = input.checked;
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
root.addEventListener('focusout', event => { if (event.target.dataset.setting) render(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (running || previewing || countdown >= 0)) pause();
  updateSlotClock(); if (!document.hidden && slotActive()) keepAwake();
});
window.addEventListener('pagehide', () => pause());
window.addEventListener('online', () => { render(); setupOffline(render); });
window.addEventListener('offline', render);
$('.jm-wave').replaceChildren(...Array.from({ length: 34 }, () => document.createElement('span')));
renderLanguage(); render();
$$('.jm-range').forEach(input => {
  const wrapper = document.createElement('div'); wrapper.className = 'jm-range-wrap range-slider'; input.before(wrapper); wrapper.append(input);
  const range = f7.range.create({ el: wrapper, draggableBar: false, min: Number(input.min), max: Number(input.max), step: Number(input.step) || 1, value: Number(input.value),
    on: { change(instance, value) { if (Number(input.value) === value) return; input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); } } });
  ranges.set(input, range);
});
setText('version', '__VERSION__');
app.dataset.ready = 'true'; app.inert = false; app.removeAttribute('aria-busy');
setupOffline(render);
const matchLayout = new ResizeObserver(fitMatch);
['.jm-scroll', '[data-view=match]', '.jm-update', '.jm-offline'].forEach(selector => matchLayout.observe($(selector)));
fitMatch();
setInterval(updateSlotClock, 100);
updateSlotClock(); if (slotActive()) keepAwake();
console.assert(Object.values(texts).every(value => JSON.stringify(Object.keys(value).sort()) === JSON.stringify(Object.keys(texts.de).sort())), 'Übersetzungen vollständig');
