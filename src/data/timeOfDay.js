import { hexToRgb, mixRgb } from '../core/utils.js';

const STAGES = [
  {
    name: 'DAWN',
    skyTop: '#0f172a', skyMid: '#3b0764', skyBottom: '#7c2d12',
    cloudColor: 'rgba(253, 186, 116, 0.35)',
    glow: 'rgba(251, 146, 60, 0.5)',
    bodyColor: '#fed7aa',
    isDay: false,
    starsAlpha: 0.25,
    fogColor: 'rgba(59, 7, 100, 0.08)',
  },
  {
    name: 'MORNING',
    skyTop: '#0284c7', skyMid: '#38bdf8', skyBottom: '#bae6fd',
    cloudColor: 'rgba(255, 255, 255, 0.7)',
    glow: 'rgba(253, 224, 71, 0.65)',
    bodyColor: '#fef08a',
    isDay: true,
    starsAlpha: 0,
    fogColor: 'rgba(186, 230, 253, 0.12)',
  },
  {
    name: 'NOON',
    skyTop: '#0369a1', skyMid: '#0ea5e9', skyBottom: '#7dd3fc',
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    glow: 'rgba(255, 255, 255, 0.85)',
    bodyColor: '#fff',
    isDay: true,
    starsAlpha: 0,
    fogColor: 'rgba(255, 255, 255, 0.08)',
  },
  {
    name: 'AFTERNOON',
    skyTop: '#1e3a8a', skyMid: '#ea580c', skyBottom: '#fde047',
    cloudColor: 'rgba(254, 215, 170, 0.6)',
    glow: 'rgba(249, 115, 22, 0.7)',
    bodyColor: '#f97316',
    isDay: true,
    starsAlpha: 0,
    fogColor: 'rgba(251, 146, 60, 0.16)',
  },
  {
    name: 'DUSK',
    skyTop: '#0f172a', skyMid: '#581c87', skyBottom: '#be123c',
    cloudColor: 'rgba(168, 85, 247, 0.35)',
    glow: 'rgba(225, 29, 72, 0.55)',
    bodyColor: '#fda4af',
    isDay: false,
    starsAlpha: 0.5,
    fogColor: 'rgba(136, 19, 55, 0.18)',
  },
  {
    name: 'MIDNIGHT',
    skyTop: '#020617', skyMid: '#0b1329', skyBottom: '#111827',
    cloudColor: 'rgba(71, 85, 105, 0.25)',
    glow: 'rgba(192, 132, 252, 0.45)',
    bodyColor: '#f1f5f9',
    isDay: false,
    starsAlpha: 1,
    fogColor: 'rgba(15, 23, 42, 0.22)',
  },
].map((s) => ({
  ...s,
  skyTop: hexToRgb(s.skyTop),
  skyMid: hexToRgb(s.skyMid),
  skyBottom: hexToRgb(s.skyBottom),
}));

// `cycle` runs 0..1 over a full day; sky colours blend between neighbouring stages.
export function getEnvironment(cycle) {
  const progress = (cycle % 1) * STAGES.length;
  const i = Math.floor(progress);
  const t = progress - i;
  const a = STAGES[i];
  const b = STAGES[(i + 1) % STAGES.length];

  return {
    name: a.name,
    isDay: a.isDay,
    skyTop: mixRgb(a.skyTop, b.skyTop, t),
    skyMid: mixRgb(a.skyMid, b.skyMid, t),
    skyBottom: mixRgb(a.skyBottom, b.skyBottom, t),
    cloudColor: a.cloudColor,
    glow: a.glow,
    bodyColor: a.bodyColor,
    starsAlpha: a.starsAlpha + (b.starsAlpha - a.starsAlpha) * t,
    fogColor: a.fogColor,
  };
}
