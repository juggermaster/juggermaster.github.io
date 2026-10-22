const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const playwright = require('playwright');
const root = path.resolve(__dirname, '../..'), dist = path.join(root, 'dist');
const executablePath = process.env.CHROME_PATH || undefined;
const csp = "default-src 'none'; script-src 'self'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function build(version) {
  const result = spawnSync(process.execPath, [path.join(root, 'web/scripts/build.mjs')], { cwd: root, env: { ...process.env, JUGGER_RELEASE: version }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
async function main() {
  build('v1');
  let corruptIcon = false;
  const server = createServer(async (request, response) => {
    try {
      const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(dist, '.' + (name.endsWith('/') ? name + 'index.html' : name));
      if (!file.startsWith(dist + path.sep)) { response.writeHead(403); response.end(); return; }
      let data = await fs.readFile(file);
      if (corruptIcon && file.endsWith('icon-512.png')) data = Buffer.from('Deliberately corrupted offline file');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-cache', 'Content-Security-Policy': csp }); response.end(data);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await playwright.chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 1000 }, locale: 'de-DE' });
  const errors = [], external = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  context.on('request', request => { if (!request.url().startsWith(url) && !request.url().startsWith('data:')) external.push(request.url()); });
  await context.addInitScript(() => {
    window.__fullscreenRequests = [];
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    Element.prototype.requestFullscreen = async function (options) { window.__fullscreenRequests.push({ element: this.tagName, options }); if (window.__fullscreenRejected) throw Error('Rejected by browser'); };
    window.__starts = []; window.__ends = []; window.__cancelled = 0;
    const original = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function (...args) {
      const oscillator = original.apply(this, args), start = oscillator.start.bind(oscillator), stop = oscillator.stop.bind(oscillator);
      oscillator.start = at => { window.__starts.push(at); return start(at); };
      oscillator.stop = at => { if (at === undefined) window.__cancelled++; else window.__ends.push(at); return stop(at); };
      return oscillator;
    };
    window.__wakeRequested = 0; window.__wakeReleased = 0;
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { async request() { window.__wakeRequested++; const lock = new EventTarget(); lock.release = async () => { window.__wakeReleased++; lock.dispatchEvent(new Event('release')); }; return lock; } } });
  });
  let page = await context.newPage(); page.setDefaultTimeout(10000);
  const read = selector => page.locator(selector).textContent();
  const click = action => page.locator(`[data-action=${action}]:visible`).click();
  const tab = async view => { await page.locator(`[data-tab=${view}]`).click(); await page.locator(`[data-view=${view}]`).waitFor({ state: 'visible' }); };
  const range = (key, value, type = 'sound') => page.locator(`[data-${type}=${key}]`).evaluate((input, value) => { input.value = String(value); input.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  const chooseLanguage = async language => { await click('language-menu'); await page.locator(`[data-language-option=${language}]`).click(); };
  const resetAudio = () => page.evaluate(() => { window.__starts = []; window.__ends = []; window.__cancelled = 0; });
  const audio = () => page.evaluate(() => ({ starts: window.__starts, ends: window.__ends, cancelled: window.__cancelled }));
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
  const dismissWinner = async result => {
    const winner = page.locator('.dialog[aria-label="Spiel beendet"]');
    await winner.waitFor({ state:'visible' });
    assert.equal(await winner.locator('.jm-final-score strong').count(), 2, 'Siegerdialog nennt beide Teams');
    assert.equal(await winner.locator('.jm-final-score b').count(), 2, 'Siegerdialog zeigt beide Ergebnisse');
    if (result) assert.match(await winner.textContent(), result);
    assert.equal(await winner.locator('[data-dialog-action=cancel]').textContent(), 'Schließen');
    await winner.locator('[data-dialog-action=cancel]').click(); await winner.waitFor({ state:'hidden' });
  };
  const offlineReady = () => page.locator('[data-read=offline]').filter({ hasText: /Offline (bereit|ready)/ }).waitFor({ state: 'attached', timeout: 45000 });
  const newMatch = async settings => {
    await tab('setup');
    for (const [key, value] of Object.entries(settings)) {
      const input = page.locator(`[data-setting=${key}]`);
      if (key === 'periods' || key === 'direction') await input.selectOption(String(value));
      else if (key === 'countdown') await input.setChecked(value);
      else if (key === 'pace') await range(key, value, 'setting');
      else await input.fill(String(value));
    }
    await click('new'); await page.locator('[data-dialog-action=confirm]').click();
    await page.locator('[data-read=status][data-running=true]').waitFor();
    // Pause the automatic start before testing individual match controls.
    await page.locator('[data-action=toggle]').evaluate(button => button.click());
    await page.locator('.dialog').waitFor({ state: 'hidden' });
  };
  try {
    await require('./audio.cjs')(browser, url);
    await page.goto(url); await ready(); await offlineReady();
    assert.equal(await page.title(), 'JUGGERMASTER');
    assert.equal(await page.locator('[data-read=result]').count(), 0, 'Kein dauerhaftes Satz- oder Siegermeldungsfeld');
    assert.equal(await page.locator('meta[name=apple-mobile-web-app-title]').getAttribute('content'), 'JUGGERMASTER');
    assert.equal(await page.locator('.jm-scroll>.jm-alert').count(), 0, 'Keine Statusmeldungen unter dem Header');
    assert.equal(await page.locator('.jm-home-hint').count(), 0, 'Kein Homescreen-Hinweis unter dem Header');
    await tab('info');
    for (const [index, count] of [3, 5, 4].entries()) {
      const details = page.locator('.jm-home-guide details').nth(index);
      await details.locator('summary').click();
      assert.equal(await details.locator('li:visible').count(), count, 'Schrittweise Anleitung aufklappbar');
    }
    await tab('match');
    assert.equal(await page.locator('.jm-offline').isHidden(), true, 'Kein dauerhafter Offline-Hinweis unter der Navigation');
    assert.equal(await page.locator('.jm-offline').evaluate(element => element.getBoundingClientRect().height), 0, 'Kein Platzverbrauch durch den ausgeblendeten Hinweis');
    assert.equal(await page.locator('#jm-arena').getAttribute('lang'), 'de');
    assert.equal(await read('[data-read=stones]'), '0'); assert.equal(await read('[data-read=score-a]'), '0');
    assert.equal(await read('[data-read=phase]'), '1. Satz');
    await tab('setup'); assert.equal(await page.locator('[data-setting=periods]').inputValue(), '-1'); await tab('match');
    await tab('sound');
    assert.equal(await page.locator('[data-preset=drum]').getAttribute('aria-pressed'), 'true', 'Trommel ist die frische Klangvorgabe');
    assert.equal(await page.locator('[data-sound=beatNormalize]').isChecked(), true);
    assert.equal(await page.locator('[data-sound=signalNormalize]').isChecked(), true);
    for (const preset of ['stone', 'drum', 'deep']) {
      await resetAudio();
      await page.locator(`[data-preset=${preset}]`).click();
      await page.waitForFunction(() => window.__starts.length > 0);
      assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'true', `${preset}: Klangwahl startet den Takt`);
      assert.equal(await read('[data-read=stones]'), '0', 'Hörprobe verändert keine Spielsteine');
      await click('beat-preview');
      assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'false');
    }
    for (const target of ['match', 'setup', 'info']) {
      await tab('sound'); await resetAudio();
      await page.locator('[data-preset=deep]').click(); await click('signal-preview');
      await page.waitForFunction(() => window.__starts.length > 0);
      await tab(target);
      assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'false', `${target}: Taktvorschau endet beim Tabwechsel`);
      assert.ok((await audio()).cancelled > 0, 'Auch ausklingende Sounds werden gestoppt');
      const stopped = (await audio()).starts.length;
      await page.waitForTimeout(1600);
      assert.equal((await audio()).starts.length, stopped, 'Keine weiteren Taktschläge nach Verlassen der Klangansicht');
    }
    await tab('sound'); await resetAudio(); await click('signal-preview'); await tab('match');
    assert.ok((await audio()).cancelled > 0, 'Auch ohne Taktvorschau wird das Endsignal beim Tabwechsel gestoppt');
    assert.equal(await read('[data-read=start-label]'), 'Spiel starten');
    assert.equal(await page.locator('.jm-feedback').count(), 0, 'Keine Toast-Oberfläche');
    assert.equal(await page.evaluate(() => window.__fullscreenRequests.length), 0, 'Tabwechsel aktiviert kein Vollbild');
    assert.equal((await (await context.request.get(url + 'manifest.webmanifest')).json()).display, 'standalone');
    await click('language-menu');
    assert.deepEqual(await page.evaluate(() => window.__fullscreenRequests), [], 'Flaggenmenü aktiviert kein Vollbild');
    assert.equal((await page.locator('#jm-languages').textContent()).trim(), '', 'Sprachmenü enthält ausschließlich Flaggen');
    assert.equal((await page.locator('[data-action=language-menu]').textContent()).replace('⌄', '').trim(), '', 'Keine Sprachkürzel in der Anzeige');
    await page.locator('[data-language-option=en]').click();
    assert.equal(await read('[data-read=start-label]'), 'Start match'); await chooseLanguage('de');
    assert.equal(await page.evaluate(() => window.__fullscreenRequests.length), 0, 'Weitere Klicks aktivieren kein Vollbild');
    assert.equal(await page.locator('.jm-head [data-action=fullscreen]').count(), 1);
    await click('fullscreen');
    assert.deepEqual(await page.evaluate(() => window.__fullscreenRequests), [{ element: 'HTML', options: { navigationUI: 'hide' } }], 'Nur der Kopfzeilenknopf fordert Vollbild an');
    await page.evaluate(() => { window.__fullscreenRejected = true; });
    await click('fullscreen'); assert.match(await read('[data-read=notice]'), /Vollbild/);
    await page.evaluate(() => { window.__fullscreenRejected = false; });
    await tab('match');
    await resetAudio(); await click('score-a-plus'); await page.waitForFunction(() => window.__starts.length === 21);
    assert.ok((await audio()).ends[0] > (await audio()).starts[7], 'Endschläge überlagern sich');
    await click('score-a-plus'); assert.equal((await audio()).cancelled, 0); assert.equal(await read('[data-read=stones]'), '0');
    await click('undo'); await click('undo');
    const plusBox = await page.locator('[data-action=stone-plus]').boundingBox();
    await page.mouse.move(plusBox.x + plusBox.width / 2, plusBox.y + plusBox.height / 2); await page.mouse.down();
    await page.waitForTimeout(1000); const slowCount = Number(await read('[data-read=stones]'));
    await page.waitForTimeout(1000); const fastCount = Number(await read('[data-read=stones]'));
    assert.ok(slowCount > 0 && fastCount - slowCount > slowCount, 'Gedrückthalten beschleunigt die Wiederholung');
    await page.mouse.up(); const releasedCount = await read('[data-read=stones]');
    await page.waitForTimeout(300); assert.equal(await read('[data-read=stones]'), releasedCount, 'Loslassen stoppt ohne Zusatzklick');
    const minusBox = await page.locator('[data-action=stone-minus]').boundingBox();
    await page.mouse.move(minusBox.x + minusBox.width / 2, minusBox.y + minusBox.height / 2); await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('[data-read=stones]').textContent === '0'); await page.mouse.up();
    await page.waitForTimeout(200); assert.equal(await read('[data-read=stones]'), '0', 'Wiederholung bleibt an der Untergrenze stehen');
    await click('stone-plus'); assert.equal(await read('[data-read=stones]'), '1', 'Kurzes Tippen bleibt ein Schritt');
    await newMatch({ periods: 2, limit: 4, pace: .5 });
    await tab('sound'); await resetAudio(); await click('beat-preview');
    await page.waitForFunction(() => window.__starts.length >= 21);
    const times = [...new Set((await audio()).starts)]; assert.ok(Math.abs(times[1] - times[0] - .5) < .001);
    await resetAudio(); await page.locator('[data-preset=drum]').click();
    assert.ok((await audio()).cancelled >= 7, 'Klangwechsel beendet die ausklingenden Gong-Takttöne');
    assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(() => window.__starts.length >= 4);
    const drumTimes = [...new Set((await audio()).starts)];
    assert.ok(Math.abs(drumTimes[1] - drumTimes[0] - .5) < .001, 'Hörprobe startet mit dem neuen Klang im eingestellten Takt');
    assert.equal(await read('[data-read=stones]'), '4', 'Klangwechsel verändert den Spielzähler nicht');
    await page.locator('[data-preset=deep]').click();
    await range('pitch', 220); await chooseLanguage('en'); assert.equal(await read('[data-i18n=previewBeat]'), 'Stop beat');
    await chooseLanguage('de'); await click('beat-preview');
    const stopped = (await audio()).starts.length; await page.waitForTimeout(700); assert.equal((await audio()).starts.length, stopped);
    assert.equal(await read('[data-read=stones]'), '4');
    await tab('match'); await resetAudio(); await click('toggle');
    await page.locator('[data-read=status][data-running=true]').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-read=stones]').textContent === '0');
    assert.equal((await audio()).starts.length, 3 * 7 + 3 * 7, 'Drei normale Steine und drei Endschläge, kein vierter Endschlag');
    assert.equal(await read('[data-read=status]'), 'PAUSIERT');
    assert.ok(await page.evaluate(() => window.__wakeRequested > 0 && window.__wakeReleased > 0), 'Bildschirm wird angefordert und freigegeben');
    assert.equal(await page.locator('[data-action=toggle]').isEnabled(), true);
    assert.equal(await read('[data-read=start-label]'), 'Abschnitt beginnen');
    await click('toggle'); await page.locator('[data-dialog-action=cancel]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
    assert.equal(await read('[data-read=phase]'), '1. Halbzeit'); assert.equal(await read('[data-read=stones]'), '0');
    await click('toggle'); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.querySelector('[data-action=toggle]').getBoundingClientRect().bottom <= document.querySelector('.jm-nav').getBoundingClientRect().top && document.activeElement === document.querySelector('[data-action=toggle]'));
    assert.equal(await read('[data-read=phase]'), '2. Halbzeit');
    assert.equal(await page.locator('[data-read=status]').getAttribute('data-running'), 'true', 'Bestätigung startet die Halbzeit direkt');
    await page.waitForFunction(() => Number(document.querySelector('[data-read=stones]').textContent) < 4);
    await click('score-a-plus'); await click('toggle');
    await page.waitForFunction(() => document.querySelector('[data-read=stones]').textContent === '0');
    assert.equal(await read('[data-read=start-label]'), 'Ergebnis bestätigen');
    await click('toggle'); await page.locator('[data-dialog-action=confirm]').click();
    await dismissWinner(/gewinnt/);
    assert.equal(await read('[data-read=start-label]'), 'Neues Spiel');
    assert.equal(await page.locator('[data-read=status]').getAttribute('data-running'), 'false', 'Ergebnis bestätigen startet kein beendetes Spiel');
    await newMatch({ periods: 2, limit: 20, pace: .5, countdown: true });
    await click('toggle'); assert.equal(await read('[data-read=stones]'), '20');
    await page.waitForTimeout(700); assert.equal(await read('[data-read=stones]'), '20', 'Countdown verbraucht keine Steine');
    await click('toggle'); assert.equal(await read('[data-read=status]'), 'PAUSIERT');
    for (const height of [600, 1000]) {
      await page.setViewportSize({ width: 390, height });
      await page.emulateMedia({ reducedMotion: height === 600 ? 'reduce' : 'no-preference' });
      await newMatch({ teamA: 'HLU', teamB: 'Spalter', periods: -1, targetPoints: 2, setsToWin: 2, countdown: false });
      for (let set = 0; set < 2; set++) {
        await click('score-a-plus'); await click('score-a-plus');
        if (!set) {
          assert.equal(await page.locator('.dialog').count(), 0, 'Satzende öffnet keinen Siegerdialog');
          assert.equal(await read('[data-read=start-label]'), 'Nächster Satz');
          assert.equal(await page.locator('[data-action=toggle]').isEnabled(), true);
          const advance = height === 600 ? 'toggle' : 'next';
          await click(advance); await page.locator('[data-dialog-action=cancel]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
          assert.equal(await read('[data-read=score-a]'), '2', 'Abbrechen behält den beendeten Satz');
          await click(advance); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
          await page.waitForFunction(() => document.querySelector('[data-action=toggle]').getBoundingClientRect().bottom <= document.querySelector('.jm-nav').getBoundingClientRect().top && document.activeElement === document.querySelector('[data-action=toggle]'));
          assert.equal(await read('[data-read=start-label]'), 'Spiel pausieren');
          assert.equal(await page.locator('[data-read=status]').getAttribute('data-running'), 'true', 'Bestätigung startet den nächsten Satz direkt');
          assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'toggle');
        }
      }
      await dismissWinner(/HLU gewinnt · 2 : 0/);
      assert.equal(await read('[data-read=phase]'), 'Spiel beendet'); assert.match(await read('[data-read=sets]'), /2 : 0/);
      await click('theme'); await click('theme');
      assert.equal(await page.locator('.dialog').count(), 0, 'Geschlossener Siegerdialog erscheint beim Rendern nicht erneut');
      assert.equal(await page.locator('[data-action=toggle]').isEnabled(), true);
      assert.equal(await read('[data-read=start-label]'), 'Neues Spiel');
      await click('toggle'); await page.locator('[data-dialog-action=cancel]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
      assert.equal(await read('[data-read=phase]'), 'Spiel beendet', 'Abbrechen behält das Match-Ergebnis');
      await click('undo'); assert.equal(await read('[data-read=score-a]'), '1');
      if (height === 1000) {
        await tab('setup'); await page.locator('[data-setting=countdown]').check(); await tab('match');
      }
      await click('score-a-plus');
      const won = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
      const winner = page.locator('.dialog[aria-label="Spiel beendet"]'); await winner.waitFor({ state:'visible' });
      await winner.locator('[data-dialog-action=confirm]').click(); await winner.waitFor({ state:'hidden' });
      const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
      assert.deepEqual(restarted.config, won.config, 'Neustart aus dem Siegerdialog behält Einstellungen');
      assert.deepEqual(restarted.sound, won.sound, 'Neustart aus dem Siegerdialog behält Klang');
      await page.waitForFunction(() => document.querySelector('[data-action=toggle]').getBoundingClientRect().bottom <= document.querySelector('.jm-nav').getBoundingClientRect().top && document.activeElement === document.querySelector('[data-action=toggle]'));
      assert.equal(await read('[data-read=phase]'), '1. Satz');
      await page.locator('[data-read=status][data-running=true]').waitFor();
      assert.equal(await read('[data-read=start-label]'), height === 1000 ? 'Start abbrechen' : 'Spiel pausieren', 'Neustart aus dem Siegerdialog beginnt sofort, optional mit Countdown');
      await click('toggle');
      assert.equal(await read('[data-read=score-a]'), '0'); assert.equal(await read('[data-read=score-b]'), '0');
      assert.match(await read('[data-read=sets]'), /0 : 0/);
      assert.equal(await read('[data-read=team-a]'), 'HLU'); assert.equal(await read('[data-read=team-b]'), 'SPALTER');
      assert.equal(await read('[data-read=format]'), '2 Gewinnsätze · 2 Punkte');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'toggle');
      assert.equal(await page.locator('[data-action=undo]').isDisabled(), true);
    }
    await click('score-a-plus');
    const beforeNew = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    const bottomNew = page.locator('[data-view=match] [data-action=new]');
    assert.equal(await bottomNew.textContent(), '↻Neues Spiel');
    await bottomNew.click(); await page.locator('[data-dialog-action=cancel]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')).game), beforeNew.game, 'Abbrechen behält den Spielstand');
    await bottomNew.click(); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
    await page.locator('[data-read=status][data-running=true]').waitFor();
    assert.equal(await read('[data-read=start-label]'), 'Start abbrechen', 'Auch der normale Neustart startet sofort mit dem eingestellten Countdown');
    await click('toggle');
    const afterNew = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    assert.deepEqual(afterNew.config, beforeNew.config, 'Neues Spiel im Spiel-Tab behält Teams, Farben und Einstellungen');
    assert.deepEqual(afterNew.sound, beforeNew.sound, 'Klang bleibt erhalten');
    assert.equal(await read('[data-read=score-a]'), '0'); assert.equal(await read('[data-read=score-b]'), '0');
    assert.equal(await read('[data-read=phase]'), '1. Satz'); assert.equal(await page.locator('[data-action=undo]').isDisabled(), true);
    await newMatch({ periods: 3, limit: 1, pace: 1.5, countdown:false });
    for (const phase of ['2. Drittel', '3. Drittel', 'Golden Jugg']) {
      await click('stone-minus');
      assert.equal(await read('[data-read=stones]'), '0');
      assert.equal(await read('[data-read=start-label]'), phase === 'Golden Jugg' ? 'Golden Jugg beginnen' : 'Abschnitt beginnen');
      await click('toggle'); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
      assert.equal(await read('[data-read=phase]'), phase);
      assert.equal(await page.locator('[data-read=status]').getAttribute('data-running'), 'true', 'Drittel und Golden Jugg starten nach Bestätigung');
      await click('toggle');
    }
    await click('score-b-plus'); await dismissWinner(/Spalter gewinnt/); assert.equal(await read('[data-read=phase]'), 'Spiel beendet'); await click('undo');
    await tab('setup'); await page.locator('[data-setting=teamA]').fill('Testteam'); await range('pace', 2, 'setting');
    await page.locator('[data-setting=countdown]').setChecked(true);
    const beforeDefaults = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    assert.equal(await read('[data-action=defaults]'), 'Voreinstellungen laden');
    await click('defaults');
    const afterDefaults = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    const { defaults } = await import(pathToFileURL(path.join(root, 'web/src/core.mjs')).href);
    assert.deepEqual(afterDefaults.config, defaults);
    assert.deepEqual(afterDefaults.game, beforeDefaults.game, 'Voreinstellungen löschen kein laufendes Spiel');
    assert.deepEqual(afterDefaults.sound, beforeDefaults.sound, 'Klang bleibt erhalten');
    assert.equal(await page.locator('[data-setting=periods]').inputValue(), '-1');
    assert.equal(await page.locator('[data-setting=pace]').inputValue(), '1.5');
    assert.equal(await page.locator('[data-setting=teamA]').inputValue(), 'Raben');
    for (const [side, name, color] of [['A', 'Falken', '#123456'], ['B', 'Ritter', '#654321']]) {
      await page.locator(`[data-setting=team${side}]`).fill(name);
      await page.locator(`[data-setting=color${side}]`).evaluate((input, value) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }, color);
    }
    await click('defaults');
    for (const [side, name, color] of [['A', 'Falken', '#123456'], ['B', 'Ritter', '#654321']]) {
      await page.locator(`[data-team-choice=team${side}]`).selectOption(name);
      assert.equal(await page.locator(`[data-setting=team${side}]`).inputValue(), name);
      assert.equal(await page.locator(`[data-setting=color${side}]`).inputValue(), color);
    }
    const savedTeams = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')).teams);
    assert.deepEqual(savedTeams.find(team => team.name === 'Falken'), { name: 'Falken', color: '#123456', defaultName: '' });
    assert.deepEqual(savedTeams.find(team => team.name === 'Ritter'), { name: 'Ritter', color: '#654321', defaultName: '' });
    await page.locator('[data-team-choice=teamA]').selectOption('Raben');
    await page.locator('[data-setting=colorA]').evaluate(input => { input.value = '#abcdef'; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); });
    await click('defaults'); await page.reload(); await ready();
    assert.equal(await page.locator('[data-team-choice=teamA]').inputValue(), '', 'Abweichende aktuelle Farbe bietet die gespeicherte Teamwahl erneut an');
    await page.locator('[data-team-choice=teamA]').selectOption('Raben');
    assert.equal(await page.locator('[data-setting=colorA]').inputValue(), '#abcdef', 'Voreinstellungen und Neustart überschreiben keine gespeicherte Teamfarbe');
    const beforeDelete = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    const nextTeam = beforeDelete.teams[beforeDelete.teams.findIndex(team => team.name === 'Raben') + 1];
    await page.locator('[data-team-delete=teamA]').click();
    assert.equal(await page.locator('[data-setting=teamA]').inputValue(), nextTeam.name);
    assert.equal(await page.locator('[data-team-choice=teamA]').inputValue(), nextTeam.name);
    assert.equal(await page.locator('[data-setting=colorA]').inputValue(), nextTeam.color);
    assert.equal(await page.locator('[data-team-choice=teamB] option[value=Raben]').count(), 0, 'Löschen entfernt das Team aus beiden Listen');
    const afterDelete = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    assert.deepEqual(afterDelete.game, beforeDelete.game, 'Team löschen erhält das aktuelle Spiel');
    assert.deepEqual(afterDelete.config, { ...beforeDelete.config, teamA: nextTeam.name, colorA: nextTeam.color, teamADefault: nextTeam.defaultName }, 'Team löschen übernimmt das nächste Team samt Farbe');
    await page.reload(); await ready();
    assert.equal(await page.locator('[data-team-choice=teamA] option[value=Raben]').count(), 0, 'Gelöschte aktuelle Teams bleiben nach Neustart gelöscht');
    await page.locator('[data-setting=teamA]').fill('falken'); await page.locator('[data-setting=teamA]').press('Tab');
    assert.equal(await page.locator('[data-setting=teamA]').inputValue(), 'Falken', 'Gespeicherten Namen direkt im kombinierten Feld eingeben');
    assert.equal(await page.locator('[data-setting=colorA]').inputValue(), '#123456');
    await tab('sound'); await range('pitch', 300); await range('volume', 12); await range('signalVolume', 20);
    await page.locator('[data-sound=beatNormalize]').uncheck();
    assert.equal(await page.locator('[data-sound=signalNormalize]').isChecked(), true, 'Takt-Schalter verändert das Endsignal nicht');
    await page.locator('[data-sound=signalNormalize]').uncheck();
    await page.reload(); await ready(); await tab('sound');
    assert.equal(await page.locator('[data-sound=beatNormalize]').isChecked(), false);
    assert.equal(await page.locator('[data-sound=signalNormalize]').isChecked(), false, 'Beide Schalter bleiben nach Neustart gespeichert');
    await page.locator('[data-preset=stone]').click();
    assert.equal(await page.locator('[data-sound=beatNormalize]').isChecked(), false, 'Klangwahl setzt die Schalter nicht zurück');
    assert.equal(await page.locator('[data-sound=signalNormalize]').isChecked(), false);
    await page.locator('[data-setting=signalCount]').fill('7');
    const beforeSoundDefaults = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    await click('beat-preview'); await click('sound-defaults');
    const afterSoundDefaults = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v1')));
    const { defaultSound } = await import(pathToFileURL(path.join(root, 'web/src/core.mjs')).href);
    assert.deepEqual(afterSoundDefaults.sound, defaultSound);
    assert.equal(await page.locator('[data-preset=drum]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-sound=beatNormalize]').isChecked(), true);
    assert.equal(await page.locator('[data-sound=signalNormalize]').isChecked(), true);
    assert.deepEqual(afterSoundDefaults.config, { ...beforeSoundDefaults.config, signalCount: defaults.signalCount });
    assert.deepEqual(afterSoundDefaults.teams, beforeSoundDefaults.teams);
    assert.deepEqual(afterSoundDefaults.game, beforeSoundDefaults.game);
    assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'false', 'Klang-Reset stoppt die Vorschau');
    await newMatch({ periods: 2, limit: 100, pace: .5 });
    await tab('setup'); await page.locator('[data-setting=teamA]').fill('Schakale'); await tab('sound'); await range('pitch', 225); await range('signalVolume', 80); await chooseLanguage('en');
    await page.locator('.jm-brand').evaluate(element => { element.style.fontFamily = 'sans-serif'; });
    for (const width of [320, 390, 736, 1024]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ['match', 'sound', 'setup', 'info']) {
        await tab(view);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view}: ${width}px ohne Überbreite`);
        assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth), `${view}: ${width}px ohne seitliches Scrollen im Inhalt`);
        if (view === 'setup') for (const side of ['A', 'B']) {
          const combo = await page.locator(`[data-setting=team${side}]`).boundingBox(), remove = await page.locator(`[data-team-delete=team${side}]`).boundingBox();
          assert.ok(remove.x >= combo.x + combo.width && Math.abs(remove.y + remove.height / 2 - combo.y - combo.height / 2) <= 1, 'Löschbutton auf jeder Breite rechts neben dem Feld');
        }
        assert.ok(await page.evaluate(() => { const brand = document.querySelector('.jm-brand'), box = brand.getBoundingClientRect(), actions = document.querySelector('.jm-head-actions').getBoundingClientRect(); return brand.scrollWidth <= brand.clientWidth && box.right <= actions.left; }), `Kopfzeile ${width}px`);
        const navBefore = await page.locator('.jm-nav').boundingBox();
        const headBefore = await page.locator('.jm-head').boundingBox();
        assert.ok(Math.abs(navBefore.y + navBefore.height - 1000) <= 1, `Tabs am unteren Rand: ${view}/${width}`);
        await page.locator('.jm-scroll').evaluate(element => { element.scrollTop = element.scrollHeight; });
        assert.ok(Math.abs((await page.locator('.jm-head').boundingBox()).y - headBefore.y) <= 1, 'Header bleibt fest');
        const navAfter = await page.locator('.jm-nav').boundingBox();
        assert.equal(navAfter.y, navBefore.y, `Tabs bleiben beim Scrollen sichtbar: ${view}/${width}`);
        assert.ok(await page.locator('.jm-body').evaluate(element => element.getBoundingClientRect().bottom <= document.querySelector('.jm-nav').getBoundingClientRect().top + 1), 'Inhalt überlappt keine Tabs');
        if (view === 'match') await page.locator('[data-view=match] [data-action=new]').click({ trial: true });
        if (view === 'sound') await page.locator('[data-action=signal-preview]').click({ trial: true });
      }
    }
    await page.locator('.jm-brand').evaluate(element => { element.style.fontFamily = ''; });
    await fs.mkdir(path.join(root, 'screenshots'), { recursive: true });
    await page.setViewportSize({ width: 390, height: 1000 }); await tab('match');
    await page.screenshot({ path: path.join(root, 'screenshots/app-mobile.png'), fullPage: true });
    await tab('sound'); await page.screenshot({ path: path.join(root, 'screenshots/app-sound.png'), fullPage: true });
    await click('language-menu'); await page.screenshot({ path: path.join(root, 'screenshots/app-flags.png'), fullPage: true }); await page.keyboard.press('Escape');
    await tab('match'); await click('score-a-plus');
    await context.setOffline(true); await page.close(); page = await context.newPage(); page.setDefaultTimeout(10000);
    await page.goto(url); await ready();
    assert.equal(await read('[data-read=score-a]'), '1'); assert.equal(await read('[data-read=team-a]'), 'SCHAKALE');
    assert.equal(await page.locator('[data-read=notice]').isHidden(), true, 'Wiederhergestellte Spiele erzeugen keine Statusmeldung');
    assert.equal(await page.locator('#jm-arena').getAttribute('lang'), 'en'); assert.equal(await read('[data-read=status]'), 'PAUSED');
    await page.locator('[data-read=offline]').filter({ hasText: 'fully available' }).waitFor({ state: 'attached' });
    assert.equal(await page.locator('.jm-offline').isHidden(), true, 'Auch nach Offline-Neustart kein Hinweis unter der Navigation');
    await tab('setup');
    assert.equal(await page.locator('[data-team-choice=teamA] option[value=Falken]').count(), 1, 'Gespeicherte Teams bleiben offline verfügbar');
    await tab('sound'); assert.equal(await read('[data-output=pitch]'), '225 Hz'); assert.equal(await read('[data-output=signalVolume]'), '80 %');
    await tab('match'); await click('toggle'); await page.waitForTimeout(650); await click('toggle');
    assert.equal(await read('[data-read=stones]'), '99', 'Offline-Spiel läuft nach erneutem URL-Aufruf');
    await tab('info');
    for (const [filename, title] of [['datenschutz.html', 'Privacy'], ['impressum.html', 'Legal notice'], ['hilfe.html', 'Help']]) {
      const panel = page.locator(`[data-document="${filename}"]`), infoUrl = page.url();
      await panel.locator('summary').click();
      await panel.locator('[data-locale=en]').waitFor({ state: 'visible' });
      assert.equal(await panel.locator('[data-locale=en] h1').textContent(), title, `${title} offline und lokalisiert verfügbar`);
      assert.equal(page.url(), infoUrl, 'Dokument wird ohne Seitenwechsel aufgeklappt');
      await panel.locator('summary').click();
    }
    await tab('match');
    await page.evaluate(async () => { const name = (await caches.keys()).find(key => key.startsWith('juggermaster-')); const cache = await caches.open(name); const key = (await cache.keys()).find(key => key.url.endsWith('icon-512.png')); await cache.delete(key); });
    await page.reload(); await ready(); await page.locator('[data-action=offline-retry]').waitFor({ state: 'visible' });
    assert.doesNotMatch(await read('[data-read=offline]'), /fully available/, 'Unvollständiger Cache wird erkannt');
    await context.setOffline(false); await offlineReady();
    await click('toggle'); await page.locator('[data-read=status][data-running=true]').waitFor();
    build('v2'); corruptIcon = true;
    await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
    await page.waitForTimeout(1200);
    assert.equal(await read('[data-read=version]'), 'v1', 'Fehlgeschlagenes Update erhält alte Version');
    corruptIcon = false;
    await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
    await page.locator('[data-read=update]').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await page.locator('[data-action=update]').isDisabled(), true, 'Kein Update während laufendem Spiel');
    assert.equal(await read('[data-read=version]'), 'v1');
    await click('toggle'); const updateScore = await read('[data-read=stones]'); await click('update');
    await page.waitForFunction(() => document.querySelector('[data-read=version]')?.textContent === 'v2', null, { timeout: 20000 });
    assert.equal(await read('[data-read=stones]'), updateScore); assert.equal(await read('[data-read=score-a]'), '1'); assert.equal(await read('[data-read=status]'), 'PAUSED');
    await offlineReady();
    build('v3-rollback');
    await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
    await page.locator('[data-read=update]').waitFor({ state: 'visible', timeout: 20000 });
    await click('update');
    await page.waitForFunction(() => document.querySelector('[data-read=version]')?.textContent === 'v3-rollback', null, { timeout: 20000 });
    assert.equal(await read('[data-read=score-a]'), '1', 'Rollback-Auslieferung behält den lokalen Spielstand');
    await offlineReady(); await context.setOffline(true); await page.reload();
    assert.equal(await read('[data-read=version]'), 'v3-rollback', 'Rollback-Fassung bleibt offline verfügbar');
    await context.setOffline(false);
    const fresh = await browser.newContext({ locale: 'de-DE' }); corruptIcon = true;
    await fresh.addInitScript(() => {
      window.__fullscreenRequests = 0;
      Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });
      Element.prototype.requestFullscreen = async () => { window.__fullscreenRequests++; };
    });
    const failed = await fresh.newPage(); await failed.goto(url);
    await failed.locator('[data-action=offline-retry]').waitFor({ state: 'visible', timeout: 45000 });
    assert.doesNotMatch(await failed.locator('[data-read=offline]').textContent(), /Offline bereit|Offline ready/, 'Beschädigter Erstdownload erhält keinen Bereit-Status');
    corruptIcon = false; await failed.locator('[data-action=offline-retry]').click();
    await failed.locator('[data-read=offline]').filter({ hasText: 'Offline bereit' }).waitFor({ state: 'attached', timeout: 45000 });
    await failed.locator('[data-tab=info]').click();
    assert.equal(await failed.locator('[data-action=fullscreen]').isHidden(), true, 'Nicht unterstütztes Vollbild wird nicht angeboten');
    assert.equal(await failed.evaluate(() => window.__fullscreenRequests), 0, 'Browser ohne Vollbild bleibt bedienbar');
    assert.equal(await failed.locator('.jm-feedback').count(), 0);
    await fresh.close();
    const { locales } = await import(pathToFileURL(path.join(root, 'web/src/locale.mjs')).href);
    const { texts } = await import(pathToFileURL(path.join(root, 'web/src/i18n.mjs')).href);
    for (const [language, locale] of Object.entries(locales)) {
      const translated = await browser.newContext({ locale: locale.tag, viewport: { width: 390, height: 1000 } });
      await translated.addInitScript(() => { Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false }); });
      try {
        const sample = await translated.newPage(); await sample.goto(url);
        await sample.locator('.jm-app[data-ready=true]').waitFor();
        assert.equal(await sample.locator('html').getAttribute('lang'), language, `Browsersprache ${locale.tag}`);
        assert.equal(await sample.locator('html').getAttribute('dir'), locale.dir || 'ltr');
        assert.equal(await sample.locator('[data-read=start-label]').textContent(), texts[language].startMatch);
        assert.equal(await sample.locator('[data-read=team-a]').textContent(), texts[language].defaultTeamA.toLocaleUpperCase(language));
        assert.equal(await sample.locator('[data-read=team-b]').textContent(), texts[language].defaultTeamB.toLocaleUpperCase(language));
        assert.deepEqual(await sample.locator('.jm-nav [data-i18n]').allTextContents(), [texts[language].match, texts[language].setupTab, texts[language].sound, texts[language].info]);
        for (const view of ['setup', 'sound', 'info']) {
          await sample.locator(`[data-tab=${view}]`).click();
          await sample.locator(`[data-view=${view}]`).waitFor({ state: 'visible' });
          if (view === 'setup') {
            assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), texts[language].defaultTeamA);
            assert.equal(await sample.locator('[data-setting=teamB]').inputValue(), texts[language].defaultTeamB);
            assert.equal(await sample.locator('[data-team-choice=teamA] option[value=Raben]').textContent(), texts[language].defaultTeamA);
            assert.equal(await sample.locator('[data-setting=colorA]').evaluate(input => input.closest('.jm-team-card').querySelector('[data-setting=teamA]') !== null), true, 'Teamfarbe gehört zur selben Karte wie der Name');
            assert.equal(await sample.locator('[data-action=defaults]').textContent(), texts[language].loadDefaults);
            assert.equal(await sample.locator('[data-team-choice=teamA] option').first().textContent(), texts[language].chooseTeam);
            assert.equal(await sample.locator('[data-team-delete=teamA]').getAttribute('aria-label'), texts[language].deleteTeam);
            const field = await sample.locator('[data-setting=teamA]').boundingBox(), remove = await sample.locator('[data-team-delete=teamA]').boundingBox();
            assert.ok(remove.x >= field.x + field.width, `${language}: Löschbutton rechts vom Feld`);
          }
          if (view === 'sound') {
            assert.equal(await sample.locator('[data-action=sound-defaults]').textContent(), texts[language].loadDefaults);
            for (const key of ['beatNormalize', 'signalNormalize']) assert.equal(await sample.locator(`[data-sound=${key}]`).evaluate(input => input.labels[0].textContent.trim()), texts[language][key]);
          }
          if (view === 'info') {
            assert.equal(await sample.locator('#jm-home-title').textContent(), texts[language].homeTitle);
            for (const key of ['homeAndroid', 'homeIos', 'homeDesktop']) assert.deepEqual(await sample.locator(`[data-home-steps=${key}] li`).allTextContents(), texts[language][key].split('\n'));
            assert.equal(await sample.locator('.jm-home-guide').evaluate(element => {
              const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT); let node;
              while (node = walker.nextNode()) if (node.textContent.includes('JUGGERMASTER') && node.parentElement.tagName !== 'STRONG') return false;
              return true;
            }), true, `${language}: App-Name in Anleitung immer fett und groß`);
          }
          assert.ok(await sample.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${language}/${view}: kein horizontaler Überlauf`);
          assert.ok(await sample.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${language}/${view}: Inhalt scrollt nicht seitlich`);
        }
        await sample.locator('[data-action=language-menu]').click();
        assert.equal(await sample.locator('[data-language-option]').count(), 23);
        assert.equal((await sample.locator('#jm-languages').textContent()).trim(), '');
        await sample.locator(`[data-language-option="${language}"]`).press('End');
        assert.equal(await sample.evaluate(() => document.activeElement.dataset.languageOption), 'zh-Hant');
        await sample.keyboard.press('Escape');
        for (const [file, title] of [['hilfe', 'help'], ['impressum', 'imprint'], ['datenschutz', 'privacy']]) {
          const panel = sample.locator(`[data-document="${file}.html"]`);
          await panel.locator('summary').click();
          await sample.waitForFunction(([language, direction]) => document.documentElement.lang === language && document.documentElement.dir === direction, [language, locale.dir || 'ltr']);
          await panel.locator(`[data-locale="${language}"]`).waitFor({ state: 'visible' });
          assert.equal(await panel.locator('[data-locale]:visible').count(), 1);
          assert.equal(await panel.locator(`[data-locale="${language}"] h1`).textContent(), texts[language][title]);
          assert.equal(await sample.locator('html').getAttribute('dir'), locale.dir || 'ltr');
          await panel.locator('summary').click();
        }
      } finally { await translated.close(); }
    }
    const preferred = await browser.newContext({ locale: 'es-MX' });
    await preferred.addInitScript(() => { Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false }); });
    try {
      let sample = await preferred.newPage(); await sample.goto(url); await sample.locator('.jm-app[data-ready=true]').waitFor();
      assert.equal(await sample.locator('html').getAttribute('lang'), 'es');
      await sample.locator('[data-tab=setup]').click();
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'Cuervos');
      await sample.locator('[data-action=language-menu]').click(); await sample.locator('[data-language-option=fr]').click();
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'Corbeaux');
      await sample.locator('[data-setting=teamA]').fill('HLU'); await sample.locator('[data-setting=teamA]').press('Tab');
      await sample.locator('[data-setting=colorA]').evaluate(input => { input.value = '#123456'; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); });
      await sample.locator('[data-action=language-menu]').click(); await sample.locator('[data-language-option=en]').click();
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'HLU');
      assert.equal(await sample.locator('[data-setting=colorA]').inputValue(), '#123456');
      assert.equal(await sample.locator('[data-setting=teamB]').inputValue(), 'Wolves');
      await sample.locator('[data-action=language-menu]').click(); await sample.locator('[data-language-option=fr]').click();
      await preferred.addInitScript(() => { Object.defineProperty(navigator, 'languages', { value: ['pt-BR'], configurable: true }); });
      await sample.close(); sample = await preferred.newPage(); await sample.goto(url); await sample.locator('.jm-app[data-ready=true]').waitFor();
      assert.equal(await sample.locator('html').getAttribute('lang'), 'fr', 'Bewusste Auswahl gewinnt auch nach geändertem Browserstandard');
      await sample.locator('[data-tab=setup]').click();
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'HLU');
      assert.equal(await sample.locator('[data-setting=colorA]').inputValue(), '#123456');
      await sample.locator('[data-action=defaults]').click();
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'Corbeaux');
      await sample.locator('[data-team-choice=teamA]').selectOption('Wölfe');
      assert.equal(await sample.locator('[data-setting=teamA]').inputValue(), 'Loups', 'Standardteam behält seine Übersetzung auf der anderen Seite');
      await sample.setViewportSize({ width: 1440, height: 1000 });
      assert.ok((await sample.locator('.jm-app').boundingBox()).width > 1400, 'Desktop nutzt die verfügbare Breite');
      for (const view of ['setup', 'sound']) {
        await sample.locator(`[data-tab=${view}]`).click();
        assert.equal(await sample.locator(`[data-view=${view}]`).evaluate(element => getComputedStyle(element).display), 'grid');
      }
    } finally { await preferred.close(); }
    assert.deepEqual(external, [], 'Keine externen Laufzeit-Abhängigkeiten');
    assert.deepEqual(errors, [], 'Keine JavaScript-Fehler');
    console.log('OK: Sätze als Standard, manuelles Vollbild, feste Tabs beim Scrollen, Spielabläufe, Audio, Flaggen, Wake Lock, vier Breiten, Offline-Neustart und kontrolliertes Update.');
  } catch (error) {
    console.error('Browserdiagnose:', { errors, url: page.url(), state: await page.evaluate(() => ({ lang: document.documentElement.lang, preference: localStorage.getItem('juggermaster:language'), sections: [...document.querySelectorAll('[data-locale]')].map(section => ({ locale: section.dataset.locale, hidden: section.hidden, height: section.getBoundingClientRect().height })) })).catch(() => null) });
    throw error;
  } finally {
    await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); build('v1');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
