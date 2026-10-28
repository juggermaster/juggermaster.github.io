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
    await require('./team-logos.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./stone-picker.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./haptics.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./sound-options.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./results.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./csv-export.cjs')(browser, 'http://127.0.0.1:4178/');
    await require('./countdown.cjs')(browser, 'http://127.0.0.1:4178/');
    const compact = await browser.newContext({ ...devices['iPhone 8'], viewport: { width:375, height:500 }, locale:'de-DE', colorScheme:'light', serviceWorkers:'block' });
    try {
      const page = await compact.newPage();
      await page.goto('http://127.0.0.1:4178/lizenzen.html');
      for (const selector of ['html', '.jm-app']) assert.equal(await page.locator(selector).evaluate(element => getComputedStyle(element).colorScheme), 'dark', 'Dokumente starten dunkel trotz hellem System');
      await page.goto('http://127.0.0.1:4178/');
      await page.locator('.jm-app[data-ready=true]').waitFor();
      for (const height of [400, 500, 550, 667, 850]) {
        await page.setViewportSize({ width:375, height });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForFunction(() => document.querySelector('.jm-scroll').scrollHeight <= document.querySelector('.jm-scroll').clientHeight + 1);
        assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollHeight <= element.clientHeight + 1), `iPhone 8/${height}: Spiel ohne Scrollen`);
        for (const action of ['toggle', 'score-a-plus', 'undo', 'new']) {
          const box = await page.locator(`[data-view=match] [data-action=${action}]`).boundingBox();
          const pane = await page.locator('.jm-scroll').boundingBox();
          const body = await page.locator('.jm-body').boundingBox();
          assert.ok(box.y >= pane.y && box.y + box.height <= Math.min(pane.y + pane.height, body.y + body.height) + 1, `${action}: vollständig sichtbar`);
        }
        if (process.env.COMPACT_SCREENSHOT && [500, 667].includes(height)) await page.screenshot({ path:process.env.COMPACT_SCREENSHOT.replace('.png', `-${height}.png`) });
      }
      await page.setViewportSize({ width:375, height:500 });
      if (process.env.COMPACT_SCREENSHOT) await page.screenshot({ path:process.env.COMPACT_SCREENSHOT });
      await page.locator('[data-tab=info]').click();
      const licenses = page.locator('[data-document="lizenzen.html"]');
      await licenses.locator('summary').click();
      const projectLicense = licenses.locator('[data-locale=de] [data-license="./LICENSE.txt"]');
      await page.route('**/LICENSE.txt', route => route.abort());
      await Promise.all([
        page.waitForEvent('requestfailed', { predicate:request => request.url().endsWith('/LICENSE.txt') }),
        projectLicense.locator('summary').click()
      ]);
      await page.waitForFunction(() => {
        const panel = document.querySelector('[data-locale=de] [data-license="./LICENSE.txt"]');
        return panel?.open && !panel.dataset.loading;
      });
      assert.equal(await projectLicense.locator('a.external').isVisible(), true, 'Bei Ladefehler bleibt der direkte Lizenzlink verfügbar');
      assert.equal(await projectLicense.getAttribute('data-loaded'), null);
      await projectLicense.locator('summary').click();
      await page.unroute('**/LICENSE.txt');
      await projectLicense.locator('summary').click();
      await projectLicense.locator('pre').waitFor({ state:'visible' });
      assert.match(await projectLicense.locator('pre').textContent(), /MIT License/);
      await page.locator('[data-tab=setup]').click();
      await page.locator('[data-setting=periods]').selectOption('2');
      assert.equal(await page.locator('[data-setting=limit]').inputValue(), '100');
      assert.equal(await page.locator('[data-setting=rounds]').inputValue(), '2');
      await page.locator('[data-setting=direction]').selectOption('up');
      assert.equal(await page.locator('[data-setting=direction]').inputValue(), 'up');
      const names = ['Team Alpha ', 'Team Beta '].map(name => name + 'X'.repeat(255 - name.length));
      for (const [index, side] of ['teamA', 'teamB'].entries()) {
        const input = page.locator(`[data-setting=${side}]`);
        assert.equal(await input.getAttribute('maxlength'), '255');
        await input.fill(names[index]);
      }
      await page.locator('[data-setting=periods]').selectOption('-1');
      await page.locator('[data-setting=targetPoints]').fill('1');
      await page.locator('[data-setting=setsToWin]').fill('1');
      await page.locator('[data-view=setup] [data-action=new]').click();
      await page.locator('[data-dialog-action=confirm]').click();
      await page.locator('.dialog').waitFor({ state:'hidden' });
      await page.reload(); await page.locator('.jm-app[data-ready=true]').waitFor();
      const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')));
      assert.equal(snapshot.config.teamA, names[0]); assert.equal(snapshot.config.teamB, names[1]);
      assert.ok(names.every(name => snapshot.teams.some(team => team.name === name)), 'Vollständige Namen bleiben in gespeicherten Teams erhalten');
      for (const [index, label] of ['team-a', 'team-b'].entries()) {
        const name = page.locator(`[data-read=${label}]`);
        assert.equal(await name.textContent(), names[index].toUpperCase());
        assert.equal(await name.getAttribute('title'), names[index]);
        assert.equal(await name.evaluate(element => getComputedStyle(element).textOverflow), 'ellipsis');
        assert.ok(await name.evaluate(element => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight), 'Lange Namen werden sichtbar gekürzt');
      }
      assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
      await page.setViewportSize({ width:375, height:400 });
      await page.locator('[data-action=score-a-plus]').click();
      const winner = page.locator('.dialog.jm-result-dialog');
      await winner.waitFor({ state:'visible' });
      await page.waitForFunction(() => {
        const box = document.querySelector('.dialog.jm-result-dialog').getBoundingClientRect();
        return box.y >= 0 && box.bottom <= innerHeight + 1;
      });
      assert.deepEqual(await winner.locator('.jm-final-score strong').allTextContents(), names);
      assert.equal(await winner.locator('.jm-final-score strong').evaluateAll(elements => elements.every(element => getComputedStyle(element).textOverflow === 'ellipsis')), true);
      const result = winner.locator('.jm-winner-message');
      assert.equal(await result.locator('span').last().textContent(), ' gewinnt · 1 : 0');
      assert.equal(await result.evaluate(element => {
        const row = element.getBoundingClientRect(), suffix = element.lastElementChild.getBoundingClientRect();
        return suffix.left >= row.left && suffix.right <= row.right + 1 && element.scrollWidth <= element.clientWidth + 1;
      }), true, 'Gewinntext und Ergebnis bleiben neben dem gekürzten Teamnamen vollständig sichtbar');
      const dialogBox = await winner.boundingBox();
      assert.ok(dialogBox.y >= 0 && dialogBox.y + dialogBox.height <= 401, 'Siegerdialog mit langen Namen passt auf kleine Displays');
      await winner.locator('[data-dialog-action=cancel]').click(); await winner.waitFor({ state:'hidden' });
      await page.locator('[data-tab=setup]').click();
      await page.locator('[data-setting=periods]').selectOption('-2');
      assert.equal(await page.locator('[data-setting=minutes]').inputValue(), '20');
      assert.equal(await page.locator('[data-setting=limit]').isVisible(), false);
      await page.locator('[data-view=setup] [data-action=new]').click();
      await page.locator('[data-dialog-action=confirm]').click();
      await page.locator('.dialog').waitFor({ state:'hidden' });
      assert.equal(await page.locator('[data-read=status]').getAttribute('data-running'), 'false');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')).game.deadline), null);
      for (const height of [400, 667]) {
        await page.setViewportSize({ width:375, height });
        await page.waitForFunction(() => document.querySelector('.jm-scroll').scrollHeight <= document.querySelector('.jm-scroll').clientHeight + 1);
        const clock = page.locator('[data-read=remaining-time]');
        assert.match(await clock.textContent(), /^(20:00|19:59)$/);
        assert.equal(await page.locator('[data-read=stones]').isVisible(), false);
        assert.ok(await clock.evaluate(element => {
          const box = element.getBoundingClientRect(), pane = document.querySelector('.jm-scroll').getBoundingClientRect();
          return box.left >= pane.left && box.right <= pane.right + 1 && box.top >= pane.top && box.bottom <= pane.bottom + 1;
        }), 'Minutenuhr passt auch auf kleine Displays');
      }
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
        const context = await browser.newContext({ ...devices[device], locale: locales[language].tag, colorScheme:'light' });
        const errors = [];
        context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
        try {
          const page = await context.newPage(); await page.goto('http://127.0.0.1:4178/');
          await page.locator('.jm-app[data-ready=true]').waitFor();
          assert.equal(await page.locator('[data-action=fullscreen]').count(), 0);
          assert.equal(await page.locator('.jm-symbol').evaluateAll(icons => icons.every(icon => icon.namespaceURI === 'http://www.w3.org/2000/svg' && icon.getAttribute('stroke') === 'currentColor')), true, 'Bedienicons sind einfarbige SVGs');
          assert.equal(await page.locator('meta[name=apple-mobile-web-app-status-bar-style]').count(), 0);
          assert.equal(await page.locator('.jm-statusbar').isHidden(), true, 'Kein Statusleisten-Overlay im normalen Browser');
          assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).colorScheme), 'dark', 'App startet dunkel trotz hellem System');
          for (const scheme of ['light', 'dark']) {
            await page.locator('[data-action=theme]').click();
            assert.equal(await page.locator('html').evaluate(element => element.style.colorScheme), scheme);
            assert.equal(await page.locator('.jm-app').evaluate(element => element.style.colorScheme), scheme);
            if (scheme === 'light' && device === 'iPhone 13' && language === 'de') {
              await page.reload(); await page.locator('.jm-app[data-ready=true]').waitFor();
              assert.equal(await page.locator('.jm-app').evaluate(element => getComputedStyle(element).colorScheme), 'light', 'Bewusste Hell-Auswahl bleibt nach Neuladen erhalten');
              await page.goto('http://127.0.0.1:4178/lizenzen.html');
              assert.equal(await page.locator('.jm-app').evaluate(element => getComputedStyle(element).colorScheme), 'light', 'Dokumente übernehmen die Hell-Auswahl');
              await page.goto('http://127.0.0.1:4178/'); await page.locator('.jm-app[data-ready=true]').waitFor();
            }
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
              assert.equal(await page.locator('[data-read=score-a]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'none');
              assert.equal(await page.locator('[data-read=score-a]').evaluate(element => element.dispatchEvent(new Event('contextmenu', { bubbles:true, cancelable:true }))), false);
              assert.equal(await page.locator('[data-read=score-a]').evaluate(element => element.firstChild.dispatchEvent(new Event('selectstart', { bubbles:true, cancelable:true }))), false);
            }
            if (view === 'setup') assert.equal(await page.locator('[data-setting=teamA]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'text');
            if (view === 'info') assert.equal(await page.locator('[data-view=info]').evaluate(element => getComputedStyle(element).webkitUserSelect), 'text');
            if (['setup', 'sound'].includes(view) && device === 'iPhone 13' && language === 'de') {
              for (const input of await page.locator(`[data-view=${view}] input[type=range]:visible`).all()) {
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
              await page.locator('[data-sound-target=signal]').click();
              await page.locator('[data-action=signal-preview]').click({ trial: true });
              assert.equal(await page.locator('[data-sound=beatNormalize], [data-sound=signalNormalize]').count(), 0);
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
          if (device === 'iPhone 13' && language === 'de') {
            const links = await licencePanel.locator('[data-locale=de] a').evaluateAll(links => links.map(link => ({ href:link.href, external:link.classList.contains('external') })));
            for (const link of links) {
              assert.equal(link.external, true, 'Dokumentlinks umgehen die App-Navigation');
              if (new URL(link.href).origin === new URL(infoUrl).origin) assert.equal((await context.request.get(link.href)).status(), 200, link.href);
            }
          }
          const licenseText = licencePanel.locator(`[data-locale="${language}"] [data-license]`).first();
          await licenseText.locator('summary').click();
          await licenseText.locator('pre').waitFor({ state:'visible' });
          assert.match(await licenseText.locator('pre').textContent(), /MIT License/);
          assert.equal(page.url(), infoUrl, 'Lizenztext öffnet ohne Seitenwechsel');
          assert.ok(await page.locator('.jm-scroll').evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'Langer Lizenztext bleibt innerhalb der Ansicht');
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      }
    }
    console.log('OK: WebKit, iPhone/iPad layouts, RTL, Asian text, licence pages. Real device audio/Bluetooth/calls require manual testing.');
  } finally {
    await browser?.close(); server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
