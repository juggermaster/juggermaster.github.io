import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, defaultSound, newGame, awardPoint, nextSection, adjustStones, restoreSnapshot, cleanConfig, cleanSound } from '../src/core.mjs';
import { BeatClock } from '../src/clock.mjs';
import { texts } from '../src/i18n.mjs';
import { locales, resolveLanguage } from '../src/locale.mjs';
import { existsSync } from 'node:fs';
import { translatedHelp } from '../help-content.mjs';
import { translatedLegal } from '../legal-content.mjs';

test('Halbzeiten, Golden Jugg und Korrekturen', () => {
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
  assert.equal(restoreSnapshot({ version: 1, game: { a: -1 } }), null);
  const restored = restoreSnapshot({ version: 1, game: newGame(defaults), config: null, sound: null, language: 'x', history: [] });
  assert.deepEqual(restored.config, defaults); assert.deepEqual(restored.sound, defaultSound); assert.equal(restored.language, 'de');
  assert.equal(cleanConfig({ colorA: 'red;url(x)', limit: Infinity, signalCount: 100 }).signalCount, 3);
  assert.equal(cleanSound({ volume: 101, decay: NaN }).volume, 55);
  assert.deepEqual(Object.keys(texts.de).sort(), Object.keys(texts.en).sort());
});

test('Gespeicherte Teams validieren und alte Spielstände übernehmen', () => {
  const saved = { version: 1, game: newGame(defaults) };
  assert.deepEqual(restoreSnapshot(saved).teams, []);
  assert.deepEqual(restoreSnapshot({ ...saved, teams: {} }).teams, []);
  const restored = restoreSnapshot({ ...saved, teams: [
    { name: 'Raben', color: '#123456' }, { name: ' raben ', color: '#ABCDEF' },
    { name: '', color: '#123456' }, { name: 'x'.repeat(23), color: '#123456' },
    { name: 'Ungültig', color: 'red' }, null
  ] });
  assert.deepEqual(restored.teams, [{ name: 'raben', color: '#ABCDEF', defaultName: '' }]);
  assert.deepEqual(restored.game, saved.game);
  const empty = restoreSnapshot({ ...saved, teams: [], config: { teamA: '', teamB: '  ' } });
  assert.equal(empty.config.teamA, ''); assert.equal(empty.config.teamB, '');
  assert.deepEqual(empty.teams, [], 'Leere Teamfelder werden beim Wiederherstellen nicht neu befüllt');
});

test('Standardnamen markieren, alte Vorgaben übernehmen und eigene Namen erhalten', () => {
  const saved = { version: 1, game: newGame(defaults) };
  const legacy = restoreSnapshot({ ...saved, config: { teamA: 'Raben', teamB: 'HLU' }, teams: [{ name: 'Raben', color: defaults.colorA }, { name: 'HLU', color: '#123456' }] });
  assert.equal(legacy.config.teamADefault, 'defaultTeamA');
  assert.equal(legacy.config.teamBDefault, '');
  assert.deepEqual(legacy.teams.map(team => team.defaultName), ['defaultTeamA', '']);
  assert.equal(cleanConfig({ ...defaults, teamA: 'HLU' }).teamADefault, '', 'Fremde Namen können keine Standardmarkierung behalten');
  assert.equal(cleanConfig({ ...defaults, colorA: '#123456' }).teamADefault, 'defaultTeamA', 'Markierte Vorgaben behalten ihre eigene Farbe');
  assert.equal(cleanConfig({ teamA: 'Raben', colorA: '#123456' }).teamADefault, '', 'Vorhandene eigene Farbprofile unverändert lassen');
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
    assert.equal(restoreSnapshot({ version: 1, game: newGame(defaults), language }).language, language);
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
