const timestamp = value => Number.isSafeInteger(value) && value > 0 && value < 1e15;
const count = value => Number.isInteger(value) && value >= 0 && value <= 999999;
const summary = (game, teams, id, at) => ({ id, at, teams: [...teams], a: game.a, b: game.b, setsA: game.setsA, setsB: game.setsB, periods: game.periods, setComplete: game.setComplete });

export function restoreResults(value) {
  const archive = (Array.isArray(value?.archive) ? value.archive : []).flatMap(record => {
    const game = record?.game ?? record, at = record?.at ?? record?.finishedAt;
    if (!timestamp(record?.id) || !timestamp(at) || !Array.isArray(record.teams) || record.teams.length !== 2 || !record.teams.every(name => typeof name === 'string' && name.length <= 255)) return [];
    if (!game || !['a', 'b', 'setsA', 'setsB'].every(key => count(game[key])) || typeof game.setComplete !== 'boolean') return [];
    if (![-2, -1, 0].includes(game.periods) && !(Number.isInteger(game.periods) && game.periods > 0 && game.periods <= 99)) return [];
    if (record.game && !record.game.ended) return [];
    return [summary(game, record.teams, record.id, at)];
  });
  const id = value?.currentId ?? value?.current?.id;
  return { currentId: timestamp(id) ? id : null, archive: [...new Map(archive.map(record => [record.id, record])).values()].slice(-20) };
}

export function saveResult(results, before, after, teams, at = Date.now()) {
  if (!after.ended) {
    if (before.ended) results.archive = results.archive.filter(record => record.id !== results.currentId);
    return;
  }
  results.currentId ??= Math.max(at, ...results.archive.map(record => record.id + 1));
  const previous = results.archive.find(record => record.id === results.currentId);
  const record = summary(after, teams, results.currentId, previous?.at ?? at);
  results.archive = [...results.archive.filter(saved => saved.id !== record.id), record].slice(-20);
}
