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
  const click = action => page.locator(`[data-action=${action}]`).click();
  const tab = async view => { await page.locator(`[data-tab=${view}]`).click(); await page.locator(`[data-view=${view}]`).waitFor({ state: 'visible' }); };
  const range = (key, value, type = 'sound') => page.locator(`[data-${type}=${key}]`).evaluate((input, value) => { input.value = String(value); input.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  const chooseLanguage = async language => { await click('language-menu'); await page.locator(`[data-language-option=${language}]`).click(); };
  const resetAudio = () => page.evaluate(() => { window.__starts = []; window.__ends = []; window.__cancelled = 0; });
  const audio = () => page.evaluate(() => ({ starts: window.__starts, ends: window.__ends, cancelled: window.__cancelled }));
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
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
    await click('new'); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
  };
  try {
    await page.goto(url); await ready(); await offlineReady();
    assert.equal(await page.locator('.jm-offline').isHidden(), true, 'Kein dauerhafter Offline-Hinweis unter der Navigation');
    assert.equal(await page.locator('.jm-offline').evaluate(element => element.getBoundingClientRect().height), 0, 'Kein Platzverbrauch durch den ausgeblendeten Hinweis');
    assert.equal(await page.locator('#jm-arena').getAttribute('lang'), 'de');
    assert.equal(await read('[data-read=stones]'), '100'); assert.equal(await read('[data-read=score-a]'), '0');
    assert.equal(await read('[data-read=start-label]'), 'Spiel starten');
    assert.equal(await page.locator('.jm-feedback').count(), 0, 'Keine Toast-Oberfläche');
    assert.equal(await page.evaluate(() => window.__fullscreenRequests.length), 0, 'Browser-Vollbild wartet auf Berührung');
    assert.equal((await (await context.request.get(url + 'manifest.webmanifest')).json()).display, 'fullscreen');
    await click('language-menu');
    assert.deepEqual(await page.evaluate(() => window.__fullscreenRequests), [{ element: 'HTML', options: { navigationUI: 'hide' } }]);
    assert.equal((await page.locator('#jm-languages').textContent()).trim(), '', 'Sprachmenü enthält ausschließlich Flaggen');
    assert.equal((await page.locator('[data-action=language-menu]').textContent()).replace('⌄', '').trim(), '', 'Keine Sprachkürzel in der Anzeige');
    await page.locator('[data-language-option=en]').click();
    assert.equal(await read('[data-read=start-label]'), 'Start match'); await chooseLanguage('de');
    assert.equal(await page.evaluate(() => window.__fullscreenRequests.length), 1, 'Keine erneute Vollbildanforderung bei weiteren Klicks');
    await tab('info'); await click('fullscreen');
    assert.equal(await page.evaluate(() => window.__fullscreenRequests.length), 2, 'Vollbild lässt sich über Info erneut öffnen');
    await page.evaluate(() => { window.__fullscreenRejected = true; });
    await click('fullscreen'); assert.match(await read('[data-read=notice]'), /Vollbild/);
    await page.evaluate(() => { window.__fullscreenRejected = false; });
    await tab('match');
    await resetAudio(); await click('score-a-plus'); await page.waitForFunction(() => window.__starts.length === 21);
    assert.ok((await audio()).ends[0] > (await audio()).starts[7], 'Endschläge überlagern sich');
    await click('score-a-plus'); assert.equal((await audio()).cancelled, 0); assert.equal(await read('[data-read=stones]'), '100');
    await click('undo'); await click('undo');
    await newMatch({ periods: 2, limit: 4, pace: .5 });
    await tab('sound'); await resetAudio(); await click('beat-preview');
    await page.waitForFunction(() => window.__starts.length >= 21);
    const times = [...new Set((await audio()).starts)]; assert.ok(Math.abs(times[1] - times[0] - .5) < .001);
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
    await newMatch({ periods: 2, limit: 20, pace: .5, countdown: true });
    await click('toggle'); assert.equal(await read('[data-read=stones]'), '20');
    await page.waitForTimeout(700); assert.equal(await read('[data-read=stones]'), '20', 'Countdown verbraucht keine Steine');
    await click('toggle'); assert.equal(await read('[data-read=status]'), 'PAUSIERT');
    await newMatch({ periods: -1, targetPoints: 2, setsToWin: 2, countdown: false });
    for (let set = 0; set < 2; set++) {
      await click('score-a-plus'); await click('score-a-plus');
      if (!set) { await click('next'); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' }); }
    }
    assert.equal(await read('[data-read=phase]'), 'Spiel beendet'); assert.match(await read('[data-read=sets]'), /2 : 0/);
    await click('undo'); assert.equal(await read('[data-read=score-a]'), '1');
    await newMatch({ periods: 3, limit: 50 });
    for (const phase of ['2. Drittel', '3. Drittel', 'Golden Jugg']) {
      await click('next'); await page.locator('[data-dialog-action=confirm]').click(); await page.locator('.dialog').waitFor({ state: 'hidden' });
      assert.equal(await read('[data-read=phase]'), phase);
    }
    await click('score-b-plus'); assert.equal(await read('[data-read=phase]'), 'Spiel beendet'); await click('undo');
    await newMatch({ periods: 2, limit: 100, pace: .5 });
    await tab('setup'); await page.locator('[data-setting=teamA]').fill('Schakale'); await tab('sound'); await range('pitch', 225); await range('signalVolume', 80); await chooseLanguage('en');
    await page.locator('.jm-brand').evaluate(element => { element.style.fontFamily = 'sans-serif'; });
    for (const width of [320, 390, 736, 1024]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ['match', 'sound', 'setup', 'info']) {
        await tab(view);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view}: ${width}px ohne Überbreite`);
        assert.ok(await page.evaluate(() => { const brand = document.querySelector('.jm-brand'), box = brand.getBoundingClientRect(), actions = document.querySelector('.jm-head-actions').getBoundingClientRect(); return brand.scrollWidth <= brand.clientWidth && box.right <= actions.left; }), `Kopfzeile ${width}px`);
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
    assert.equal(await page.locator('#jm-arena').getAttribute('lang'), 'en'); assert.equal(await read('[data-read=status]'), 'PAUSED');
    await page.locator('[data-read=offline]').filter({ hasText: 'fully available' }).waitFor({ state: 'attached' });
    assert.equal(await page.locator('.jm-offline').isHidden(), true, 'Auch nach Offline-Neustart kein Hinweis unter der Navigation');
    await tab('sound'); assert.equal(await read('[data-output=pitch]'), '225 Hz'); assert.equal(await read('[data-output=signalVolume]'), '80 %');
    await tab('match'); await click('toggle'); await page.waitForTimeout(650); await click('toggle');
    assert.equal(await read('[data-read=stones]'), '99', 'Offline-Spiel läuft nach erneutem URL-Aufruf');
    await tab('info');
    for (const [filename, title] of [['datenschutz.html', 'Privacy'], ['impressum.html', 'Legal notice'], ['hilfe.html', 'Help']]) {
      await page.locator(`[data-view=info] a[href="./${filename}"]`).click();
      await page.locator('[data-locale=en]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-locale=en] h1').textContent(), title, `${title} offline und lokalisiert verfügbar`);
      await page.locator('a[data-i18n=backApp]').click(); await ready();
      await page.locator('[data-view=info]').waitFor({ state: 'visible' });
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
        assert.deepEqual(await sample.locator('.jm-nav [data-i18n]').allTextContents(), [texts[language].match, texts[language].setupTab, texts[language].sound, texts[language].info]);
        for (const view of ['setup', 'sound', 'info']) {
          await sample.locator(`[data-tab=${view}]`).click();
          await sample.locator(`[data-view=${view}]`).waitFor({ state: 'visible' });
          assert.ok(await sample.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${language}/${view}: kein horizontaler Überlauf`);
        }
        await sample.locator('[data-action=language-menu]').click();
        assert.equal(await sample.locator('[data-language-option]').count(), 23);
        assert.equal((await sample.locator('#jm-languages').textContent()).trim(), '');
        await sample.locator(`[data-language-option="${language}"]`).press('End');
        assert.equal(await sample.evaluate(() => document.activeElement.dataset.languageOption), 'zh-Hant');
        await sample.keyboard.press('Escape');
        for (const [file, title] of [['hilfe', 'help'], ['impressum', 'imprint'], ['datenschutz', 'privacy']]) {
          await sample.locator(`a[href="./${file}.html"]`).first().click();
          await sample.locator(`[data-locale="${language}"]`).waitFor({ state: 'visible' });
          assert.equal(await sample.locator('[data-locale]:visible').count(), 1);
          assert.equal(await sample.locator(`[data-locale="${language}"] h1`).textContent(), texts[language][title]);
          assert.equal(await sample.locator('html').getAttribute('dir'), locale.dir || 'ltr');
        }
      } finally { await translated.close(); }
    }
    const preferred = await browser.newContext({ locale: 'es-MX' });
    await preferred.addInitScript(() => { Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false }); });
    try {
      let sample = await preferred.newPage(); await sample.goto(url); await sample.locator('.jm-app[data-ready=true]').waitFor();
      assert.equal(await sample.locator('html').getAttribute('lang'), 'es');
      await sample.locator('[data-action=language-menu]').click(); await sample.locator('[data-language-option=fr]').click();
      await preferred.addInitScript(() => { Object.defineProperty(navigator, 'languages', { value: ['pt-BR'], configurable: true }); });
      await sample.close(); sample = await preferred.newPage(); await sample.goto(url); await sample.locator('.jm-app[data-ready=true]').waitFor();
      assert.equal(await sample.locator('html').getAttribute('lang'), 'fr', 'Bewusste Auswahl gewinnt auch nach geändertem Browserstandard');
      await sample.setViewportSize({ width: 1440, height: 1000 });
      assert.ok((await sample.locator('.jm-app').boundingBox()).width > 1400, 'Desktop nutzt die verfügbare Breite');
      for (const view of ['setup', 'sound']) {
        await sample.locator(`[data-tab=${view}]`).click();
        assert.equal(await sample.locator(`[data-view=${view}]`).evaluate(element => getComputedStyle(element).display), 'grid');
      }
    } finally { await preferred.close(); }
    assert.deepEqual(external, [], 'Keine externen Laufzeit-Abhängigkeiten');
    assert.deepEqual(errors, [], 'Keine JavaScript-Fehler');
    console.log('OK: Vollbild nach Berührung, erneutes Vollbild, Ablehnung/fehlender Unterstützung, keine Toasts, Spielabläufe, Audio, Flaggen, Wake Lock, vier Breiten, Offline-Neustart und kontrolliertes Update.');
  } catch (error) {
    console.error('Browserdiagnose:', { errors, url: page.url(), state: await page.evaluate(() => ({ lang: document.documentElement.lang, preference: localStorage.getItem('juggermaster:language'), sections: [...document.querySelectorAll('[data-locale]')].map(section => ({ locale: section.dataset.locale, hidden: section.hidden, height: section.getBoundingClientRect().height })) })).catch(() => null) });
    throw error;
  } finally {
    await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); build('v1');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
