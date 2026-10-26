const assert = require('node:assert/strict');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
  const tab = view => page.locator(`[data-tab=${view}]`).click();
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')));
  const point = () => page.locator('[data-action=score-a-plus]').click();
  const confirm = async () => {
    const dialog = page.locator('.dialog.modal-in');
    await dialog.locator('[data-dialog-action=confirm]').click(); await dialog.waitFor({ state: 'detached' });
  };
  const close = async () => {
    const dialog = page.locator('.dialog.modal-in');
    await dialog.locator('[data-dialog-action=close], [data-dialog-action=cancel]').click(); await dialog.waitFor({ state: 'detached' });
  };
  const open = async () => {
    await page.locator('[data-action=results]').click();
    await page.locator('.jm-history-dialog .jm-results-list').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.activeElement?.matches('.jm-history-dialog .dialog-button'));
  };
  try {
    await page.goto(url); await ready();
    assert.deepEqual(await page.locator('[data-view=match]>.jm-actions button').evaluateAll(buttons => buttons.map(button => button.dataset.action)), ['undo', 'results', 'new']);
    await open(); assert.match(await page.locator('.jm-results-list').textContent(), /Noch keine abgeschlossenen Spiele/); await close();
    await tab('sound');
    await page.locator('[data-sound=signalVolume]').evaluate(input => { input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await tab('setup'); await page.locator('[data-setting=beatEnabled]').uncheck();
    await page.locator('[data-setting=targetPoints]').fill('2');
    await page.locator('[data-setting=setsToWin]').fill('2');
    await page.locator('[data-view=setup] [data-action=new]').click(); await confirm();
    await point(); assert.equal((await state()).results.archive.length, 0, 'Laufende Spiele erzeugen kein Protokoll');
    await point(); await page.locator('[data-action=toggle]').click(); await confirm();
    await point(); await point(); await close();
    let saved = await state();
    assert.equal(saved.results.archive.length, 1); assert.equal(saved.results.archive[0].setsA, 2);
    assert.equal(saved.results.archive[0].events, undefined); assert.equal(saved.matchLog, undefined);
    await open();
    assert.equal(await page.locator('.jm-results-list li').count(), 1);
    assert.match(await page.locator('.jm-results-list').textContent(), /Raben.*Wölfe.*2.*0/);
    assert.equal(await page.locator('.jm-results-list ol, .jm-match-events').count(), 0);
    await close();
    await page.locator('.jm-offline').waitFor({ state: 'hidden', timeout: 60000 });
    await context.setOffline(true); await page.reload(); await ready();
    assert.equal((await state()).results.archive.length, 1);
    await page.locator('[data-action=undo]').click();
    assert.equal((await state()).results.archive.length, 0);
    await point(); await close();
    saved = await state(); assert.equal(saved.results.archive.length, 1, 'Erneuter Abschluss bleibt ein Ergebnis');
    const sample = saved.results.archive[0];
    const archive = Array.from({ length: 20 }, (_, index) => ({ ...sample, id: 70000 + index, at: sample.at + index * 1000, teams: [index === 19 ? '<img src=x onerror=alert(1)>' : 'Raben ' + index, 'Wölfe'] }));
    await page.evaluate(archive => { const key = 'juggermaster:state:v2', value = JSON.parse(localStorage.getItem(key)); value.results = { currentId: null, archive }; localStorage.setItem(key, JSON.stringify(value)); }, archive);
    await page.reload(); await ready();
    for (const viewport of [{ width: 320, height: 400 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport); await open();
      const dialog = page.locator('.jm-history-dialog'), list = dialog.locator('.jm-results-list');
      assert.equal(await list.locator('li').count(), 20); assert.equal(await list.locator('img').count(), 0);
      assert.equal(await list.evaluate(element => element.scrollHeight > element.clientHeight), true, 'Die Ergebnisliste kann scrollen');
      const bounds = await dialog.boundingBox(), button = await dialog.locator('[data-dialog-action=close]').boundingBox();
      assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height + 1, 'Der Dialog passt ins Fenster: ' + JSON.stringify({ viewport, bounds }));
      assert.ok(button.y + button.height <= viewport.height + 1, 'Schließen bleibt erreichbar');
      await list.focus();
      await list.press('PageDown');
      await page.waitForFunction(() => document.querySelector('.jm-results-list').scrollTop > 0);
      await list.press('Escape'); await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.locator('[data-action=results]').evaluate(element => element === document.activeElement), true, 'Fokus kehrt zu Verlauf zurück');
    }
    assert.deepEqual(errors, []);
    console.log('OK: results only, correct button order, scrollable dialog, small screens, undo, offline restore and safe team names.');
  } finally { await context.close(); }
};
