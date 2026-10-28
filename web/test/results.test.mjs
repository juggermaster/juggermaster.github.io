import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, newGame, awardPoint, finishTimedMatch, nextSection } from '../src/core.mjs';
import { restoreResults, saveResult, resultsCsv } from '../src/results.mjs';
import { translate } from '../src/i18n.mjs';

const teams = ['Raben', 'Wölfe'];
test('Nur Endergebnisse speichern; Rückgängig und erneuter Abschluss bleiben ein Ergebnis', () => {
  const results = restoreResults(), start = newGame({ ...defaults, targetPoints: 1, setsToWin: 1 });
  saveResult(results, start, start, teams, 1000);
  assert.deepEqual(results, { currentId: null, archive: [] });
  const win = awardPoint(start, 'a', 1);
  saveResult(results, start, win, teams, 2000);
  assert.equal(results.archive.length, 1); assert.equal(results.archive[0].setsA, 1);
  assert.equal(results.archive[0].events, undefined); assert.equal(results.archive[0].game, undefined);
  const restored = restoreResults(JSON.parse(JSON.stringify(results)));
  assert.deepEqual(restored, results);
  saveResult(restored, win, start, teams, 3000);
  assert.equal(restored.archive.length, 0);
  saveResult(restored, start, awardPoint(start, 'b', 1), teams, 4000);
  assert.equal(restored.archive.length, 1); assert.equal(restored.archive[0].id, 2000);
  assert.equal(restored.archive[0].at, 4000); assert.equal(restored.archive[0].setsB, 1);
});

test('Zeitlimit, Golden Jugg, mehr als 20 Ergebnisse und korrigierter Endstand', () => {
  const results = restoreResults();
  for (let index = 0; index < 22; index++) {
    results.currentId = null;
    const before = { ...newGame({ ...defaults, periods: -2, minutes: 1 }), deadline: 60000, a: 1 };
    saveResult(results, before, finishTimedMatch(before, 60000), teams, 1000 + index);
  }
  assert.equal(results.archive.length, 22); assert.equal(results.archive[0].at, 1000);
  assert.equal(restoreResults(JSON.parse(JSON.stringify(results))).archive.length, 22);
  results.currentId = null;
  const golden = nextSection({ ...newGame({ ...defaults, periods: 2 }), period: 2, consumed: 100 });
  const win = awardPoint(golden, 'b', 1);
  saveResult(results, golden, win, teams, 4000);
  saveResult(results, win, { ...win, a: 2 }, teams, 5000);
  assert.equal(results.archive.length, 23); assert.equal(results.archive.at(-1).a, 2);
  assert.equal(results.archive.at(-1).at, 4000);
});

test('Vorherige Vorschau übernimmt nur Ergebnisse und entfernt Ereignisse; ungültige Daten ignorieren', () => {
  const game = { ...newGame(defaults), ended: true, a: 2 };
  const raw = { current: { id: 1000 }, archive: [{ id: 1000, finishedAt: 2000, teams, game, events: [{ type: 'pointA' }] }, { id: -1 }] };
  const clean = restoreResults(raw);
  assert.equal(clean.currentId, 1000); assert.equal(clean.archive.length, 1);
  assert.equal(clean.archive[0].events, undefined); assert.equal(clean.archive[0].game, undefined);
  assert.equal(restoreResults({ archive: [{ ...clean.archive[0], a: '2' }] }).archive.length, 0);
  assert.equal(restoreResults({ archive: [{ ...clean.archive[0], teams: ['a'.repeat(256), 'B'] }] }).archive.length, 0);
});

test('CSV enthält alle Ergebnisse in Anzeige-Reihenfolge mit korrekt maskierten Feldern', () => {
  const archive = [
    { ...newGame(defaults), at: 1000, teams: ['Raben, "Nord"', 'Wölfe\r\nSüd'] },
    { ...newGame(defaults), periods: 2, at: 2000, teams: ['A', 'B'], a: 3, b: 2 }
  ];
  const original = JSON.stringify(archive), csv = resultsCsv(archive, key => translate('de', key));
  assert.ok(csv.startsWith('\uFEFF"Datum (UTC)","Team A","Team B"'));
  assert.ok(csv.indexOf('1970-01-01T00:00:02.000Z') < csv.indexOf('1970-01-01T00:00:01.000Z'));
  assert.ok(csv.includes('"Raben, ""Nord"""')); assert.ok(csv.includes('"Wölfe\r\nSüd"'));
  assert.ok(csv.includes('"Spiel nach Steinen"')); assert.ok(csv.endsWith('\r\n'));
  assert.equal(JSON.stringify(archive), original);
});

test('CSV exportiert Teamnamen als Text statt Tabellenformeln', () => {
  for (const name of ['=1+1', '+SUM(1,2)', '-1', '@test', '\tTeam', '\rTeam', '\nTeam', '  =1', '＝1', '＋1', '－1', '＠test']) {
    const csv = resultsCsv([{ ...newGame(defaults), at: 1000, teams: [name, 'B'] }], key => translate('de', key));
    assert.ok(csv.includes('"\'' + name + '"'), name);
  }
});
