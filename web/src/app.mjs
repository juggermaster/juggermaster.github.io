import { defaults, defaultSound, presets, clamp, finiteMatch, newGame, awardPoint, nextSection, adjustStones, restoreSnapshot } from './core.mjs';
import { texts, translate } from './i18n.mjs';
import { locales, resolveLanguage, moveLanguageFocus } from './locale.mjs';
import { BeatClock } from './clock.mjs';
import { unlockAudio, audioTime, playBeat, playEndSignal, stopAudio, onAudioInterruption } from './audio.mjs';
import { setupOffline, applyUpdate, offlineState } from './offline.mjs';

const root = document.getElementById('jm-arena'), app = root.querySelector('.jm-app');
const fullscreenRequest = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
const fullscreenAvailable = !!fullscreenRequest && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false;
const $ = selector => root.querySelector(selector), $$ = selector => [...root.querySelectorAll(selector)];
const storageKey = 'juggermaster:state:v1';
let config = { ...defaults }, sound = { ...defaultSound }, game = newGame(config), history = [];
let language = 'de', theme = '', view = ['info', 'sound', 'setup'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'match', running = false, starting = false, previewing = false;
let countdown = -1, requestId = 0, currentDialog = null, lastFocus = null, wakeLock = null;
let noticeKey = null, lastSave = '', storageError = false;
const ranges = new Map(), t = (key, values) => translate(language, key, values);
const decimal = value => Number(value).toLocaleString(locales[language].tag, { maximumFractionDigits: 1 });
const time = milliseconds => { const seconds = Math.floor(milliseconds / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const restored = restoreSnapshot(JSON.parse(saved));
    if (!restored) throw Error('Invalid saved match');
    ({ config, sound, game, history, language, theme } = restored);
    if (game.consumed || game.a || game.b || game.elapsed) noticeKey = 'restored';
  }
  const preferred = localStorage.getItem('juggermaster:language');
  language = resolveLanguage(navigator.languages || [navigator.language], preferred);
} catch { noticeKey = 'restoreFailed'; }
if (noticeKey === 'restoreFailed') language = resolveLanguage(navigator.languages || [navigator.language]);

if (!globalThis.Framework7) throw Error('Framework7 konnte nicht geladen werden.');
const f7 = new Framework7({ el: app, name: 'JuggerMaster', theme: 'ios', darkMode: false,
  dialog: { closeByBackdropClick: false }, touch: { fastClicks: false, tapHold: false } });

function persist() {
  const json = JSON.stringify({ version: 1, language, theme, config, sound, game, history });
  if (json === lastSave) return;
  try { localStorage.setItem(storageKey, json); lastSave = json; storageError = false; }
  catch { storageError = true; noticeKey = 'storageFailed'; }
}
async function enterFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement || matchMedia('(display-mode: fullscreen)').matches) return;
  try { await fullscreenRequest.call(document.documentElement, { navigationUI: 'hide' }); }
  catch { noticeKey = 'fullscreenFailed'; render(); }
}
function remember() { history.push({ ...game }); if (history.length > 30) history.shift(); }
function setText(name, value) { $(`[data-read="${name}"]`).textContent = value; }

function renderLanguage() {
  root.lang = language; document.documentElement.lang = language; document.documentElement.dir = locales[language].dir || 'ltr';
  $$('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-aria]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  $('[data-read=language-flag]').dataset.language = language;
  $('[data-read=language-flag]').src = new URL(`./images/flag-${locales[language].flag}.svg`, import.meta.url).href;
  $$('[data-language-option]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.languageOption === language)));
}
function phase() {
  if (game.ended) return t('matchEnded');
  if (game.golden) return t('goldenJugg');
  if (game.periods === 0) return t('freeDrumming');
  return t(game.periods === -1 ? 'setNumber' : game.periods === 3 ? 'third' : 'half', { number: game.period });
}
function render() {
  $('[data-action=fullscreen]').hidden = !fullscreenAvailable;
  const finite = finiteMatch(game), remaining = Math.max(0, game.limit - game.consumed);
  const complete = finite && remaining === 0;
  app.style.colorScheme = theme;
  setText('format', game.periods === -1 ? t('setFormat', { sets: game.setsToWin, points: game.targetPoints }) : game.periods === 0 ? t('freeFormat') : t('limitedFormat', { periods: game.periods, limit: game.limit }));
  setText('phase', phase());
  setText('status', t(game.ended ? 'statusEnded' : countdown >= 0 ? 'counting' : running ? 'statusRunning' : 'statusPaused'));
  $('[data-read=status]').dataset.running = String(running || countdown >= 0);
  setText('stones', config.direction === 'down' && finite ? remaining : game.consumed);
  setText('caption', t(config.direction === 'down' && finite ? 'stonesLeft' : 'stonesPlayed'));
  const track = $('.jm-track'); track.hidden = !finite;
  track.setAttribute('aria-valuemax', game.limit); track.setAttribute('aria-valuenow', remaining);
  track.firstElementChild.style.width = `${remaining / game.limit * 100}%`;
  setText('team-a', config.teamA.toLocaleUpperCase(language)); setText('team-b', config.teamB.toLocaleUpperCase(language));
  setText('score-a', game.a); setText('score-b', game.b);
  $$('.jm-team').forEach((team, index) => team.style.setProperty('--jm-team-color', index ? config.colorB : config.colorA));
  setText('elapsed', time(game.elapsed)); setText('period-time', time(game.periodTime)); setText('playtime', time(game.playtime)); setText('pace', `${decimal(config.pace)} s`);
  const blocked = game.ended || game.setComplete, nextSetReady = game.periods === -1 && game.setComplete && !game.ended;
  $('[data-action=score-a-plus]').disabled = blocked; $('[data-action=score-b-plus]').disabled = blocked;
  $('[data-action=score-a-minus]').disabled = blocked || !game.a; $('[data-action=score-b-minus]').disabled = blocked || !game.b;
  $('[data-action=stone-minus]').disabled = (config.direction === 'down' && finite ? remaining : game.consumed) === 0 || game.ended;
  $('[data-action=stone-plus]').disabled = game.ended;
  $('[data-action=toggle]').disabled = (blocked && !nextSetReady) || complete;
  setText('start-label', t(countdown >= 0 ? 'cancelCountdown' : running ? 'pauseMatch' : game.ended ? 'matchEnded' : nextSetReady ? 'nextSet' : game.period === 1 && game.consumed === 0 && !game.golden ? 'startMatch' : 'resumeMatch'));
  $('[data-action=toggle] .jm-symbol').textContent = running || countdown >= 0 ? 'Ⅱ' : '▶';
  $('[data-action=undo]').disabled = !history.length;
  $('[data-action=next]').disabled = game.ended || game.golden || game.periods === 0 || (game.periods === -1 && !game.setComplete);
  $('[data-action=next] [data-i18n=period]').textContent = t(game.periods === -1 ? 'nextSet' : 'period');
  $('[data-read=countdown]').hidden = countdown < 0;
  if (countdown >= 0) setText('countdown', [t('attention'), '3', '2', '1', t('jugg')][countdown]);
  $('[data-read=result]').hidden = !game.ended && !game.setComplete;
  if (game.ended) setText('result', t('matchResult', { team: (game.periods === -1 ? game.setsA > game.setsB : game.a > game.b) ? config.teamA : config.teamB, a: game.periods === -1 ? game.setsA : game.a, b: game.periods === -1 ? game.setsB : game.b }));
  else if (game.setComplete) setText('result', t('setEnded'));
  $('[data-read=sets]').hidden = game.periods !== -1;
  setText('sets', t('setsScore', { a: game.setsA, b: game.setsB }));
  $$('[data-view]').forEach(element => { element.hidden = element.dataset.view !== view; element.classList.toggle('tab-active', element.dataset.view === view); });
  $$('[data-tab]').forEach(element => {
    element.classList.toggle('tab-link-active', element.dataset.tab === view);
    if (element.dataset.tab === view) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
  });
  $$('[data-setting]').forEach(input => { if (input === document.activeElement) return; const value = config[input.dataset.setting]; if (input.type === 'checkbox') input.checked = value; else input.value = value; });
  $('[data-read=set-settings]').hidden = config.periods !== -1;
  $('[data-setting=limit]').closest('.jm-fields-pair').hidden = config.periods <= 0;
  $('[data-output=pace]').textContent = `${decimal(config.pace)} s`;
  $$('[data-sound]').forEach(input => { input.value = sound[input.dataset.sound]; });
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
  const token = requestId;
  try {
    if (!navigator.wakeLock) throw Error('Wake lock unavailable');
    const lock = await navigator.wakeLock.request('screen');
    if (token !== requestId || (!running && !previewing && countdown < 0)) { await lock.release(); return; }
    wakeLock = lock;
    lock.addEventListener('release', () => {
      if (wakeLock === lock) wakeLock = null;
      if (!document.hidden && (running || previewing || countdown >= 0)) { noticeKey = 'wakeFailed'; render(); }
    });
  } catch { if (running || previewing || countdown >= 0) { noticeKey = 'wakeFailed'; render(); } }
}
function releaseWake() { const lock = wakeLock; wakeLock = null; lock?.release().catch(() => {}); }
const interrupted = () => { if (running || previewing || countdown >= 0) pause(); };
onAudioInterruption(interrupted);
const matchClock = new BeatClock({ now: audioTime,
  schedule({ at, index }) {
    if (countdown >= 0) { if (config.beatEnabled) playBeat(sound, at); }
    else if (config.beatEnabled && (!finiteMatch(game) || startConsumed + index < game.limit)) playBeat(sound, at);
  },
  frame(seconds) { if (running && countdown < 0) { const ms = seconds * 1000; game.elapsed += ms; game.periodTime += ms; game.playtime += ms; render(); } },
  tick({ index }) {
    if (countdown >= 0) {
      countdown = index - 1;
      if (index === 5) { countdown = -1; beginMatchClock(); }
      render(); return;
    }
    game.consumed++;
    if (finiteMatch(game) && game.consumed >= game.limit) { pause(false); playEndSignal(sound, config.signalCount); }
    persist(); render();
  }, interrupted });
let startConsumed = 0;
const previewClock = new BeatClock({ now: audioTime, schedule: ({ at }) => playBeat(sound, at), interrupted });
function beginMatchClock() { running = true; startConsumed = game.consumed; matchClock.start(config.pace); }
function pause(silence = true) {
  requestId++; running = false; starting = false; countdown = -1; previewing = false;
  matchClock.stop(); previewClock.stop(); stopAudio(!silence); releaseWake(); persist(); render();
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
async function endSignal() { if (sound.signalVolume && await unlockAudio()) playEndSignal(sound, config.signalCount); }
function focusNextSet() {
  const stones = $('.jm-stones');
  stones.style.removeProperty('--jm-resume-gap');
  if (!matchMedia('(max-width:699px)').matches) return;
  const pane = $('.jm-scroll'), button = $('[data-action=toggle]');
  const bottom = button.getBoundingClientRect().bottom - pane.getBoundingClientRect().top + pane.scrollTop;
  // Tall phones need room above the button for exact bottom alignment.
  stones.style.setProperty('--jm-resume-gap', `${Math.max(0, pane.clientHeight - bottom)}px`);
  button.focus({ preventScroll: true });
  button.scrollIntoView({ block: 'end', behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
}
function dialog(title, text, label, action) {
  pause(); closeLanguages(); lastFocus = document.activeElement;
  const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  currentDialog = f7.dialog.create({ title: safe(title), text: safe(text), verticalButtons: true, destroyOnClose: true,
    buttons: [{ text: label, strong: true, onClick: action }, { text: t('cancel') }],
    on: { opened(instance) { instance.el.querySelector('.dialog-button').focus(); }, closed() { currentDialog = null; lastFocus?.focus(); } } });
  currentDialog.el.setAttribute('role', 'dialog'); currentDialog.el.setAttribute('aria-modal', 'true'); currentDialog.el.setAttribute('aria-label', title);
  currentDialog.el.querySelectorAll('.dialog-button').forEach((button, index) => { button.dataset.dialogAction = index ? 'cancel' : 'confirm'; });
  currentDialog.open();
}
function showView(next) {
  if (running || countdown >= 0 || starting) pause();
  $('.jm-stones').style.removeProperty('--jm-resume-gap');
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
root.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.languageOption) { language = button.dataset.languageOption; try { localStorage.setItem('juggermaster:language', language); } catch {} closeLanguages(true); renderLanguage(); render(); persist(); return; }
  if (button.dataset.tab) { showView(button.dataset.tab); return; }
  if (button.dataset.preset) { Object.assign(sound, presets[button.dataset.preset]); render(); persist(); return; }
  const action = button.dataset.action === 'toggle' && game.setComplete ? 'next' : button.dataset.action;
  if (action === 'language-menu') openLanguages();
  else if (action === 'fullscreen') await enterFullscreen();
  else if (action === 'theme') { theme = getComputedStyle(app).colorScheme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark'; render(); persist(); }
  else if (action === 'toggle') { if (running || countdown >= 0 || starting) pause(); else await start(); }
  else if (action === 'beat-preview') await togglePreview();
  else if (action === 'signal-preview') await endSignal();
  else if (action === 'undo') { pause(); game = history.pop() || game; persist(); render(); }
  else if (action === 'new') dialog(t('newMatchQuestion'), t('newMatchDescription'), t('startNewMatch'), () => { history = []; game = newGame(config); noticeKey = storageError ? 'storageFailed' : null; persist(); showView('match'); });
  else if (action === 'next') {
    const sets = game.periods === -1, next = nextSection(game);
    if (next === game) return;
    const title = sets ? 'nextSetQuestion' : next.golden ? 'tieQuestion' : next.ended ? 'finishQuestion' : 'nextPeriodQuestion';
    const description = sets ? t('nextSetDescription') : next.golden ? t('goldenDescription') : next.ended ? `${config.teamA} ${game.a} : ${game.b} ${config.teamB}` : t('nextPeriodDescription');
    dialog(t(title), description, t(sets ? 'nextSet' : next.golden ? 'startGolden' : next.ended ? 'confirmResult' : 'startPeriod'), () => {
      remember(); game = next; persist(); render();
      if (sets) currentDialog.once('closed', focusNextSet);
    });
  } else if (action?.startsWith('score-')) {
    const key = action.includes('-a-') ? 'a' : 'b', delta = action.endsWith('plus') ? 1 : -1;
    const next = awardPoint(game, key, delta); if (next === game) return;
    remember(); if (config.pausePoint || game.golden || next.setComplete) pause(delta < 0);
    game = next; render(); persist();
    if (delta > 0) await endSignal();
  } else if (action === 'stone-minus' || action === 'stone-plus') { pause(); remember(); game = adjustStones(game, action === 'stone-plus' ? 1 : -1, config.direction); persist(); render(); }
  else if (action === 'offline-retry') setupOffline(render);
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
root.addEventListener('input', event => {
  const input = event.target;
  if (input.dataset.sound) { const value = Number(input.value); if (!Number.isFinite(value)) return; sound[input.dataset.sound] = clamp(value, Number(input.min), Number(input.max)); render(); persist(); }
  if (input.dataset.setting) {
    const key = input.dataset.setting;
    if (['teamA', 'teamB'].includes(key)) config[key] = input.value.trim().slice(0, 22) || defaults[key];
    else if (['colorA', 'colorB'].includes(key)) { if (/^#[0-9a-f]{6}$/i.test(input.value)) config[key] = input.value; }
    else if (input.type === 'checkbox') config[key] = input.checked;
    else if (key === 'direction') config[key] = input.value;
    else {
      const value = Number(input.value); if (!Number.isFinite(value) || input.value === '') return;
      if (key === 'periods') { if (![-1, 0, 2, 3].includes(value)) return; config[key] = value; }
      else config[key] = key === 'pace' ? clamp(value, .5, 3) : clamp(Math.round(value), Number(input.min), Number(input.max));
      if (key === 'pace' && previewing) previewClock.interval = config.pace;
    }
    render(); persist();
  }
});
root.addEventListener('focusout', event => { if (event.target.dataset.setting) render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (running || previewing || countdown >= 0)) pause(); });
window.addEventListener('pagehide', () => pause());
window.addEventListener('online', () => { render(); setupOffline(render); });
window.addEventListener('offline', render);
$('.jm-wave').replaceChildren(...Array.from({ length: 34 }, () => document.createElement('span')));
renderLanguage(); render();
$$('.jm-range').forEach(input => {
  const wrapper = document.createElement('div'); wrapper.className = 'jm-range-wrap range-slider'; input.before(wrapper); wrapper.append(input);
  const range = f7.range.create({ el: wrapper, min: Number(input.min), max: Number(input.max), step: Number(input.step) || 1, value: Number(input.value),
    on: { change(instance, value) { if (Number(input.value) === value) return; input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); } } });
  ranges.set(input, range);
});
setText('version', '__VERSION__');
app.dataset.ready = 'true'; app.inert = false; app.removeAttribute('aria-busy');
setupOffline(render);
console.assert(Object.values(texts).every(value => JSON.stringify(Object.keys(value).sort()) === JSON.stringify(Object.keys(texts.de).sort())), 'Übersetzungen vollständig');
