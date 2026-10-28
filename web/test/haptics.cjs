const assert = require('node:assert/strict');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  context.setDefaultTimeout(15000);
  await context.addInitScript(() => {
    window.__vibrations = [];
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value(pattern) {
      if (window.__vibrationFails) throw Error('Vibration unavailable');
      window.__vibrations.push(pattern); return true;
    } });
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const setting = key => page.locator(`[data-setting=${key}]`);
  const tab = view => page.locator(`[data-tab=${view}]`).click();
  const points = () => page.evaluate(() => window.__vibrations.filter(Array.isArray).length);
  try {
    await page.goto(url + '#setup'); await page.locator('.jm-app[data-ready=true]').waitFor();
    for (const key of ['hapticStones', 'hapticPoints']) assert.equal(await setting(key).isChecked(), false, 'Haptik ist standardmäßig aus');
    assert.equal(await page.locator('[data-read=haptics-unavailable]').isVisible(), false);
    await setting('beatEnabled').uncheck();
    await setting('pace').evaluate(input => { input.value = '.5'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await tab('sound');
    for (const key of ['volume', 'signalVolume']) await page.locator(`[data-sound=${key}]`).evaluate(input => { input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await tab('match'); await page.locator('[data-action=score-a-plus]').click();
    assert.deepEqual(await page.evaluate(() => window.__vibrations), [], 'Ausgeschaltete Haptik löst keine Vibration aus');
    await tab('setup'); await setting('hapticStones').check();
    await tab('match'); await page.locator('[data-action=toggle]').click();
    await page.waitForFunction(() => window.__vibrations.filter(value => value === 35).length >= 2);
    await page.locator('[data-action=toggle]').click();
    const count = await page.evaluate(() => window.__vibrations.filter(value => value === 35).length);
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(() => window.__vibrations.filter(value => value === 35).length), count, 'Pause stoppt die Steinvibration');
    await page.locator('[data-action=score-a-plus]').click(); assert.equal(await points(), 0, 'Punkthaptik ist getrennt schaltbar');
    await tab('setup'); await setting('hapticPoints').check();
    await page.reload(); await page.locator('.jm-app[data-ready=true]').waitFor();
    for (const key of ['hapticStones', 'hapticPoints']) assert.equal(await setting(key).isChecked(), true, 'Auswahl bleibt gespeichert');
    await tab('match'); await page.locator('[data-action=score-a-plus]').click();
    assert.equal(await points(), 1);
    await page.locator('[data-action=score-a-minus]').click(); assert.equal(await points(), 1, 'Punktkorrekturen vibrieren nicht');
    await page.evaluate(() => window.__vibrationFails = true);
    await page.locator('[data-action=score-a-plus]').click();
    assert.equal(await page.locator('[data-read=score-a]').textContent(), '3', 'Vibrationsfehler blockieren das Spiel nicht');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
  const unsupported = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'block' });
  try {
    await unsupported.addInitScript(() => Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true }));
    const page = await unsupported.newPage(); await page.goto(url + '#setup'); await page.locator('.jm-app[data-ready=true]').waitFor();
    for (const key of ['hapticStones', 'hapticPoints']) assert.equal(await page.locator(`[data-setting=${key}]`).isEnabled(), false);
    assert.equal(await page.locator('[data-read=haptics-unavailable]').isVisible(), true);
  } finally { await unsupported.close(); }
  console.log('OK: Haptik standardmäßig aus, getrennte Optionen, Steintakt, Punkte, Pause, Speicherung und fehlende Unterstützung.');
};
