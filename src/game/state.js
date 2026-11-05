import { WORLD } from '../config.js';
import { Animator } from '../core/sprites.js';

// mode: 'title' | 'playing' | 'paused' | 'over'
export const game = {
  mode: 'title',
  profile: null,

  score: 0,
  highScore: 0,
  isNewHighScore: false,
  overAt: 0,
  distance: 0,

  cycle: WORLD.startCycle,
  cities: [],
  cityIndex: 0,
  cityBannerTicks: 0,

  buildings: [],
  obstacles: [],
  shurikens: [],

  shake: 0,
};

export const player = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  standHeight: 0,
  renderSize: 0,

  vy: 0,
  speed: 0,
  baseSpeed: 0,
  jumpVelocity: 0,
  gravity: 0,

  grounded: false,
  coyoteTicks: 0,
  jumpBuffer: 0,
  slideBuffer: 0,
  airJumps: 0,
  sliding: false,
  slideTicks: 0,
  clingTo: null,

  combo: 0,
  multiplier: 1,
  comboTicks: 0,
  hyperTicks: 0,

  anim: new Animator('idle'),
};

export const currentCity = () => game.cities[game.cityIndex];
export const meters = () => Math.floor(game.distance / WORLD.pixelsPerMeter);
export const isHyper = () => player.hyperTicks > 0;
