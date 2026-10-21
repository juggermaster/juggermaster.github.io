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
          assert.equal(await page.locator('html').getAttribute('lang'), language);
          for (const view of ['setup', 'sound', 'info']) {
            await page.locator(`[data-tab=${view}]`).click();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}/${language}/${view}`);
            const navBefore = await page.locator('.jm-nav').boundingBox();
            assert.ok(Math.abs(navBefore.y + navBefore.height - await page.evaluate(() => innerHeight)) <= 1, 'Tabs am Bildschirmrand');
            await page.locator('.jm-body').evaluate(element => { element.scrollTop = element.scrollHeight; });
            assert.equal((await page.locator('.jm-nav').boundingBox()).y, navBefore.y, 'Tabs scrollen nicht mit');
            if (view === 'sound') await page.locator('[data-action=signal-preview]').click({ trial: true });
          }
          await page.locator('a[href="./lizenzen.html"]').click();
          await page.locator(`[data-locale="${language}"]`).waitFor({ state: 'visible' });
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
