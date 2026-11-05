import { getProfile, RESTART_DELAY_MS, WORLD } from '../config.js';
import { view } from '../core/canvas.js';
import { shuffle } from '../core/utils.js';
import { sfx, suspendAudio, resumeAudio } from '../core/audio.js';
import { clearEffects, spawnParticles } from '../core/effects.js';
import { saveHighScore } from '../core/storage.js';
import { CITIES } from '../data/cities.js';
import { game, player } from './state.js';
import { applyProfile, resetPlayer } from './player.js';
import { resetWorld } from './world.js';
import { initParallax } from './parallax.js';

function resetRun() {
  game.profile = getProfile(view);
  applyProfile(game.profile);

  game.score = 0;
  game.distance = 0;
  game.isNewHighScore = false;
  game.shake = 0;
  game.cycle = WORLD.startCycle;
  game.cities = shuffle(CITIES);
  game.cityIndex = 0;
  game.cityBannerTicks = 0;

  resetPlayer(game.profile.startRoofY);
  resetWorld();
  clearEffects();
  initParallax();
}

export function showTitle() {
  resetRun();
  game.mode = 'title';
  player.anim.play('idle');
}

export function startRun() {
  if (game.mode !== 'title') resetRun();
  game.mode = 'playing';
  game.cityBannerTicks = WORLD.cityBannerTicks;
  player.anim.play('run');
}

export function canRestart() {
  return performance.now() - game.overAt > RESTART_DELAY_MS;
}

export function endRun() {
  if (game.mode !== 'playing') return;
  game.mode = 'over';
  game.overAt = performance.now();
  game.shake = 14;
  player.anim.play('die');

  sfx.crash();
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2, 25, '#f43f5e', 2.5);

  if (game.score > game.highScore) {
    game.highScore = game.score;
    game.isNewHighScore = true;
    saveHighScore(game.highScore);
  }
}

export function pause() {
  if (game.mode !== 'playing') return;
  game.mode = 'paused';
  suspendAudio();
}

export function resume() {
  if (game.mode !== 'paused') return;
  game.mode = 'playing';
  resumeAudio();
}

// Keeps a run in progress alive across resizes. Mobile browsers fire
// height-only resizes as the address bar slides, so only a width change
// (rotation, window resize) pauses the game.
export function handleResize(widthChanged) {
  if (game.mode === 'title') {
    showTitle();
    return;
  }
  initParallax();
  if (widthChanged) pause();
}
