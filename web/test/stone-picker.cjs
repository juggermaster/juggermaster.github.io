const assert = require('node:assert/strict');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' });
  context.setDefaultTimeout(10000);
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const counter = page.locator('[data-read=stones]'), entry = page.locator('.jm-stone-entry');
  const confirm = page.locator('.jm-stone-dialog [data-dialog-action=confirm]');
  const open = async () => { await counter.click(); await page.locator('.jm-stone-wheel .picker-column-last').waitFor(); };
  const applied = value => page.waitForFunction(value => document.querySelector('[data-read=stones]').value === value && !document.querySelector('.jm-stone-dialog'), String(value));
  try {
    await page.goto(url); await page.locator('.jm-app[data-ready=true]').waitFor();
    for (const [width, height] of [[320, 568], [390, 844], [1024, 768]]) {
      await page.setViewportSize({ width, height });
      let previous;
      for (const value of [99, 100, 999, 1000, 999999, 0]) {
        await counter.fill(String(value)); await counter.press('Enter');
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const boxes = await page.locator('.jm-stones, .jm-teams, .jm-timing, [data-action=toggle]').evaluateAll(elements => elements.flatMap(element => {
          const box = element.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
        }));
        if (previous) assert.ok(boxes.every((value, index) => Math.abs(value - previous[index]) < 1), 'Ziffernwechsel verschieben keine Spielfelder oder Buttons');
        previous = boxes;
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await counter.fill('2'); await counter.press('Enter');
    await counter.fill('40'); await open();
    assert.equal(await entry.inputValue(), '40', 'Ein noch nicht bestätigter Wert kann im Rad weiterbearbeitet werden');
    await page.locator('.picker-column').press('ArrowUp');
    await confirm.click(); await applied(41);
    await page.locator('[data-action=undo]').click();
    assert.equal(await counter.inputValue(), '2');
    await open();
    assert.equal(await page.locator('.picker-column').count(), 1, 'Ein einziges Rad für die vollständige Steinzahl');
    assert.ok(await page.locator('.picker-item').count() <= 201, 'Auch hohe Werte brauchen keine riesige Werteliste');
    await page.locator('.picker-column-last').press('ArrowUp');
    assert.equal(await entry.inputValue(), '3');
    assert.equal(await counter.inputValue(), '2', 'Das Rad ändert den Spielstand erst beim Übernehmen');
    await page.locator('.picker-column-last .picker-items').evaluate(element => element.scrollTop = 5 * 36);
    await page.waitForFunction(() => document.querySelector('.jm-stone-entry').value === '5');
    await confirm.click(); await applied(5);
    await page.locator('[data-action=undo]').click();
    assert.equal(await counter.inputValue(), '2', 'Eine Auswahl ist mit einem Schritt rückgängig');
    await open(); await entry.fill('125'); await entry.press('Escape');
    await page.locator('.jm-stone-dialog').waitFor({ state: 'hidden' });
    assert.equal(await counter.inputValue(), '2', 'Abbrechen verwirft die Auswahl');
    await open();
    for (const value of ['', '-1', '1.5', '1000000']) {
      await entry.fill(value); await entry.press('Enter');
      assert.equal(await confirm.isEnabled(), false);
      assert.equal(await page.locator('.jm-stone-dialog').isVisible(), true);
    }
    await entry.fill('125');
    assert.equal(await page.locator('.picker-column').getAttribute('aria-valuenow'), '125');
    await entry.press('Enter'); await applied(125);
    await open(); await entry.fill('195');
    await page.locator('.picker-column').press('ArrowUp');
    assert.equal(await entry.inputValue(), '196', 'Am Rand des Wertfensters bleibt das Rad durchgehend bedienbar');
    await page.locator('.picker-column').press('End');
    assert.equal(await entry.inputValue(), '999999');
    await confirm.click(); await applied(999999);
    await open();
    assert.equal(await entry.inputValue(), '999999', 'Hohe Werte werden im Rad unverändert wieder geöffnet');
    await entry.press('Escape'); await page.locator('.jm-stone-dialog').waitFor({ state: 'hidden' });
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('juggermaster:state:v2'));
      Object.assign(state.config, { periods: 2, rounds: 1, limit: 100, direction: 'down' });
      Object.assign(state.game, { periods: 1, period: 1, limit: 100, consumed: 25 });
      localStorage.setItem('juggermaster:state:v2', JSON.stringify(state));
    });
    await page.reload(); await page.locator('.jm-app[data-ready=true]').waitFor();
    assert.equal(await counter.inputValue(), '75');
    await open();
    assert.equal(await page.locator('.picker-column').count(), 1);
    await entry.fill('101'); await entry.press('Enter');
    assert.equal(await confirm.isEnabled(), false);
    assert.equal(await page.locator('.jm-stone-dialog').isVisible(), true, 'Über dem Rundenlimit wird nichts übernommen');
    await entry.fill('66'); await confirm.click(); await applied(66);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')).game.consumed), 34, 'Abwärtszählung korrigiert die gespielten Steine richtig');
    assert.deepEqual(errors, []);
    console.log('OK: Zahlenrad, native Eingabe, Übernehmen, Abbrechen, Grenzen, Abwärtszählung und Rückgängig.');
  } finally { await context.close(); }
};
