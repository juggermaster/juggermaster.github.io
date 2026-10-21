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
    const { locales } = await import(pathToFileURL(path.resolve('web/src/locale.mjs')).href);
    for (const device of ['iPhone 13', 'iPad Mini']) {
      for (const language of ['de', 'en', 'he', 'ja', 'zh-Hant']) {
        const context = await browser.newContext({ ...devices[device], locale: locales[language].tag });
        const errors = [];
        context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
        try {
          const page = await context.newPage(); await page.goto('http://localhost:4178/');
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
          for (const view of ['setup', 'sound', 'info']) {
            await page.locator(`[data-tab=${view}]`).click();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}/${language}/${view}`);
            assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${device}/${language}/${view}: kein seitliches Scrollen`);
            const navBefore = await page.locator('.jm-nav').boundingBox();
            const headBefore = await page.locator('.jm-head').boundingBox();
            assert.ok(Math.abs(navBefore.y + navBefore.height - await page.evaluate(() => innerHeight)) <= 1, 'Tabs am Bildschirmrand');
            await page.locator('.jm-scroll').evaluate(element => { element.scrollTop = element.scrollHeight; });
            const scrollTop = await page.locator('.jm-scroll').evaluate(element => element.scrollTop);
            assert.ok(Math.abs((await page.locator('.jm-head').boundingBox()).y - headBefore.y + scrollTop) <= 1, 'Header scrollt mit');
            assert.equal((await page.locator('.jm-nav').boundingBox()).y, navBefore.y, 'Tabs scrollen nicht mit');
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
          await page.locator('a[href="./lizenzen.html"]').click();
          await page.locator(`[data-locale="${language}"]`).waitFor({ state: 'visible' });
          await page.waitForFunction(() => document.documentElement.style.colorScheme === 'dark');
          const licence = await page.locator(`[data-locale="${language}"] a`).first().getAttribute('href');
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
