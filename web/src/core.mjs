import { locales } from './locale.mjs';
import { instruments } from './instruments.mjs';

export const defaults = Object.freeze({
  teamA: 'Raben', teamB: 'Wölfe', colorA: '#c9724f', colorB: '#76a38b',
  teamADefault: 'defaultTeamA', teamBDefault: 'defaultTeamB',
  periods: -1, rounds: 2, limit: 100, direction: 'down', pace: 1.5,
  pausePoint: true, beatEnabled: true, signalCount: 3, countdown: false,
  targetPoints: 5, setsToWin: 2, minutes: 20
});
export const presets = Object.freeze({
  stone: { kind: 'stone', pitch: 280, metal: 90, attack: 95, decay: .6 },
  deep: { kind: 'gong', pitch: 140, metal: 70, attack: 60, decay: 3.2 },
  drum: { kind: 'drum', pitch: 110, metal: 15, attack: 75, decay: .5 }
});
const defaultBeat = Object.freeze({ ...presets.drum, kind: 'spessa', instrument: 'timpani', decay: instruments.timpani.decay });
export const defaultSound = Object.freeze({ ...defaultBeat, end: Object.freeze({ ...presets.drum, kind: 'spessa', instrument: 'smallGong', decay: instruments.smallGong.decay }), volume: 55, signalVolume: 90 });
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const finiteMatch = game => game.periods > 0 && !game.golden;
export const setMatch = game => game.periods < 0;
export const remainingTime = (game, now = Date.now()) => Math.max(0, game.deadline != null && !game.ended ? game.deadline - now : (game.minutes ?? defaults.minutes) * 60000 - game.elapsed);
const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const integer = (value, min, max) => Number.isInteger(value) && number(value, min, max);
function teamDefault(name, key) {
  const side = ['teamA', 'teamB'].find(side => name === defaults[side] && key === defaults[`${side}Default`]);
  return side ? defaults[`${side}Default`] : '';
}

export function cleanConfig(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  const result = { ...defaults };
  for (const key of ['teamA', 'teamB']) if (typeof raw[key] === 'string') result[key] = raw[key].trim().slice(0, 255);
  for (const key of ['colorA', 'colorB']) if (/^#[0-9a-f]{6}$/i.test(raw[key])) result[key] = raw[key];
  for (const side of ['teamA', 'teamB']) result[`${side}Default`] = teamDefault(result[side], raw[`${side}Default`] ?? defaults[`${side}Default`]);
  if ([-2, -1, 0, 2].includes(raw.periods)) result.periods = raw.periods;
  for (const [key, min, max] of [['rounds', 1, 99], ['limit', 1, 9999], ['signalCount', 1, 10], ['targetPoints', 1, 99], ['setsToWin', 1, 5], ['minutes', 1, 999]]) if (integer(raw[key], min, max)) result[key] = raw[key];
  if (['up', 'down'].includes(raw.direction)) result.direction = raw.direction;
  if (number(raw.pace, .5, 3)) result.pace = raw.pace;
  for (const key of ['pausePoint', 'beatEnabled', 'countdown']) if (typeof raw[key] === 'boolean') result[key] = raw[key];
  return result;
}

export function cleanSound(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  const profile = (value, fallback) => {
    if (!value || typeof value !== 'object') value = {};
    const validKind = ['gong', 'stone', 'drum', 'spessa', 'custom'].includes(value.kind);
    const result = validKind ? { ...presets.drum, kind: value.kind } : { ...fallback };
    if (result.kind === 'spessa') {
      result.instrument = Object.hasOwn(instruments, value.instrument) ? value.instrument : fallback.instrument || 'timpani';
      result.decay = instruments[result.instrument].decay;
    }
    for (const [key, min, max] of [['pitch', 70, 400], ['metal', 0, 100], ['attack', 0, 100], ['decay', .4, result.kind === 'custom' ? 30 : 6]]) if (number(value[key], min, max)) result[key] = value[key];
    return result;
  };
  const legacy = ['gong', 'stone', 'drum', 'spessa', 'custom'].includes(raw.kind) ? raw : undefined;
  const result = { ...defaultSound, ...profile(raw, defaultBeat), end: profile(raw.end ?? legacy, defaultSound.end) };
  for (const key of ['volume', 'signalVolume']) if (number(raw[key], 0, 100)) result[key] = raw[key];
  return result;
}

export function newGame(config) {
  return { a: 0, b: 0, consumed: 0, limit: config.limit, periods: config.periods > 0 ? config.rounds : config.periods,
    period: 1, elapsed: 0, periodTime: 0, playtime: 0, golden: false, ended: false,
    setsA: 0, setsB: 0, targetPoints: config.targetPoints, setsToWin: config.setsToWin, minutes: config.minutes ?? defaults.minutes, deadline: null, setComplete: false };
}

export function validGame(game) {
  if (!game || !([-2, -1, 0].includes(game.periods) || integer(game.periods, 1, 99))) return false;
  if (!['a', 'b', 'consumed'].every(key => integer(game[key], 0, 999999))) return false;
  if (!integer(game.limit, 1, 9999) || !integer(game.period, 1, game.periods === -2 ? 999999 : 100)) return false;
  if (!['elapsed', 'periodTime', 'playtime'].every(key => number(game[key], 0, 1e12))) return false;
  if (!['golden', 'ended', 'setComplete'].every(key => typeof game[key] === 'boolean')) return false;
  if (!integer(game.targetPoints, 1, 99) || !integer(game.setsToWin, 1, 5)) return false;
  if (game.minutes !== undefined && !integer(game.minutes, 1, 999)) return false;
  if (game.deadline != null && (game.periods !== -2 || !number(game.deadline, 1, 1e15))) return false;
  if (!['setsA', 'setsB'].every(key => integer(game[key], 0, game.periods === -2 ? 999999 : game.setsToWin))) return false;
  if (game.periods > 0 && game.period > game.periods) return false;
  if (finiteMatch(game) && game.consumed > game.limit) return false;
  if (game.golden && game.periods <= 0) return false;
  return true;
}

export function restoreSnapshot(value) {
  if (!value || value.version !== 2 || !validGame(value.game)) return null;
  const teams = new Map();
  for (const team of Array.isArray(value.teams) ? value.teams : []) {
    if (typeof team?.name !== 'string' || !team.name.trim() || team.name.trim().length > 255 || !/^#[0-9a-f]{6}$/i.test(team.color)) continue;
    const name = team.name.trim();
    teams.set(name.toLowerCase(), { name, color: team.color, defaultName: teamDefault(name, team.defaultName) });
  }
  return { version: 2, language: Object.hasOwn(locales, value.language) ? value.language : 'de',
    theme: ['light', 'dark'].includes(value.theme) ? value.theme : 'dark',
    teams: [...teams.values()],
    config: cleanConfig(value.config), sound: cleanSound(value.sound), game: { ...value.game },
    history: Array.isArray(value.history) ? value.history.filter(validGame).slice(-30).map(game => ({ ...game })) : [] };
}

export function awardPoint(game, key, delta, now = Date.now()) {
  if (game.periods === -2 && game.deadline != null && remainingTime(game, now) === 0) return finishTimedMatch(game, now);
  if (!['a', 'b'].includes(key) || ![-1, 1].includes(delta) || game.ended || game.setComplete) return game;
  const next = { ...game, [key]: clamp(game[key] + delta, 0, 999999) };
  if (delta > 0) {
    next.playtime = 0;
    if (game.golden) { next.golden = false; next.ended = true; }
    if (setMatch(game) && next[key] >= game.targetPoints) {
      next.setComplete = true;
      next[key === 'a' ? 'setsA' : 'setsB']++;
      next.ended = next.setsA >= game.setsToWin || next.setsB >= game.setsToWin;
    }
  }
  return next;
}

export function nextSection(game, now = Date.now()) {
  if (game.periods === -2 && game.deadline != null && remainingTime(game, now) === 0) return finishTimedMatch(game, now);
  if (game.ended || game.golden || game.periods === 0) return game;
  if (setMatch(game)) return game.setComplete ? { ...game, a: 0, b: 0, consumed: 0, period: game.period + 1, periodTime: 0, playtime: 0, setComplete: false } : game;
  if (game.period < game.periods) return { ...game, period: game.period + 1, consumed: 0, periodTime: 0, playtime: 0 };
  return game.a === game.b ? { ...game, golden: true, consumed: 0, periodTime: 0, playtime: 0 } : { ...game, ended: true };
}

export function finishTimedMatch(game, now = Date.now()) {
  if (setMatch(game) && !game.ended && (game.setsA >= game.setsToWin || game.setsB >= game.setsToWin)) return { ...game, ended: true };
  if (game.periods === -2 && !game.ended && remainingTime(game, now) === 0) return { ...game, elapsed: (game.minutes ?? defaults.minutes) * 60000, ended: true };
  return finiteMatch(game) && game.period === game.periods && game.consumed >= game.limit && game.a !== game.b ? nextSection(game) : game;
}

export function advanceTime(game, milliseconds, now = Date.now()) {
  if (game.ended) return game;
  const remaining = remainingTime(game, now), ms = game.periods === -2 ? Math.min(milliseconds, remaining) : milliseconds;
  const elapsed = game.deadline != null ? Math.max(0, (game.minutes ?? defaults.minutes) * 60000 - remaining) : game.elapsed + ms;
  return finishTimedMatch({ ...game, elapsed, periodTime: game.periodTime + ms, playtime: game.playtime + ms }, now);
}

export function matchWinner(game) {
  const lead = setMatch(game) ? game.setsA - game.setsB || (game.setComplete ? 0 : game.a - game.b) : game.a - game.b;
  return lead > 0 ? 'a' : lead < 0 ? 'b' : null;
}

export function adjustStones(game, displayedDelta, direction) {
  if (game.periods === -2) return game;
  const down = direction === 'down' && finiteMatch(game);
  return { ...game, consumed: clamp(game.consumed + displayedDelta * (down ? -1 : 1), 0, finiteMatch(game) ? game.limit : 999999) };
}
