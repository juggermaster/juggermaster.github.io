const assert = require('node:assert/strict');

module.exports = async (browser, url) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
    const page = await context.newPage(); await page.goto(url);
    await page.locator('.jm-app[data-ready=true]').waitFor();
    const result = await page.evaluate(async () => {
      const base = document.querySelector('script[type=module]').src, original = window.AudioContext, random = Math.random;
      const { defaultSound, presets } = await import(new URL('core.mjs', base));
      let id = 0;
      const render = async (sound, pace = .22, signal = false, stress = false) => {
        const rate = 44100, beats = 10; let offline, seed = 1;
        Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
        window.AudioContext = function () {
          offline = new OfflineAudioContext(1, Math.ceil((pace * beats + 7) * rate), rate);
          Object.defineProperty(offline, 'state', { get: () => 'running' });
          return offline;
        };
        const audio = await import(new URL(`audio.mjs?render=${id++}`, base)); await audio.unlockAudio();
        if (stress) {
          for (let i = 0; i < 10; i++) audio.playEndSignal(sound, 10, 0);
          for (let i = 0; i < beats; i++) audio.playBeat(sound, i * .5);
        } else for (let i = 0; i < beats; i++) audio.playBeat(sound, i * pace, signal);
        const data = (await offline.startRendering()).getChannelData(0);
        const rms = at => {
          let sum = 0, count = 0;
          for (let frame = Math.round((at + .01) * rate); frame < Math.round((at + Math.min(.2, pace)) * rate); frame++) { sum += data[frame] ** 2; count++; }
          return Math.sqrt(sum / count);
        };
        let peak = 0; for (const sample of data) peak = Math.max(peak, Math.abs(sample));
        return { first: rms(0), last: rms((beats - 1) * pace), peak };
      };
      try {
        const cadence = [];
        for (const [kind, preset] of Object.entries(presets)) for (const pace of [1.5, .5, .22]) {
          const measured = await render({ ...defaultSound, ...preset, volume: 90 }, pace);
          cadence.push({ kind, pace, changeDb: 20 * Math.log10(measured.last / measured.first), peak: measured.peak });
        }
        const switches = [];
        for (const signal of [false, true]) {
          const active = signal ? 'signalNormalize' : 'beatNormalize', other = signal ? 'beatNormalize' : 'signalNormalize', volume = signal ? 'signalVolume' : 'volume';
          for (const enabled of [false, true]) {
            const sound = { ...defaultSound, ...presets.deep, [active]: enabled, [volume]: 50 };
            const measured = await render(sound, .22, signal), half = await render({ ...sound, [volume]: 25 }, .22, signal);
            const independent = await render({ ...sound, [other]: false }, .22, signal);
            switches.push({ signal, enabled, changeDb: 20 * Math.log10(measured.last / measured.first), volumeRatio: measured.last / half.last, otherSwitchDb: 20 * Math.log10(measured.last / independent.last) });
          }
        }
        const stress = await render({ ...defaultSound, ...presets.deep, pitch: 70, metal: 0, attack: 100, decay: 6, volume: 100, signalVolume: 100, beatNormalize: false, signalNormalize: false }, .22, true, true);
        return { cadence, switches, stress };
      } finally { window.AudioContext = original; Math.random = random; }
    });
    for (const row of result.cadence) { assert.ok(Math.abs(row.changeDb) < 1.2, `Gleichmäßige erste/überlagerte Schläge: ${JSON.stringify(row)}`); assert.ok(row.peak < 1); }
    for (const row of result.switches) {
      assert.ok(Math.abs(row.otherSwitchDb) < .001, `Takt- und Endsignal-Ausgleich sind voneinander unabhängig: ${JSON.stringify(row)}`);
      assert.ok(Math.abs(row.volumeRatio - 2) < .01, 'Lautstärkeregler bleiben proportional');
      assert.ok(row.enabled ? Math.abs(row.changeDb) < 1.2 : row.changeDb > 2, `Ausgleich lässt sich hörbar abschalten: ${JSON.stringify(row)}`);
    }
    assert.ok(result.stress.peak < 1, 'Auch zahlreiche überlagerte Endsignale bleiben unter der Übersteuerungsgrenze');
    console.log('OK: gerenderte Audiowellen, gleichmäßiger erster Schlag, getrennt abschaltbarer Ausgleich, proportionale Lautstärke, überlagerte Endsignale.');
  } finally { await context.close(); }
};
