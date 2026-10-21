let context, master;
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
      master = context.createDynamicsCompressor();
      master.threshold.value = -10; master.knee.value = 15; master.ratio.value = 5;
      master.connect(context.destination);
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
function tone(frequency, end, duration, volume, attack, type, at, signal) {
  const oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  oscillator.frequency.exponentialRampToValueAtTime(end, at + duration * .75);
  gain.gain.setValueAtTime(.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume), at + Math.min(attack, duration / 2));
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  oscillator.connect(gain).connect(master);
  track(oscillator, [gain], signal, at, at + duration + .015);
}
function noise(duration, volume, frequency, at, signal) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
  source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = frequency;
  gain.gain.setValueAtTime(Math.max(.0001, volume), at);
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  source.connect(filter).connect(gain).connect(master);
  track(source, [filter, gain], signal, at, at + duration);
}
export function playBeat(sound, at = audioTime(), signal = false) {
  const volume = signal ? sound.signalVolume : sound.volume;
  if (!context || context.state !== 'running' || !volume) return;
  const level = volume / 100 * .34, metal = sound.metal / 100, decay = sound.decay;
  if (sound.kind === 'drum') {
    tone(sound.pitch * 1.8, sound.pitch * .6, decay, level, .003, 'sine', at, signal);
    tone(sound.pitch * (2 + metal * 2), sound.pitch * 1.1, decay * .55, level * .28, .002, 'triangle', at, signal);
  } else {
    const partials = sound.kind === 'stone' ? [1, 1.86, 2.92, 4.15, 5.37] : [1, 1.47, 2.09, 2.56, 3.88, 5.1, 6.83];
    partials.forEach((ratio, i) => {
      const frequency = sound.pitch * ((i + 1) * (1 - metal) + ratio * metal);
      const duration = Math.max(.06, decay / (1 + i * .2));
      tone(frequency, frequency * .985, duration, level / (i + 1) ** 1.25, sound.kind === 'stone' ? .002 : .004 + (100 - sound.attack) * .0004, 'sine', at, signal);
    });
  }
  noise(.015 + sound.attack * .0005, level * (sound.kind === 'stone' ? .85 : .4), 1200 + sound.attack * 35, at, signal);
}
export function playEndSignal(sound, count, at = audioTime()) {
  for (let i = 0; i < count; i++) playBeat(sound, at + i * .22, true);
}
