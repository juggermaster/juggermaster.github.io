const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { webkit, devices } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const server = spawn(process.execPath, ['web/scripts/serve.mjs'], { env: { ...process.env, PORT: '4178' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      server.stdout.once('data', resolve);
      server.once('error', reject);
      server.once('exit', code => reject(Error(`Preview server exited: ${code}`)));
    });
    browser = await webkit.launch();
    const compact = await browser.newContext({ ...devices['iPhone 8'], viewport: { width:375, height:500 }, locale:'de-DE', serviceWorkers:'block' });
    try {
      const page = await compact.newPage();
      await page.goto('http://127.0.0.1:4178/');
      await page.locator('.jm-app[data-ready=true]').waitFor();
      for (const height of [400, 500, 550, 667, 850]) {
        await page.setViewportSize({ width:375, height });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForFunction(() => document.querySelector('.jm-scroll').scrollHeight <= document.querySelector('.jm-scroll').clientHeight + 1);
        assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollHeight <= element.clientHeight + 1), `iPhone 8/${height}: Spiel ohne Scrollen`);
        for (const action of ['toggle', 'stone-plus', 'score-a-plus', 'undo', 'next', 'new']) {
          const box = await page.locator(`[data-view=match] [data-action=${action}]`).boundingBox();
          const pane = await page.locator('.jm-scroll').boundingBox();
          const body = await page.locator('.jm-body').boundingBox();
          assert.ok(box.y >= pane.y && box.y + box.height <= Math.min(pane.y + pane.height, body.y + body.height) + 1, `${action}: vollständig sichtbar`);
        }
        if (process.env.COMPACT_SCREENSHOT && [500, 667].includes(height)) await page.screenshot({ path:process.env.COMPACT_SCREENSHOT.replace('.png', `-${height}.png`) });
      }
      await page.setViewportSize({ width:375, height:500 });
      if (process.env.COMPACT_SCREENSHOT) await page.screenshot({ path:process.env.COMPACT_SCREENSHOT });
    } finally { await compact.close(); }
    if (process.env.COMPACT_SCREENSHOT) {
      const preview = await browser.newContext({ ...devices['iPhone 8'], locale:'de-DE' });
      try {
        const page = await preview.newPage();
        await page.goto('http://127.0.0.1:4178/');
        await page.locator('.jm-app[data-ready=true]').waitFor();
        await page.locator('.jm-offline').waitFor({ state:'hidden' });
        for (const height of [500, 667]) {
          await page.setViewportSize({ width:375, height });
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.waitForFunction(() => document.querySelector('.jm-scroll').scrollHeight <= document.querySelector('.jm-scroll').clientHeight + 1);
          await page.screenshot({ path:process.env.COMPACT_SCREENSHOT.replace('.png', `-${height}.png`) });
        }
      } finally { await preview.close(); }
    }
    const { locales } = await import(pathToFileURL(path.resolve('web/src/locale.mjs')).href);
    for (const device of ['iPhone 13', 'iPad Mini']) {
      for (const language of ['de', 'en', 'he', 'ja', 'zh-Hant']) {
        const context = await browser.newContext({ ...devices[device], locale: locales[language].tag });
        const errors = [];
        context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
        try {
          const page = await context.newPage(); await page.goto('http://127.0.0.1:4178/');
          await page.locator('.jm-app[data-ready=true]').waitFor();
          assert.equal(await page.locator('meta[name=apple-mobile-web-app-status-bar-style]').count(), 0);
          assert.equal(await page.locator('.jm-statusbar').isHidden(), true, 'Kein Statusleisten-Overlay im normalen Browser');
          await page.emulateMedia({ colorScheme: 'light' });
          for (const scheme of ['dark', 'light', 'dark']) {
            await page.locator('[data-action=theme]').click();
            assert.equal(await page.locator('html').evaluate(element => element.style.colorScheme), scheme);
            assert.equal(await page.locator('.jm-app').evaluate(element => element.style.colorScheme), scheme);
          }
          assert.equal(await page.locator('.jm-scroll>.jm-alert, .jm-home-hint').count(), 0, 'Keine Hinweiszeile unter dem Header');
          assert.equal(await page.locator('html').getAttribute('lang'), language);
          for (const view of ['match', 'setup', 'sound', 'info']) {
            await page.locator(`[data-tab=${view}]`).click();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}/${language}/${view}`);
            assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${device}/${language}/${view}: kein seitliches Scrollen`);
            const navBefore = await page.locator('.jm-nav').boundingBox();
            const headBefore = await page.locator('.jm-head').boundingBox();
            assert.ok(Math.abs(navBefore.y + navBefore.height - await page.evaluate(() => innerHeight)) <= 1, 'Tabs am Bildschirmrand');
            await page.locator('.jm-scroll').evaluate(element => { element.scrollTop = element.scrollHeight; });
            assert.ok(Math.abs((await page.locator('.jm-head').boundingBox()).y - headBefore.y) <= 1, 'Header bleibt fest');
            assert.equal((await page.locator('.jm-nav').boundingBox()).y, navBefore.y, 'Tabs scrollen nicht mit');
            if (view === 'match') await page.locator('[data-view=match] [data-action=new]').click({ trial: true });
            if (view === 'match') {
              assert.equal(await page.locator('[data-read=stones]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'none');
              assert.equal(await page.locator('[data-read=stones]').evaluate(element => element.dispatchEvent(new Event('contextmenu', { bubbles:true, cancelable:true }))), false);
            }
            if (view === 'setup') assert.equal(await page.locator('[data-setting=teamA]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'text');
            if (view === 'info') assert.equal(await page.locator('[data-view=info]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'text');
            if (['setup', 'sound'].includes(view) && device === 'iPhone 13' && language === 'de') {
              for (const input of await page.locator(`[data-view=${view}] input[type=range]`).all()) {
                await input.locator('..').scrollIntoViewIfNeeded();
                const value = await input.inputValue();
                const fraction = await input.evaluate(element => (Number(element.value) - Number(element.min)) / (Number(element.max) - Number(element.min)));
                const bar = input.locator('..');
                const box = await bar.boundingBox();
                await bar.tap({ position:{ x:box.width * (fraction < .5 ? .9 : .1), y:box.height / 2 } });
                assert.equal(await input.inputValue(), value, 'Antippen der Reglerleiste verändert keinen Wert');
              }
            }
            if (view === 'sound') {
              await page.locator('[data-action=signal-preview]').click({ trial: true });
              for (const key of ['beatNormalize', 'signalNormalize']) {
                const input = page.locator(`[data-sound=${key}]`);
                assert.equal(await input.isChecked(), true); await input.uncheck();
                assert.equal(await input.isChecked(), false); await input.check();
              }
            }
          }
          await page.locator('[data-tab=info]').click();
          assert.equal(await page.locator('[data-view=info]').isVisible(), true);
          const guide = page.locator('.jm-home-guide details').nth(1);
          await guide.locator('summary').click(); assert.equal(await guide.locator('li:visible').count(), 5);
          const licencePanel = page.locator('[data-document="lizenzen.html"]');
          const infoUrl = page.url();
          await licencePanel.locator('summary').click();
          await licencePanel.locator(`[data-locale="${language}"]`).waitFor({ state: 'visible' });
          assert.equal(page.url(), infoUrl, 'Lizenzen öffnen innerhalb der Infoansicht');
          await page.waitForFunction(() => document.documentElement.style.colorScheme === 'dark');
          const licence = await licencePanel.locator(`[data-locale="${language}"] a`).first().getAttribute('href');
          assert.equal(licence, './LICENSE.txt');
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      }
    }
    console.log('OK: WebKit, iPhone/iPad layouts, RTL, Asian text, licence pages. Real device audio/Bluetooth/calls require manual testing.');
  } finally {
    await browser?.close(); server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
