const assert = require('node:assert/strict');
const path = require('node:path');

function wave(seconds = .4) {
  const rate = 22050, frames = Math.round(rate * seconds), bytes = Buffer.alloc(44 + frames * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i++) bytes.writeInt16LE(Math.round(Math.sin(i / rate * Math.PI * 880) * 10000 * Math.exp(-i / frames * 4)), 44 + i * 2);
  return bytes;
}
module.exports = async (browser, url) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' });
  const page = await context.newPage(), errors = [], external = [], importErrors = [];
  page.on('console', message => { if (message.type() === 'warning' && message.text().startsWith('Audio import failed:')) importErrors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(url).origin) external.push(request.url()); });
  await context.addInitScript(() => {
    window.__samples = []; window.__sampleStops = []; window.__sampleSequence = 0;
    if (!window.AudioContext) return;
    const original = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = original.call(this), start = source.start.bind(source), stop = source.stop.bind(source), id = window.__sampleSequence++;
      source.start = (...args) => { window.__samples.push({ id, duration: source.buffer?.duration, at: args[0] }); return start(...args); };
      source.stop = (...args) => { window.__sampleStops.push({ id, at: args[0] }); return stop(...args); };
      return source;
    };
  });
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')));
  const target = value => page.locator(`[data-sound-target=${value}]`).click();
  const upload = (name, buffer) => page.locator('[data-audio-file]').setInputFiles({ name, mimeType: 'audio/wav', buffer });
  const ready = () => page.locator('.jm-app[data-ready=true]').waitFor();
  const adjustSound = async key => {
    const continuous = await page.locator('[data-sound-target=beat]').getAttribute('aria-selected') === 'true';
    const input = page.locator(`[data-sound=${key}]`), control = input.locator('..');
    await control.scrollIntoViewIfNeeded();
    const before = await input.inputValue(), bar = await control.boundingBox(), knob = await control.locator('.range-knob').boundingBox();
    const x = knob.x + knob.width / 2, y = knob.y + knob.height / 2;
    await page.evaluate(() => { window.__samples = []; });
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + (x > bar.x + bar.width / 2 ? -1 : 1) * bar.width * .15, y, { steps: 8 });
    assert.notEqual(await input.inputValue(), before, 'Der Regler wurde tatsächlich bewegt');
    if (continuous) {
      await page.waitForFunction(() => window.__samples.length > 0);
      assert.equal(await page.evaluate(() => window.__samples.length), 1, 'Reglerbewegung startet einen Dauertakt ohne Neustart bei jeder Bewegung');
      assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'true');
    } else assert.equal(await page.evaluate(() => window.__samples.length), 0, 'Endsignal startet erst beim Loslassen');
    await page.mouse.up();
    await page.waitForFunction(() => window.__samples.length > 0);
    assert.equal(await page.evaluate(() => window.__samples.length), 1, 'Nach Loslassen ist genau ein Probeklang gestartet');
    await page.waitForTimeout(1700);
    if (continuous) {
      const samples = await page.evaluate(() => window.__samples);
      assert.ok(samples.length >= 2, 'Takt läuft nach dem Loslassen weiter');
      const pace = (await state()).config.pace;
      for (let i = 1; i < samples.length; i++) assert.ok(Math.abs(samples[i].at - samples[i - 1].at - pace) < .001, 'Reglerbewegung hält den gewählten Takt ein');
      await page.locator('[data-action=beat-preview]').click();
      const stopped = await page.evaluate(() => window.__samples.length);
      await page.waitForTimeout(1700);
      assert.equal(await page.evaluate(() => window.__samples.length), stopped, 'Takt stoppen beendet auch die durch einen Regler gestartete Vorschau');
    } else assert.equal(await page.evaluate(() => window.__samples.length), 1, 'Endsignal wiederholt sich nicht');
  };
  const renderInstruments = () => page.evaluate(async () => {
    const base = document.querySelector('script[type=module]').src;
    const { instrumentBuffer } = await import(new URL('soundbank.mjs', base));
    const { instruments } = await import(new URL('instruments.mjs', base));
    const result = {};
    const context = { sampleRate: 22050, createBuffer(channels, length, rate) {
      const data = new Float32Array(length);
      return { duration: length / rate, getChannelData: () => data };
    } };
    for (const name of Object.keys(instruments)) {
      const buffer = await instrumentBuffer(context, name);
      let energy = 0; for (const value of buffer.getChannelData(0)) energy += value * value;
      result[name] = energy;
    }
    return result;
  });
  try {
    await page.goto(url + '#sound'); await ready();
    assert.equal(await page.locator('[data-instrument] option').count(), 86);
    assert.equal(await page.locator('option[value=triangle]').textContent(), 'Triangel');
    assert.equal(await page.locator('option[value=claves]').textContent(), 'Klanghölzer (Claves)');
    assert.deepEqual(await page.locator('[data-instrument] option').evaluateAll(options => options.slice(-3).map(option => option.value)), ['stone', 'deep', 'drum']);
    assert.equal(await page.locator('[data-instrument]').getAttribute('aria-label'), 'Instrumente');
    assert.equal(await page.locator('[data-preset]').count(), 0, 'Bisherige Klänge werden nur über die Instrumentenliste gewählt');
    assert.equal(await page.locator('.jm-sound-tabs [role=tab]').count(), 2);
    assert.equal(await page.locator('#jm-sound-editor > :first-child [data-action=beat-preview]').isVisible(), true);
    assert.equal(await page.locator('[data-action=signal-preview]').isVisible(), false);
    assert.equal(await page.locator('[data-setting=signalCount]').isVisible(), false);
    await page.locator('[data-sound-target=beat]').press('ArrowRight');
    assert.equal(await page.locator('[data-sound-target=signal]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.getByRole('tabpanel').getAttribute('aria-labelledby'), 'jm-sound-signal-tab');
    assert.equal(await page.locator('#jm-sound-editor > :first-child [data-action=signal-preview]').isVisible(), true);
    assert.equal(await page.locator('[data-action=beat-preview]').isVisible(), false);
    assert.equal(await page.locator('#jm-sound-editor > .jm-sound-preview + .jm-field [data-setting=signalCount]').isVisible(), true);
    assert.equal(await page.locator('[data-setting=signalCount]').inputValue(), '1');
    assert.equal(await page.locator('[data-instrument]').inputValue(), 'largeGong');
    await page.locator('[data-sound-target=signal]').press('Home');
    assert.equal(await page.locator('[data-sound-target=beat]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[data-sound-target=signal]').getAttribute('tabindex'), '-1');
    for (const [preset,kind] of [['stone','stone'],['deep','gong'],['drum','drum']]) {
      await page.locator('[data-instrument]').selectOption(preset);
      assert.equal((await state()).sound.kind, kind);
      assert.equal((await state()).sound.end.instrument, 'largeGong', 'Instrumentwahl bleibt auf den aktiven Reiter beschränkt');
    }
    await target('signal'); await target('beat');
    assert.equal(await page.locator('[data-sound=beatNormalize], [data-sound=signalNormalize]').count(), 0);
    if (!await page.evaluate(() => Boolean(window.AudioContext))) {
      const rendered = await renderInstruments();
      for (const [name, energy] of Object.entries(rendered)) assert.ok(Number.isFinite(energy) && energy > 0, `${name}: PCM vor dem Lautstärkeausgleich`);
      assert.deepEqual(errors, []); assert.deepEqual(external, []);
      console.log('OK: SpessaSynth PCM rendering in WebKit. This WebKit build has no Web Audio; playback and file decoding require real Safari testing.');
      return;
    }
    for (const instrument of ['triangle', 'claves', 'timpani']) {
      await page.locator('[data-instrument]').selectOption(instrument);
      await page.waitForFunction(instrument => JSON.parse(localStorage.getItem('juggermaster:state:v2')).sound.instrument === instrument, instrument);
    }
    await page.waitForFunction(() => window.__samples.length > 0);
    assert.equal((await state()).sound.kind, 'spessa');
    assert.equal((await state()).sound.end.instrument, 'largeGong');
    await target('signal'); await page.locator('[data-instrument]').selectOption('largeGong');
    await page.waitForFunction(() => window.__samples.some(sample => sample.duration === 12));
    await page.locator('[data-sound-target=beat]').click();
    assert.equal(await page.locator('[data-instrument]').inputValue(), 'timpani');
    await upload('my-beat.wav', wave());
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')).sound.kind === 'custom' || document.querySelector('[data-read=sound-notice]').textContent === 'Audiodatei konnte nicht geladen oder gespeichert werden.');
    assert.equal((await state()).sound.kind, 'custom', JSON.stringify(importErrors));
    assert.equal((await state()).sound.end.instrument, 'largeGong');
    await adjustSound('volume');
    if (browser.browserType().name() === 'chromium') {
      const legacy = await page.evaluate(async () => {
        const database = await new Promise((resolve, reject) => { const request = indexedDB.open('juggermaster:audio:v1', 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        try {
          await new Promise((resolve, reject) => {
            const transaction = database.transaction('files', 'readwrite');
            transaction.objectStore('files').put({ file: new File(['kept'], 'legacy.wav', { type: 'audio/wav' }), duration: .4 }, 'legacy');
            transaction.oncomplete = resolve; transaction.onabort = () => reject(transaction.error);
          });
        } finally { database.close(); }
        const { audioFile } = await import(new URL('audio-files.mjs', document.querySelector('script[type=module]').src));
        const saved = await audioFile('legacy'); await audioFile('legacy', 'delete');
        return { name: saved.file.name, contents: await saved.file.text(), duration: saved.duration };
      });
      assert.deepEqual(legacy, { name: 'legacy.wav', contents: 'kept', duration: .4 }, 'Bisher gespeicherte Dateiobjekte bleiben lesbar');
    }
    await target('signal'); await page.locator('[data-audio-file]').setInputFiles(path.join(__dirname, 'fixtures/gong.mp3'));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')).sound.end.kind === 'custom');
    await page.reload(); await ready(); await target('signal');
    await page.locator('[data-action=use-custom]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-action=use-custom]').textContent(), 'gong.mp3');
    await adjustSound('pitch');
    const beatVolume = (await state()).sound.volume;
    await page.locator('[data-setting=signalCount]').fill('10');
    await adjustSound('signalVolume');
    assert.equal((await state()).sound.volume, beatVolume, 'Endsignal-Probeklang verändert die Taktlautstärke nicht');
    await page.locator('[data-setting=signalCount]').fill('3');
    const saved = (await state()).sound;
    await upload('broken.wav', Buffer.from('invalid audio'));
    await page.locator('[data-read=sound-notice]').waitFor({ state:'visible' });
    assert.deepEqual((await state()).sound, saved, 'Ungültige Datei erhält den letzten Klang');
    await upload('too-long.wav', wave(31));
    await page.waitForFunction(() => !document.querySelector('[data-audio-file]').disabled);
    assert.deepEqual((await state()).sound, saved, 'Zu lange Datei erhält den letzten Klang');
    await page.locator('[data-action=signal-preview]').click();
    await page.waitForFunction(() => window.__samples.length >= 3);
    assert.ok((await page.evaluate(() => window.__samples)).every(sample => sample.duration < 2), 'Endsignal nutzt die eigene MP3');
    await page.locator('[data-action=delete-custom]').click();
    await page.locator('[data-read=custom-file]').waitFor({ state:'hidden' });
    assert.equal((await state()).sound.end.kind, 'drum'); assert.equal((await state()).sound.kind, 'custom');
    await target('beat'); assert.equal(await page.locator('[data-action=use-custom]').textContent(), 'my-beat.wav');
    await page.locator('[data-action=beat-preview]').click();
    await page.waitForFunction(() => window.__samples.some(sample => sample.duration > .39 && sample.duration < .41));
    await page.locator('[data-action=beat-preview]').click();
    await upload('long-beat.wav', wave(4));
    await page.waitForFunction(() => !document.querySelector('[data-audio-file]').disabled);
    assert.equal(await page.locator('[data-action=beat-preview]').getAttribute('aria-pressed'), 'false', 'Regleranzeige nach Dateiimport startet keine Hörprobe');
    await page.evaluate(() => { window.__samples = []; window.__sampleStops = []; });
    await page.locator('[data-action=beat-preview]').click();
    await page.waitForFunction(() => window.__samples.length >= 2);
    await page.locator('[data-sound=pitch]').evaluate(input => { input.value = 220; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForFunction(() => window.__samples.length >= 3);
    const longBeat = await page.evaluate(() => ({ starts: window.__samples, stops: window.__sampleStops }));
    for (let i = 0; i < 2; i++) assert.ok(longBeat.stops.some(stop => stop.id === longBeat.starts[i].id && Math.abs(stop.at - longBeat.starts[i + 1].at) < .001), 'Lange eigene Taktdatei endet vor dem nächsten Schlag, auch bei Tonhöhenänderung');
    await page.locator('[data-action=beat-preview]').click();
    for (const [key,value] of [['volume',25],['signalVolume',80]]) await page.locator(`[data-sound=${key}]`).evaluate((input,value) => { input.value = value; input.dispatchEvent(new Event('input',{bubbles:true})); }, value);
    assert.equal((await state()).sound.volume, 25); assert.equal((await state()).sound.signalVolume, 80);
    const rendered = await renderInstruments();
    for (const [name, energy] of Object.entries(rendered)) assert.ok(Number.isFinite(energy) && energy > 0, `${name}: PCM vor dem Lautstärkeausgleich`);
    await page.waitForFunction(() => document.querySelector('.jm-offline').hidden);
    await context.setOffline(true); await page.reload(); await ready();
    await page.locator('[data-action=beat-preview]').click();
    await page.waitForFunction(() => window.__samples.length > 0);
    await page.locator('[data-action=beat-preview]').click();
    await target('signal'); await page.locator('[data-instrument]').selectOption('smallGong');
    await page.waitForFunction(() => window.__samples.some(sample => sample.duration === 12));
    await upload('slot-end.wav', wave(4));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('juggermaster:state:v2')).sound.end.kind === 'custom');
    const deadline = await page.evaluate(async () => {
      const { newGame } = await import(new URL('core.mjs', document.querySelector('script[type=module]').src));
      const saved = JSON.parse(localStorage.getItem('juggermaster:state:v2'));
      saved.config = { ...saved.config, periods: -2, minutes: 1 };
      const deadline = Date.now() + 60000;
      saved.game = { ...newGame(saved.config), deadline };
      localStorage.setItem('juggermaster:state:v2', JSON.stringify(saved));
      return deadline;
    });
    await page.reload(); await ready(); await target('signal');
    await page.locator('[data-action=signal-preview]').click(); await page.waitForFunction(() => window.__samples.length === 3);
    await target('beat'); await page.evaluate(() => { window.__samples = []; });
    const background = await context.newPage(); await background.goto(url + '#sound');
    background.on('pageerror', error => errors.push(error.message));
    await background.locator('.jm-app[data-ready=true]').waitFor();
    await background.locator('[data-sound-target=signal]').click(); await background.locator('[data-action=signal-preview]').click();
    await background.waitForFunction(() => window.__samples.length === 3);
    await background.evaluate(() => { window.__sampleStops = []; });
    await page.bringToFront();
    await background.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await background.evaluate(() => window.__sampleStops.filter(stop => stop.at === undefined).length), 3, 'Verdecken beendet auch allein laufende Endsignale');
    await background.evaluate(() => { window.__samples = []; });
    await Promise.all([page, background].map(tab => tab.evaluate(deadline => { Date.now = () => deadline + 1; }, deadline)));
    await page.locator('.jm-result-dialog').waitFor({ state: 'visible' }); await background.locator('.jm-result-dialog').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.__samples.length), 3, 'Ein Slotende erzeugt genau drei WAV-Schläge');
    assert.equal(await background.evaluate(() => window.__samples.length), 0, 'Die verdeckte zweite Ansicht erzeugt keine weiteren Schläge');
    assert.equal(await background.locator('[data-read=remaining-time]').textContent(), '00:00', 'Slot-Uhr endet auch in der verdeckten Ansicht');
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log('OK: 82 percussion instruments, separate beat/end sounds and volume, WAV/MP3 persistence, validation, offline playback.');
  } finally { await context.close(); }
};
