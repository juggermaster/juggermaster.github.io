const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' });
  context.setDefaultTimeout(15000);
  await context.addInitScript(() => {
    window.__csvMode = 'share'; window.__mailTo = '';
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => window.__csvMode !== 'download' });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
      if (window.__csvMode === 'cancel') throw new DOMException('Cancelled', 'AbortError');
      if (window.__csvMode === 'error') throw new DOMException('Unavailable', 'NotAllowedError');
      const file = data.files[0];
      window.__sharedCsv = { name: file.name, type: file.type, text: await file.text(), title: data.title };
    } });
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.protocol === 'mailto:') { window.__mailTo = this.href; return; }
      return click.call(this);
    };
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
  const dialog = page.locator('.jm-history-dialog'), send = dialog.locator('[data-dialog-action=email-csv]');
  try {
    await page.goto(url); await ready(); await page.locator('[data-action=results]').click();
    assert.equal(await send.isEnabled(), false, 'Leerer Verlauf wird nicht exportiert');
    assert.deepEqual(await dialog.locator('.dialog-button').evaluateAll(buttons => buttons.map(button => button.dataset.dialogAction)), ['email-csv', 'close']);
    await dialog.locator('[data-dialog-action=close]').click(); await dialog.waitFor({ state: 'detached' });
    await page.evaluate(() => {
      const key = 'juggermaster:state:v2', state = JSON.parse(localStorage.getItem(key));
      state.results = { currentId: null, archive: Array.from({ length: 95 }, (_, index) => ({
        id: 1000 + index, at: 1000 + index, teams: [index ? `Raben ${index}` : '=1+1', 'Wölfe'],
        a: 1, b: 2, setsA: 0, setsB: 1, periods: -1, setComplete: true
      })) };
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload(); await ready(); await page.locator('[data-action=results]').click();
    assert.equal(await dialog.locator('li').count(), 30);
    await send.click();
    await page.waitForFunction(() => Boolean(window.__sharedCsv));
    const shared = await page.evaluate(() => window.__sharedCsv);
    assert.equal(shared.name, 'juggermaster-results.csv'); assert.equal(shared.type, 'text/csv');
    assert.ok(shared.text.includes('"Raben 1"') && shared.text.includes('"Raben 94"'), 'Export enthält auch noch nicht angezeigte Einträge');
    assert.ok(shared.text.includes('"\'=1+1"')); assert.equal(shared.text.trim().split('\r\n').length, 96);
    assert.match(shared.title, /JUGGERMASTER/); assert.equal(await dialog.isVisible(), true);
    await page.evaluate(() => { window.__csvMode = 'cancel'; window.__mailTo = ''; });
    await send.click(); await page.waitForFunction(() => !document.querySelector('[data-dialog-action=email-csv]').disabled);
    assert.equal(await page.evaluate(() => window.__mailTo), '', 'Abbruch öffnet kein Mailprogramm');
    assert.equal(await dialog.locator('[role=status]').isVisible(), false);
    for (const mode of ['download', 'error']) {
      await page.evaluate(mode => { window.__csvMode = mode; window.__mailTo = ''; }, mode);
      const downloaded = page.waitForEvent('download'); await send.click();
      const file = await downloaded;
      assert.equal(file.suggestedFilename(), 'juggermaster-results.csv');
      const csv = await readFile(await file.path(), 'utf8');
      assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes('"Raben 1"'));
      await page.waitForFunction(() => window.__mailTo.startsWith('mailto:'));
      assert.match(await dialog.locator('[role=status]').textContent(), /heruntergeladen.*Anhang/);
      assert.equal(new URL(await page.evaluate(() => window.__mailTo)).searchParams.get('subject'), 'JUGGERMASTER · Spielergebnisse');
    }
    assert.equal(await dialog.isVisible(), true); assert.deepEqual(errors, []);
    console.log('OK: CSV-Datei, kompletter Verlauf, Systemfreigabe, Abbruch und Download mit Mail-Entwurf.');
  } finally { await context.close(); }
};
