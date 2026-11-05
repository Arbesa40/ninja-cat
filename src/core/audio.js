let audioCtx = null;
let muted = false;

export function unlockAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function suspendAudio() {
  if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export const isMuted = () => muted;

// `sweep`: 'exp' | 'linear' glide from `from` to `to`; 'step' jumps to `to` at `stepAt` seconds.
function tone({ type, from, to, duration, volume, sweep = 'exp', stepAt = 0 }) {
  if (!audioCtx || muted) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (sweep === 'exp') osc.frequency.exponentialRampToValueAtTime(to, t + duration);
  else if (sweep === 'linear') osc.frequency.linearRampToValueAtTime(to, t + duration);
  else osc.frequency.setValueAtTime(to, t + stepAt);

  gain.gain.setValueAtTime(volume, t);
  gain.gain.linearRampToValueAtTime(0.01, t + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sfx = {
  jump: () => tone({ type: 'sine', from: 220, to: 540, duration: 0.14, volume: 0.18 }),
  airJump: () => tone({ type: 'triangle', from: 650, to: 140, duration: 0.18, volume: 0.25 }),
  slide: () => tone({ type: 'sawtooth', from: 140, to: 80, duration: 0.2, volume: 0.08, sweep: 'linear' }),
  wallKick: () => tone({ type: 'square', from: 320, to: 680, duration: 0.16, volume: 0.14 }),
  coin: () => tone({ type: 'sine', from: 987.77, to: 1318.51, duration: 0.25, volume: 0.15, sweep: 'step', stepAt: 0.08 }),
  hyper: () => tone({ type: 'sawtooth', from: 260, to: 1040, duration: 0.35, volume: 0.22 }),
  crash: () => tone({ type: 'sawtooth', from: 120, to: 30, duration: 0.4, volume: 0.3, sweep: 'linear' }),
};
