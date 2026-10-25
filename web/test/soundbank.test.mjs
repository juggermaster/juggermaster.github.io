import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SoundBankLoader, SpessaSynthProcessor } from 'spessasynth_core';
import { instruments } from '../src/instruments.mjs';
import { texts } from '../src/i18n.mjs';

test('Vollständiges GM/GS-Percussion-Set, Triangel und Klanghölzer sind auswählbar und übersetzt', () => {
  assert.deepEqual(Object.values(instruments).filter(p => p.drum).map(p => p.note).sort((a, b) => a - b), Array.from({ length: 61 }, (_, i) => i + 27));
  assert.equal(instruments.triangle.note, 81);
  assert.equal(instruments.claves.note, 75);
  for (const [name, { label }] of Object.entries(instruments)) for (const [language, entries] of Object.entries(texts)) assert.ok(entries[label]?.trim(), `${language}.${name}`);
});

test('Alle angebotenen SpessaSynth-Instrumente erzeugen echten Klang aus der lokalen Bank', async () => {
  const data = await readFile(new URL('../vendor/percussion.sf2', import.meta.url));
  for (const [name, preset] of Object.entries(instruments)) {
    const bank = SoundBankLoader.fromArrayBuffer(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    assert.ok(bank.presets.some(p => p.program === preset.program && p.bankMSB === preset.bank && p.isGMGSDrum === Boolean(preset.drum)), name);
    const synth = new SpessaSynthProcessor(22050, { maxBufferSize: 1024, effectsEnabled: false, eventsEnabled: false });
    await synth.processorInitialized;
    try {
      synth.soundBankManager.addSoundBank(bank, 'test');
      const channel = preset.drum ? 9 : 0;
      synth.controllerChange(channel, 0, preset.bank); synth.programChange(channel, preset.program); synth.noteOn(channel, preset.note, 110);
      let energy = 0;
      for (let i = 0; i < 22; i++) {
        const left = new Float32Array(1024), right = new Float32Array(1024); synth.process(left, right);
        for (const value of left) { assert.ok(Number.isFinite(value), name); energy += value * value; }
      }
      assert.ok(energy > .0001, `${name}: nichtleere Ausgabe vor dem Lautstärkeausgleich`);
    } finally { synth.destroySynthProcessor(); }
  }
});
