import { audioFile } from './audio-files.mjs';

let context, channels;
const samples = new Map(), custom = new Map();
const voices = new Map();
let interruption = () => {};
export const audioTime = () => context?.currentTime ?? performance.now() / 1000;
export const onAudioInterruption = callback => { interruption = callback; };
export async function unlockAudio(sound, target) {
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
        const normalized = context.createDynamicsCompressor(), volume = context.createGain();
        normalized.threshold.value = -20; normalized.knee.value = 0; normalized.ratio.value = 20;
        normalized.attack.value = 0; normalized.release.value = .02;
        normalized.connect(volume); volume.connect(headroom);
        return { normalized, volume };
      });
      context.addEventListener('statechange', () => { if (context.state !== 'running') interruption(); });
    }
    if (context.state !== 'running') await context.resume();
    if (sound) await Promise.all([
      !target || target === 'beat' ? prepareSound(sound, 'beat') : null,
      !target || target === 'signal' ? prepareSound(sound.end ?? sound, 'signal') : null
    ]);
    return context.state === 'running';
  } catch { return false; }
}
function levelSample(buffer) {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) for (const value of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(value));
  if (peak > 0) for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) data[i] *= .8 / peak;
  }
  return buffer;
}
async function prepareSound(profile, target) {
  if (profile.kind === 'spessa') {
    const key = `spessa:${profile.instrument}`;
    if (!samples.has(key)) {
      const { instrumentBuffer } = await import('./soundbank.mjs');
      samples.set(key, levelSample(await instrumentBuffer(context, profile.instrument)));
      if (samples.size > 12) samples.delete(samples.keys().next().value);
    }
  } else if (profile.kind === 'custom' && !custom.has(target)) {
    const saved = await audioFile(target);
    if (!saved?.file) throw Error('Missing custom audio');
    custom.set(target, levelSample(await context.decodeAudioData(await saved.file.arrayBuffer())));
  }
}
export async function importAudioFile(target, file) {
  if (!/\.(wav|mp3)$/i.test(file.name) || !file.size) throw Error('customInvalid');
  if (file.size > 10 * 1024 * 1024) throw Error('customTooLarge');
  const Offline = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  if (!Offline) throw Error('audioFailed');
  let buffer;
  try { buffer = await new Offline(1, 1, 44100).decodeAudioData(await file.arrayBuffer()); } catch (cause) { throw Error('customInvalid', { cause }); }
  if (buffer.duration > 30) throw Error('customTooLong');
  await audioFile(target, 'put', { file, duration: buffer.duration });
  custom.set(target, levelSample(buffer));
  return Math.max(.4, buffer.duration);
}
export async function deleteAudioFile(target) { await audioFile(target, 'delete'); custom.delete(target); }
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
  const channel = channels[Number(signal)], output = channel.normalized;
  channel.volume.gain.setValueAtTime(volume / 100, at);
  sound = signal ? sound.end ?? sound : sound;
  if (sound.kind === 'spessa' || sound.kind === 'custom') {
    const buffer = sound.kind === 'spessa' ? samples.get(`spessa:${sound.instrument}`) : custom.get(signal ? 'signal' : 'beat');
    if (!buffer) return;
    // Long custom beat clips must not stack up with older pitches between ticks.
    if (sound.kind === 'custom' && !signal) for (const [voice, endSignal] of voices) if (!endSignal) voice.stop(at);
    const source = context.createBufferSource(), gain = context.createGain();
    const rate = sound.pitch / 110, duration = Math.min(sound.decay, buffer.duration / rate);
    source.buffer = buffer; source.playbackRate.value = rate;
    const level = .34 * (.4 + sound.attack / 100 * .6);
    gain.gain.setValueAtTime(level, at);
    if (sound.kind === 'custom') gain.gain.setValueAtTime(level, at + Math.max(0, duration - .01));
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(gain).connect(output);
    track(source, [gain], signal, at, at + duration);
    return;
  }
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
