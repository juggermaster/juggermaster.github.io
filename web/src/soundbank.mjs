import { instruments } from './instruments.mjs';

let library, bank;
const buffers = new Map();
export async function instrumentBuffer(context, name) {
  if (buffers.has(name)) return buffers.get(name);
  const task = (async () => {
    library ||= import('./spessasynth-core.mjs');
    const { SoundBankLoader, SpessaSynthProcessor } = await library;
    bank ||= fetch(new URL('./percussion.sf2', import.meta.url)).then(async response => {
      if (!response.ok) throw Error('Sound bank unavailable');
      return response.arrayBuffer();
    }).catch(error => { bank = null; throw error; });
    const synth = new SpessaSynthProcessor(context.sampleRate, { maxBufferSize: 1024, effectsEnabled: false, eventsEnabled: false });
    try {
      await synth.processorInitialized;
      synth.soundBankManager.addSoundBank(SoundBankLoader.fromArrayBuffer(await bank), 'percussion');
      const preset = instruments[name], channel = preset.drum ? 9 : 0;
      synth.controllerChange(channel, 0, preset.bank);
      synth.programChange(channel, preset.program);
      synth.noteOn(channel, preset.note, 110);
      const buffer = context.createBuffer(1, context.sampleRate * 12, context.sampleRate);
      const output = buffer.getChannelData(0), left = new Float32Array(1024), right = new Float32Array(1024);
      for (let offset = 0, block = 0; offset < output.length; offset += left.length, block++) {
        const count = Math.min(left.length, output.length - offset);
        left.fill(0); right.fill(0); synth.process(left, right, 0, count);
        for (let i = 0; i < count; i++) output[offset + i] = (left[i] + right[i]) / 2;
        if (block % 32 === 31) await new Promise(resolve => setTimeout(resolve, 0));
      }
      return buffer;
    } finally { synth.destroySynthProcessor(); }
  })();
  // Keep browsing the full percussion list from retaining every 12-second buffer.
  if (buffers.size >= 12) buffers.delete(buffers.keys().next().value);
  buffers.set(name, task);
  try { return await task; } catch (error) { buffers.delete(name); throw error; }
}
