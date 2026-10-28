const assert = require('node:assert/strict');
const sharp = require('sharp');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' });
  context.setDefaultTimeout(15000);
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')));
  const image = side => page.locator(`[data-view=match] [data-team-logo=${side}]`);
  const upload = async (name, mimeType, buffer) => {
    await page.locator('[data-team-logo-file=teamA]').setInputFiles({ name, mimeType, buffer });
    await page.waitForFunction(() => !document.querySelector('[data-team-logo-file=teamA]').disabled);
  };
  try {
    await page.goto(url + '#setup'); await ready();
    for (const [side, file] of [['teamA', 'team-raven.png'], ['teamB', 'team-wolf.png']]) {
      assert.ok((await image(side).getAttribute('src')).endsWith(file), 'Standardteams haben eigene PNG-Logos');
      await page.locator(`[data-view=setup] [data-team-logo=${side}]`).evaluate(image => image.decode());
      const remove = page.locator(`[data-team-logo-remove=${side}]`);
      assert.equal(await remove.isVisible(), true, 'Standardlogos haben ebenfalls einen Mülleimer');
      assert.equal(await remove.locator('svg').count(), 1);
      assert.equal(await remove.getAttribute('aria-label'), 'Logo entfernen');
    }
    await page.locator('[data-team-choice=teamA]').selectOption('Raben');
    const original = (await saved()).game;
    const png = await sharp({ create: { width: 2048, height: 1024, channels: 4, background: '#e6933e80' } }).png().toBuffer();
    await upload('large-logo.png', 'image/png', png);
    const logo = (await saved()).teams.find(team => team.name === 'Raben').logo;
    assert.match(logo, /^data:image\/(webp|png);base64,/);
    assert.ok(logo.length < 400000, 'Gespeichert wird nur die verkleinerte Bildfassung');
    assert.deepEqual(await image('teamA').evaluate(async image => { await image.decode(); return [image.naturalWidth, image.naturalHeight]; }), [256, 128], 'Große Bilder werden ohne Beschnitt proportional verkleinert');
    await upload('broken.png', 'image/png', Buffer.from('not an image'));
    await page.locator('[data-team-logo-notice=teamA]').waitFor({ state: 'visible' });
    assert.equal((await saved()).teams.find(team => team.name === 'Raben').logo, logo, 'Ungültiges Bild erhält das bestehende Logo');
    await upload('too-large.png', 'image/png', Buffer.alloc(10 * 1024 * 1024 + 1));
    assert.equal((await saved()).teams.find(team => team.name === 'Raben').logo, logo, 'Zu große Datei erhält das bestehende Logo');
    const source = sharp({ create: { width: 64, height: 32, channels: 4, background: '#76a38b' } });
    const bmp = Buffer.alloc(54 + 64 * 32 * 3);
    bmp.write('BM'); bmp.writeUInt32LE(bmp.length, 2); bmp.writeUInt32LE(54, 10);
    bmp.writeUInt32LE(40, 14); bmp.writeUInt32LE(64, 18); bmp.writeUInt32LE(32, 22);
    bmp.writeUInt16LE(1, 26); bmp.writeUInt16LE(24, 28); bmp.fill(0x76, 54);
    const formats = [
      ['jpg', 'image/jpeg', await source.clone().jpeg().toBuffer()],
      ['webp', 'image/webp', await source.clone().webp().toBuffer()],
      ['gif', 'image/gif', await source.clone().gif().toBuffer()],
      ['bmp', 'image/bmp', bmp],
      ['avif', 'image/avif', await source.clone().avif().toBuffer()],
      ['svg', 'image/svg+xml', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><path fill="#c9724f" d="M0 0h64v32H0z"/></svg>')]
    ];
    for (const [extension, mimeType, buffer] of formats) {
      const previous = (await saved()).teams.find(team => team.name === 'Raben').logo;
      await upload('logo.' + extension, mimeType, buffer);
      if (extension === 'avif' && browser.browserType().name() === 'webkit' && await page.locator('[data-team-logo-notice=teamA]').isVisible()) {
        assert.equal((await saved()).teams.find(team => team.name === 'Raben').logo, previous, 'Fehlender AVIF-Decoder erhält das bestehende Logo');
        continue;
      }
      assert.equal(await page.locator('[data-team-logo-notice=teamA]').isVisible(), false, extension);
      assert.deepEqual(await image('teamA').evaluate(async image => { await image.decode(); return [image.naturalWidth, image.naturalHeight]; }), [64, 32], `${extension}: kleine Bilder werden nicht vergrößert`);
    }
    const stored = (await saved()).teams.find(team => team.name === 'Raben').logo;
    await page.locator('[data-setting=teamA]').fill('Falken'); await page.locator('[data-setting=teamA]').press('Tab');
    assert.equal(await image('teamA').getAttribute('src'), null, 'Neues Team übernimmt kein fremdes Logo');
    assert.ok(await page.locator('[data-read=team-a]').evaluate(label => parseFloat(getComputedStyle(label.parentElement).fontSize)) >= 18, 'Ohne Logo ersetzt ein großer Teamname das Bild');
    await page.locator('[data-team-color-remove=teamA]').click();
    assert.equal(await page.locator('[data-setting=colorA]').isEnabled(), true);
    assert.equal(await page.locator('[data-team-color-remove=teamA]').isEnabled(), false);
    assert.equal((await saved()).config.colorA, '');
    assert.equal((await saved()).teams.find(team => team.name === 'Falken').color, '');
    assert.equal(await page.locator('.jm-team[data-team-side=teamA]').evaluate(team => getComputedStyle(team, '::before').backgroundColor), 'rgba(0, 0, 0, 0)', 'Ohne Teamfarbe bleibt kein Farbstreifen');
    await page.reload(); await ready();
    assert.equal(await page.locator('[data-team-color-remove=teamA]').isEnabled(), false, 'Entfernte Farbe bleibt beim Neustart entfernt');
    await page.locator('[data-team-choice=teamA]').selectOption('Raben');
    await page.locator('[data-team-choice=teamA]').selectOption('Falken');
    assert.equal(await page.locator('[data-team-color-remove=teamA]').isEnabled(), false, 'Gespeicherte Teamwahl stellt auch die leere Farbe wieder her');
    await page.locator('[data-setting=colorA]').dispatchEvent('click');
    assert.equal(await page.locator('[data-setting=colorA]').isEnabled(), true);
    assert.match((await saved()).config.colorA, /^#[0-9a-f]{6}$/i);
    await page.locator('[data-team-choice=teamA]').selectOption('Raben');
    assert.equal(await image('teamA').getAttribute('src'), stored, 'Gespeicherte Teamwahl stellt Logo wieder her');
    await page.reload(); await ready();
    assert.equal(await image('teamA').getAttribute('src'), stored, 'Logo bleibt beim Neustart erhalten');
    await page.locator('[data-tab=match]').click();
    assert.equal(await page.locator('[data-read=stone-hint]').count(), 0, 'Kein Bedienhinweis unter dem Zähler');
    for (const key of ['team-a', 'team-b']) assert.equal(await page.locator(`[data-read=${key}]`).evaluate(label => Boolean(label.closest('.jm-team-brand')) && !label.closest('.jm-team')), true, 'Teamname steht beim Logo');
    const counter = page.locator('[data-read=stones]');
    await counter.fill('2'); await counter.press('Enter');
    assert.equal(await page.locator('[data-read=start-label]').textContent(), 'Spiel fortsetzen');
    await counter.fill('9'); await counter.press('Escape');
    assert.equal(await counter.inputValue(), '2', 'Escape verwirft Änderungen am Eingabefeld');
    await counter.fill('102'); await counter.press('Enter');
    for (const [width, height] of [[320, 568], [375, 500], [654, 886], [736, 1000], [1024, 768]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.waitForFunction(() => document.querySelector('.jm-scroll').scrollHeight <= document.querySelector('.jm-scroll').clientHeight + 1);
      assert.equal(await image('teamA').isVisible(), true);
      assert.equal(await image('teamB').isVisible(), true);
      assert.equal(await image('teamA').evaluate(image => getComputedStyle(image).objectFit), 'contain');
      const { left, right, a, b, counter } = await page.evaluate(() => ({
        left: document.querySelector('[data-view=match] [data-team-logo=teamA]').getBoundingClientRect().toJSON(),
        right: document.querySelector('[data-view=match] [data-team-logo=teamB]').getBoundingClientRect().toJSON(),
        a: document.querySelectorAll('.jm-team')[0].getBoundingClientRect().toJSON(),
        b: document.querySelectorAll('.jm-team')[1].getBoundingClientRect().toJSON(),
        counter: document.querySelector('[data-read=stones]').getBoundingClientRect().toJSON()
      }));
      assert.ok(Math.abs(left.x + left.width / 2 - a.x - a.width / 2) < 2 && Math.abs(right.x + right.width / 2 - b.x - b.width / 2) < 2, 'Jedes Logo steht mittig über seiner Team-Box');
      assert.ok(left.y + left.height <= a.y + 1 && right.y + right.height <= b.y + 1, 'Logos stehen oberhalb der Punkteboxen');
      assert.ok(left.x + left.width <= counter.x + 1 && right.x >= counter.x + counter.width - 1, 'Dreistelliger Zähler und Logos überlappen sich nicht');
      await page.locator('[data-action=score-a-plus]').click({ trial: true });
      await page.locator('[data-action=toggle]').focus();
      const actions = await page.locator('[data-view=match]>.jm-actions').boundingBox(), toggle = await page.locator('[data-action=toggle]').boundingBox();
      assert.ok(toggle.y - actions.y - actions.height >= 6, 'Hauptbutton und Buttonzeile behalten Abstand, auch mit Fokusrahmen');
      if (width < 700 && height > 740) assert.ok(toggle.y - actions.y - actions.height <= 15, 'Fortsetzen-Button bleibt bei der Buttonzeile');
    }
    for (let i = 0; i < 2; i++) await page.locator('[data-action=undo]').click();
    await page.waitForFunction(() => document.querySelector('.jm-offline').hidden);
    await context.setOffline(true); await page.reload(); await ready();
    assert.equal(await image('teamA').getAttribute('src'), stored, 'Eigenes Logo funktioniert offline');
    await image('teamB').evaluate(image => image.decode());
    await page.locator('[data-tab=setup]').click();
    await page.locator('[data-team-logo-remove=teamA]').click();
    assert.equal(await image('teamA').getAttribute('src'), null, 'Mülleimer entfernt das hochgeladene Logo ohne Ersatzbild');
    assert.equal((await saved()).teams.find(team => team.name === 'Raben').logo, '');
    assert.equal(await page.locator('[data-team-logo-remove=teamA]').isVisible(), false);
    await page.locator('[data-team-logo-remove=teamB]').click();
    assert.equal(await image('teamB').getAttribute('src'), null, 'Auch das Standardlogo lässt sich entfernen');
    await page.reload(); await ready();
    for (const side of ['teamA', 'teamB']) assert.equal(await image(side).getAttribute('src'), null, 'Entfernte Logos bleiben nach Offline-Neustart entfernt');
    await page.locator('[data-action=defaults]').click();
    for (const [side, file] of [['teamA', 'team-raven.png'], ['teamB', 'team-wolf.png']]) {
      assert.ok((await image(side).getAttribute('src')).endsWith(file), 'Voreinstellungen stellen entfernte Standardlogos wieder her');
      assert.equal(await page.locator(`[data-team-logo-remove=${side}]`).isVisible(), true);
    }
    await page.reload(); await ready();
    assert.ok((await image('teamA').getAttribute('src')).endsWith('team-raven.png'), 'Wiederhergestellte Standardlogos bleiben gespeichert');
    await upload('replacement.png', 'image/png', png);
    assert.match(await image('teamA').getAttribute('src'), /^data:image\/(webp|png);base64,/);
    assert.equal(await page.locator('[data-team-logo-remove=teamA]').isVisible(), true, 'Nach erneutem Upload ist der Mülleimer wieder verfügbar');
    await page.locator('[data-action=defaults]').click();
    assert.ok((await image('teamA').getAttribute('src')).endsWith('team-raven.png'), 'Voreinstellungen ersetzen auch hochgeladene Logos durch das Standardlogo');
    await page.reload(); await ready();
    for (const [side, file] of [['teamA', 'team-raven.png'], ['teamB', 'team-wolf.png']]) {
      assert.ok((await image(side).getAttribute('src')).endsWith(file), 'Standardlogos bleiben nach erneutem Laden erhalten');
    }
    assert.deepEqual((await saved()).game, original, 'Logoänderungen verändern keinen Spielstand');
    assert.deepEqual(errors, []);
    console.log('OK: PNG-Standardlogos, Bildformate, proportionale Verkleinerung, Teamwahl, Spielansicht und Offline-Speicherung.');
  } finally { await context.close(); }
};
