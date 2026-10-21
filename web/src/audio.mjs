let context, channels;
const voices = new Map();
let interruption = () => {};
export const audioTime = () => context?.currentTime ?? performance.now() / 1000;
export const onAudioInterruption = callback => { interruption = callback; };
export async function unlockAudio() {
  const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Audio) return false;
  try {
    if (!context) {
      context = new Audio();
      const headroom = context.createGain(), safety = context.createWaveShaper();
      // Transparent below .8; bound extreme overlapping signals without compressor startup gain.
      headroom.gain.value = .1;
      safety.curve = Float32Array.from({ length: 8193 }, (_, i) => {
        const sample = (i / 4096 - 1) * 10, level = Math.abs(sample);
        return Math.sign(sample) * (level <= .8 ? level : .8 + .19 * Math.tanh((level - .8) / .19));
      });
      headroom.connect(safety).connect(context.destination);
      channels = [false, true].map(() => {
        const raw = context.createGain(), normalized = context.createDynamicsCompressor(), volume = context.createGain();
        normalized.threshold.value = -20; normalized.knee.value = 0; normalized.ratio.value = 20;
        normalized.attack.value = 0; normalized.release.value = .02;
        raw.connect(volume); normalized.connect(volume); volume.connect(headroom);
        return { raw, normalized, volume };
      });
      context.addEventListener('statechange', () => { if (context.state !== 'running') interruption(); });
    }
    if (context.state !== 'running') await context.resume();
    return context.state === 'running';
  } catch { return false; }
}
export function stopAudio(keepSignals = false) {
  for (const [source, signal] of voices) if (!keepSignals || !signal) {
    try { source.stop(); } catch {}
    voices.delete(source);
  }
}
function track(source, nodes, signal, at, end) {
  voices.set(source, signal);
  source.onended = () => { voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  source.start(at); source.stop(end);
}
function tone(frequency, end, duration, volume, attack, type, at, signal, output) {
  const oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  oscillator.frequency.exponentialRampToValueAtTime(end, at + duration * .75);
  gain.gain.setValueAtTime(.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume), at + Math.min(attack, duration / 2));
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  oscillator.connect(gain).connect(output);
  track(oscillator, [gain], signal, at, at + duration + .015);
}
function noise(duration, volume, frequency, at, signal, output) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
  source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = frequency;
  gain.gain.setValueAtTime(Math.max(.0001, volume), at);
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  source.connect(filter).connect(gain).connect(output);
  track(source, [filter, gain], signal, at, at + duration);
}
export function playBeat(sound, at = audioTime(), signal = false) {
  const volume = signal ? sound.signalVolume : sound.volume;
  if (!context || context.state !== 'running' || !volume) return;
  const channel = channels[Number(signal)], normalize = signal ? sound.signalNormalize : sound.beatNormalize;
  const output = normalize === false ? channel.raw : channel.normalized;
  channel.volume.gain.setValueAtTime(volume / 100, at);
  const level = .34, metal = sound.metal / 100, decay = sound.decay;
  if (sound.kind === 'drum') {
    tone(sound.pitch * 1.8, sound.pitch * .6, decay, level, .003, 'sine', at, signal, output);
    tone(sound.pitch * (2 + metal * 2), sound.pitch * 1.1, decay * .55, level * .28, .002, 'triangle', at, signal, output);
  } else {
    const partials = sound.kind === 'stone' ? [1, 1.86, 2.92, 4.15, 5.37] : [1, 1.47, 2.09, 2.56, 3.88, 5.1, 6.83];
    partials.forEach((ratio, i) => {
      const frequency = sound.pitch * ((i + 1) * (1 - metal) + ratio * metal);
      const duration = Math.max(.06, decay / (1 + i * .2));
      tone(frequency, frequency * .985, duration, level / (i + 1) ** 1.25, sound.kind === 'stone' ? .002 : .004 + (100 - sound.attack) * .0004, 'sine', at, signal, output);
    });
  }
  noise(.015 + sound.attack * .0005, level * (sound.kind === 'stone' ? .85 : .4), 1200 + sound.attack * 35, at, signal, output);
}
export function playEndSignal(sound, count, at = audioTime()) {
  for (let i = 0; i < count; i++) playBeat(sound, at + i * .22, true);
}
