const assert = require('node:assert/strict');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__countdownEvents = [];
    let previous = null;
    new MutationObserver(() => {
      const dialog = document.querySelector('.jm-countdown-dialog.modal-in');
      const label = dialog?.querySelector('[data-read=countdown]').textContent ?? null;
      if (label !== previous) { window.__countdownEvents.push({ label, at: performance.now() }); previous = label; }
    }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  try {
    await page.goto(url + '#sound'); await page.locator('.jm-app[data-ready=true]').waitFor();
    for (const key of ['volume', 'signalVolume']) await page.locator(`[data-sound=${key}]`).evaluate(input => { input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    for (const pace of [.5, 3]) {
      await page.locator('[data-tab=setup]').click();
      await page.locator('[data-setting=periods]').selectOption('2');
      await page.locator('[data-setting=limit]').fill('20');
      await page.locator('[data-setting=pace]').evaluate((input, value) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }, pace);
      await page.locator('[data-setting=beatEnabled]').uncheck();
      await page.locator('[data-setting=countdown]').check();
      await page.locator('[data-view=setup] [data-action=new]').click();
      await page.evaluate(() => { window.__countdownEvents = []; });
      await page.locator('[data-dialog-action=confirm]').click();
      const dialog = page.locator('.jm-countdown-dialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await dialog.getAttribute('role'), 'dialog');
      assert.equal(await dialog.getAttribute('aria-modal'), 'true');
      assert.equal(await page.locator('[data-view=match] [data-read=countdown]').count(), 0, 'Kein Countdown-Feld in der Spielansicht');
      await dialog.waitFor({ state: 'detached', timeout: 1800 });
      const events = await page.evaluate(() => window.__countdownEvents);
      assert.deepEqual(events.map(event => event.label), ['3', '2', '1', 'JUGGER', null], 'Nur 3, 2, 1 und JUGGER, ohne Achtung');
      const duration = events.at(-1).at - events[0].at;
      assert.ok(duration >= 950 && duration <= 1150, `${pace}-Sekunden-Takt: Countdown dauert ${duration} ms`);
      assert.equal(await page.locator('[data-read=start-label]').textContent(), 'Spiel pausieren');
      assert.equal(await page.locator('[data-read=stones]').textContent(), '20', 'Countdown verbraucht keine Steine');
      await page.waitForFunction(() => document.querySelector('[data-read=stones]').textContent === '19', null, { timeout: pace * 1000 + 1000 });
      const firstStone = await page.evaluate(() => performance.now()) - events.at(-1).at;
      assert.ok(firstStone >= pace * 1000 - 100, 'Der normale Steintakt beginnt erst nach dem Countdown');
      await page.locator('[data-action=toggle]').click();
    }
    await page.locator('[data-action=toggle]').click();
    await page.locator('.jm-countdown-dialog').waitFor({ state: 'visible' });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.matches('.jm-countdown-dialog')), true, 'Tastaturfokus bleibt im Dialog');
    await page.keyboard.press('Escape');
    await page.locator('.jm-countdown-dialog').waitFor({ state: 'detached' });
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('[data-read=status]').textContent(), 'PAUSIERT', 'Abbrechen verhindert den späteren Spielstart');
    assert.equal(await page.locator('[data-read=stones]').textContent(), '19');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'toggle');
    assert.deepEqual(errors, []);
    console.log('OK: 3, 2, 1, JUGGER als Ein-Sekunden-Dialog, unabhängig vom Steintakt, mit Fokus und Abbruch.');
  } finally { await context.close(); }
};
