import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, defaultSound, newGame, awardPoint, nextSection, finishTimedMatch, adjustStones, restoreSnapshot, cleanConfig, cleanSound } from '../src/core.mjs';
import { BeatClock } from '../src/clock.mjs';
import { texts } from '../src/i18n.mjs';
import { locales, resolveLanguage } from '../src/locale.mjs';
import { existsSync } from 'node:fs';
import { translatedHelp } from '../help-content.mjs';
import { translatedLegal } from '../legal-content.mjs';

test('Zeitrunden, Golden Jugg und Korrekturen', () => {
  let game = newGame({ ...defaults, periods: 2 });
  assert.equal(game.consumed, 0);
  game = adjustStones(game, -1, 'down');
  assert.equal(game.consumed, 1);
  assert.equal(adjustStones(game, -1000, 'down').consumed, 100);
  game = nextSection(game); assert.equal(game.period, 2); assert.equal(game.consumed, 0);
  game = nextSection(game); assert.equal(game.golden, true);
  const before = game;
  game = awardPoint(game, 'b', 1); assert.equal(game.ended, true); assert.equal(game.b, 1);
  assert.equal(before.b, 0, 'Undo-Snapshot bleibt unverändert');
  assert.equal(awardPoint(game, 'b', 1), game, 'Beendetes Spiel erhält keine weiteren Punkte');
});
test('Zeitspiel mit frei wählbaren Runden', () => {
  assert.equal(defaults.rounds, 2); assert.equal(defaults.limit, 100);
  for (const rounds of [1, 2, 3, 4, 99]) {
    const config = cleanConfig({ ...defaults, periods:2, rounds, limit:37 });
    let game = awardPoint(newGame(config), 'a', 1);
    assert.equal(game.periods, rounds); assert.equal(game.limit, 37);
    for (let round = 1; round < rounds; round++) {
      game = nextSection(game); assert.equal(game.period, round + 1); assert.equal(game.ended, false);
    }
    assert.equal(nextSection(game).ended, true);
    const restored = restoreSnapshot({ version:2, config, game, history:[game] });
    assert.deepEqual(restored.game, game); assert.equal(restored.config.rounds, rounds); assert.equal(restored.history.length, 1);
  }
  for (const invalid of [0, -1, 100, 1.5, Infinity, '3']) assert.equal(cleanConfig({ rounds:invalid }).rounds, 2);
  assert.equal(cleanConfig({ periods:3 }).periods, defaults.periods);
});

test('Zeitspiel endet nach der letzten Runde automatisch bei Führung', () => {
  for (const rounds of [1, 2, 4]) for (const side of ['a', 'b']) {
    const last = { ...newGame({ ...defaults, periods:2, rounds }), period:rounds, consumed:100, [side]:1 };
    assert.equal(finishTimedMatch(last).ended, true);
    assert.equal(last.ended, false, 'Vorheriger Spielstand bleibt für Rückgängig erhalten');
    const unfinished = { ...last, consumed:99 }, tied = { ...last, a:1, b:1 };
    assert.equal(finishTimedMatch(unfinished), unfinished);
    assert.equal(finishTimedMatch(tied), tied, 'Gleichstand bleibt für Golden Jugg offen');
    if (rounds > 1) {
      const earlier = { ...last, period:rounds - 1 };
      assert.equal(finishTimedMatch(earlier), earlier);
    }
  }
  for (const periods of [-1, 0]) {
    const game = { ...newGame({ ...defaults, periods }), a:1, consumed:100 };
    assert.equal(finishTimedMatch(game), game);
  }
});

test('Teamnamen bis 255 Zeichen vollständig speichern', () => {
  const name = 'Langes Team '.repeat(24).slice(0, 255);
  assert.equal(cleanConfig({ teamA:name + 'extra' }).teamA, name);
  const restored = restoreSnapshot({ version:2, game:newGame(defaults), config:{ teamA:name }, teams:[{ name, color:'#123456' }] });
  assert.equal(restored.config.teamA, name); assert.equal(restored.teams[0].name, name);
});
test('Satzspiel mit fünf Punkten und zwei Gewinnsätzen', () => {
  assert.equal(defaults.periods, -1, 'Neue Spiele verwenden standardmäßig Sätze');
  const config = defaults;
  let game = newGame(config);
  for (let i = 0; i < 5; i++) game = awardPoint(game, 'a', 1);
  assert.equal(game.setsA, 1); assert.equal(game.setComplete, true); assert.equal(game.ended, false);
  assert.equal(awardPoint(game, 'a', 1), game);
  game = nextSection(game); assert.equal(game.period, 2); assert.equal(game.a, 0); assert.equal(game.setsA, 1);
  for (let i = 0; i < 5; i++) game = awardPoint(game, 'a', 1);
  assert.equal(game.setsA, 2); assert.equal(game.ended, true);
});
test('Speicherstände validieren, Grenzen und Übersetzungen', () => {
  assert.equal(restoreSnapshot({ version:1, game:newGame(defaults) }), null);
  assert.equal(restoreSnapshot({ version: 2, game: { a: -1 } }), null);
  const restored = restoreSnapshot({ version: 2, game: newGame(defaults), config: null, sound: null, language: 'x', history: [] });
  assert.deepEqual(restored.config, defaults); assert.deepEqual(restored.sound, defaultSound); assert.equal(restored.language, 'de');
  assert.equal(cleanConfig({ colorA: 'red;url(x)', limit: Infinity, signalCount: 100 }).signalCount, 3);
  assert.equal(cleanSound({ volume: 101, decay: NaN }).volume, 55);
  assert.deepEqual(Object.keys(texts.de).sort(), Object.keys(texts.en).sort());
});

test('Trommel als Vorgabe und unabhängiger Lautstärkeausgleich', () => {
  assert.equal(defaultSound.kind, 'drum');
  assert.equal(defaultSound.beatNormalize, true); assert.equal(defaultSound.signalNormalize, true);
  assert.equal(cleanSound({ beatNormalize: false }).beatNormalize, false);
  assert.equal(cleanSound({ signalNormalize: false }).signalNormalize, false);
  assert.equal(cleanSound({ beatNormalize: 'false', signalNormalize: 0 }).beatNormalize, true);
  assert.equal(cleanSound({ beatNormalize: 'false', signalNormalize: 0 }).signalNormalize, true);
  const oldGong = { kind: 'gong', pitch: 140, metal: 70, attack: 60, decay: 3.2, volume: 40, signalVolume: 80 };
  assert.deepEqual(cleanSound(oldGong), { ...oldGong, beatNormalize: true, signalNormalize: true }, 'Gespeicherte Klangwahl bleibt erhalten');
});

test('Gespeicherte Teams validieren', () => {
  const saved = { version: 2, game: newGame(defaults) };
  assert.deepEqual(restoreSnapshot(saved).teams, []);
  assert.deepEqual(restoreSnapshot({ ...saved, teams: {} }).teams, []);
  const restored = restoreSnapshot({ ...saved, teams: [
    { name: 'Raben', color: '#123456' }, { name: ' raben ', color: '#ABCDEF' },
    { name: '', color: '#123456' }, { name: 'x'.repeat(256), color: '#123456' },
    { name: 'Ungültig', color: 'red' }, null
  ] });
  assert.deepEqual(restored.teams, [{ name: 'raben', color: '#ABCDEF', defaultName: '' }]);
  assert.deepEqual(restored.game, saved.game);
  const empty = restoreSnapshot({ ...saved, teams: [], config: { teamA: '', teamB: '  ' } });
  assert.equal(empty.config.teamA, ''); assert.equal(empty.config.teamB, '');
  assert.deepEqual(empty.teams, [], 'Leere Teamfelder werden beim Wiederherstellen nicht neu befüllt');
});

test('Standardnamen markieren und eigene Namen erhalten', () => {
  assert.equal(cleanConfig({ ...defaults, teamA: 'HLU' }).teamADefault, '', 'Fremde Namen können keine Standardmarkierung behalten');
  assert.equal(cleanConfig({ ...defaults, colorA: '#123456' }).teamADefault, 'defaultTeamA', 'Markierte Vorgaben behalten ihre eigene Farbe');
  assert.equal(cleanConfig({ teamA: 'Raben', colorA: '#123456', teamADefault:'' }).teamADefault, '', 'Eigene Farbprofile unverändert lassen');
  assert.equal(cleanConfig({ ...defaults, teamADefault: '' }).teamADefault, '', 'Bewusst eigene Namen beim Neustart erhalten');
  assert.equal(cleanConfig({ ...defaults, teamA: 'Wölfe', teamADefault: 'defaultTeamB' }).teamADefault, 'defaultTeamB', 'Standardteam kann die Seite wechseln');
  assert.equal(cleanConfig({ ...defaults, teamADefault: 'unknown' }).teamADefault, '');
});

test('Alle Sprachfassungen, Platzhalter und lokale SVG-Flaggen sind vollständig', () => {
  assert.equal(Object.keys(locales).length, 23);
  assert.deepEqual(Object.keys(texts).sort(), Object.keys(locales).sort());
  const keys = Object.keys(texts.de).sort();
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const [language, locale] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(texts[language]).sort(), keys, language);
    for (const key of keys) {
      assert.ok(texts[language][key].trim(), `${language}.${key}`);
      assert.deepEqual(placeholders(texts[language][key]), placeholders(texts.de[key]), `${language}.${key}`);
    }
    assert.ok(existsSync(new URL(`../src/images/flag-${locale.flag}.svg`, import.meta.url)), language);
    assert.equal(restoreSnapshot({ version: 2, game: newGame(defaults), language }).language, language);
  }
});

test('Browserpräferenzen und bewusste Sprachauswahl', () => {
  assert.equal(resolveLanguage(['es-MX', 'en-US']), 'es');
  assert.equal(resolveLanguage(['pt-BR']), 'pt');
  assert.equal(resolveLanguage(['xx-ZZ', 'fr-CA']), 'fr');
  assert.equal(resolveLanguage(['en-US'], 'pl'), 'pl');
  assert.equal(resolveLanguage(['en-US'], 'unsupported'), 'en');
  assert.equal(resolveLanguage(['iw-IL']), 'he');
  assert.equal(resolveLanguage(['zh-HK']), 'zh-Hant');
  assert.equal(resolveLanguage(['zh-TW']), 'zh-Hant');
  assert.equal(resolveLanguage(['zh-CN']), 'zh-Hans');
  assert.equal(resolveLanguage(['zh-Hans-TW']), 'zh-Hans');
  assert.equal(resolveLanguage(['zh-Hant-CN']), 'zh-Hant');
  assert.equal(resolveLanguage([null, 42, '']), 'de');
  assert.equal(resolveLanguage([]), 'de');
});

test('Hilfe ist für jede zusätzliche Sprache vorhanden', () => {
  const help = translatedHelp();
  assert.deepEqual(Object.keys(help).sort(), Object.keys(locales).filter(code => !['de', 'en'].includes(code)).sort());
  for (const [language, content] of Object.entries(help)) {
    assert.equal(content.title, texts[language].help);
    assert.ok(content.body.includes(texts[language].startMatch), language);
    assert.ok(content.body.includes(texts[language].previewBeat), language);
    assert.ok(content.body.includes('Bluetooth'), language);
    assert.doesNotMatch(content.body, /undefined/);
  }
});
test('Rechtstexte sind in jeder zusätzlichen Sprache vollständig verknüpft', () => {
  const contact = '<p>Provider contact</p>';
  const legal = translatedLegal(contact);
  const languages = Object.keys(locales).sort();
  for (const [page, translations] of Object.entries(legal)) {
    assert.deepEqual(Object.keys(translations).sort(), languages);
    for (const [language, content] of Object.entries(translations)) {
      assert.equal(content.title, texts[language][page === 'impressum' ? 'imprint' : 'privacy']);
      assert.equal(content.dir, locales[language].dir || 'ltr');
      assert.ok(content.body.includes(contact), language);
      assert.ok(content.body.includes('juggermaster.github.io'), language);
      assert.doesNotMatch(content.body, /undefined|\{(?:license|projectLicense|thirdParty|github|authority)\}/);
      if (page === 'impressum') {
        assert.ok(content.body.includes('__ASSETS__/LICENSE-Framework7.txt'), language);
      } else {
        for (const required of ['TDDDG', 'localStorage', 'Cache Storage', 'GitHub Pages', 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', 'https://www.lfd.niedersachsen.de/']) {
          assert.ok(content.body.includes(required), `${language}: ${required}`);
        }
      }
    }
  }
});

test('30 Minuten Takt ohne kumulierende Verschiebung', () => {
  let now = 0, ticks = 0;
  const sounds = [];
  const clock = new BeatClock({ now: () => now, schedule: event => sounds.push(event.at), tick: () => ticks++ });
  clock.start(1.5); clearInterval(clock.timer);
  for (let i = 1; i <= 72000; i++) { now = i * .025; clock.pump(); }
  clock.stop();
  assert.equal(ticks, 1200);
  sounds.forEach((at, i) => assert.ok(Math.abs(at - (i + 1) * 1.5) < 1e-8));
});
test('Unterbrechung spielt verpasste Takte nicht nach', () => {
  let now = 0, paused = false;
  const sounds = [];
  const clock = new BeatClock({ now: () => now, schedule: event => sounds.push(event.at), interrupted: () => { paused = true; } });
  clock.start(.5); clearInterval(clock.timer);
  now = .4; clock.pump(); now = 4; clock.pump();
  assert.equal(paused, true); assert.equal(clock.active, false); assert.deepEqual(sounds, [.5]);
});
