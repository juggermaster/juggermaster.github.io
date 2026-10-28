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
  return { currentId: timestamp(id) ? id : null, archive: [...new Map(archive.map(record => [record.id, record])).values()] };
}

export function saveResult(results, before, after, teams, at = Date.now()) {
  if (!after.ended) {
    if (before.ended) results.archive = results.archive.filter(record => record.id !== results.currentId);
    return;
  }
  results.currentId ??= results.archive.reduce((id, record) => Math.max(id, record.id + 1), at);
  const previous = results.archive.find(record => record.id === results.currentId);
  const record = summary(after, teams, results.currentId, previous?.at ?? at);
  results.archive = [...results.archive.filter(saved => saved.id !== record.id), record];
}

export function resultsCsv(archive, t) {
  const cell = value => {
    let text = String(value);
    if (/^[\s\uFEFF]*[=+\-@＝＋－＠]|^[ \uFEFF]*[\t\r\n]/u.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows = [[t('csvDate'), t('teamA'), t('teamB'), `${t('csvPoints')} A`, `${t('csvPoints')} B`, `${t('csvSets')} A`, `${t('csvSets')} B`, t('gameMode')]];
  for (let index = archive.length - 1; index >= 0; index--) {
    const result = archive[index];
    const mode = result.periods === -2 ? 'timedSetMatch' : result.periods === -1 ? 'setMatch' : result.periods === 0 ? 'freeDrumming' : 'timeMatch';
    rows.push([new Date(result.at).toISOString(), ...result.teams, result.a, result.b, result.setsA, result.setsB, t(mode)]);
  }
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
