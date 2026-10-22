import { locales } from './locale.mjs';

export const defaults = Object.freeze({
  teamA: 'Raben', teamB: 'Wölfe', colorA: '#c9724f', colorB: '#76a38b',
  teamADefault: 'defaultTeamA', teamBDefault: 'defaultTeamB',
  periods: -1, rounds: 2, limit: 100, direction: 'down', pace: 1.5,
  pausePoint: true, beatEnabled: true, signalCount: 3, countdown: false,
  targetPoints: 5, setsToWin: 2
});
export const presets = Object.freeze({
  stone: { kind: 'stone', pitch: 280, metal: 90, attack: 95, decay: .6 },
  deep: { kind: 'gong', pitch: 140, metal: 70, attack: 60, decay: 3.2 },
  drum: { kind: 'drum', pitch: 110, metal: 15, attack: 75, decay: .5 }
});
export const defaultSound = Object.freeze({ ...presets.drum, volume: 55, signalVolume: 90, beatNormalize: true, signalNormalize: true });
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const finiteMatch = game => game.periods > 0 && !game.golden;
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
  if ([-1, 0, 2].includes(raw.periods)) result.periods = raw.periods;
  for (const [key, min, max] of [['rounds', 1, 99], ['limit', 1, 9999], ['signalCount', 1, 10], ['targetPoints', 1, 99], ['setsToWin', 1, 5]]) if (integer(raw[key], min, max)) result[key] = raw[key];
  if (['up', 'down'].includes(raw.direction)) result.direction = raw.direction;
  if (number(raw.pace, .5, 3)) result.pace = raw.pace;
  for (const key of ['pausePoint', 'beatEnabled', 'countdown']) if (typeof raw[key] === 'boolean') result[key] = raw[key];
  return result;
}

export function cleanSound(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  const result = { ...defaultSound };
  if (['gong', 'stone', 'drum'].includes(raw.kind)) result.kind = raw.kind;
  for (const [key, min, max] of [['pitch', 70, 400], ['metal', 0, 100], ['attack', 0, 100], ['decay', .4, 6], ['volume', 0, 100], ['signalVolume', 0, 100]]) if (number(raw[key], min, max)) result[key] = raw[key];
  for (const key of ['beatNormalize', 'signalNormalize']) if (typeof raw[key] === 'boolean') result[key] = raw[key];
  return result;
}

export function newGame(config) {
  return { a: 0, b: 0, consumed: 0, limit: config.limit, periods: config.periods > 0 ? config.rounds : config.periods,
    period: 1, elapsed: 0, periodTime: 0, playtime: 0, golden: false, ended: false,
    setsA: 0, setsB: 0, targetPoints: config.targetPoints, setsToWin: config.setsToWin, setComplete: false };
}

export function validGame(game) {
  if (!game || !([-1, 0].includes(game.periods) || integer(game.periods, 1, 99))) return false;
  if (!['a', 'b', 'consumed'].every(key => integer(game[key], 0, 999999))) return false;
  if (!integer(game.limit, 1, 9999) || !integer(game.period, 1, 100)) return false;
  if (!['elapsed', 'periodTime', 'playtime'].every(key => number(game[key], 0, 1e12))) return false;
  if (!['golden', 'ended', 'setComplete'].every(key => typeof game[key] === 'boolean')) return false;
  if (!integer(game.targetPoints, 1, 99) || !integer(game.setsToWin, 1, 5)) return false;
  if (!['setsA', 'setsB'].every(key => integer(game[key], 0, game.setsToWin))) return false;
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
    theme: ['light', 'dark'].includes(value.theme) ? value.theme : '',
    teams: [...teams.values()],
    config: cleanConfig(value.config), sound: cleanSound(value.sound), game: { ...value.game },
    history: Array.isArray(value.history) ? value.history.filter(validGame).slice(-30).map(game => ({ ...game })) : [] };
}

export function awardPoint(game, key, delta) {
  if (!['a', 'b'].includes(key) || ![-1, 1].includes(delta) || game.ended || game.setComplete) return game;
  const next = { ...game, [key]: clamp(game[key] + delta, 0, 999999) };
  if (delta > 0) {
    next.playtime = 0;
    if (game.golden) { next.golden = false; next.ended = true; }
    if (game.periods === -1 && next[key] >= game.targetPoints) {
      next.setComplete = true;
      next[key === 'a' ? 'setsA' : 'setsB']++;
      next.ended = next.setsA >= game.setsToWin || next.setsB >= game.setsToWin;
    }
  }
  return next;
}

export function nextSection(game) {
  if (game.ended || game.golden || game.periods === 0) return game;
  if (game.periods === -1) return game.setComplete ? { ...game, a: 0, b: 0, consumed: 0, period: game.period + 1, periodTime: 0, playtime: 0, setComplete: false } : game;
  if (game.period < game.periods) return { ...game, period: game.period + 1, consumed: 0, periodTime: 0, playtime: 0 };
  return game.a === game.b ? { ...game, golden: true, consumed: 0, periodTime: 0, playtime: 0 } : { ...game, ended: true };
}

export function finishTimedMatch(game) {
  return finiteMatch(game) && game.period === game.periods && game.consumed >= game.limit && game.a !== game.b ? nextSection(game) : game;
}

export function adjustStones(game, displayedDelta, direction) {
  const down = direction === 'down' && finiteMatch(game);
  return { ...game, consumed: clamp(game.consumed + displayedDelta * (down ? -1 : 1), 0, finiteMatch(game) ? game.limit : 999999) };
}
