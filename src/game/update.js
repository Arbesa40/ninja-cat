import { COMBO, PLAYER, SCORING, WORLD } from '../config.js';
import { view } from '../core/canvas.js';
import { sfx } from '../core/audio.js';
import { input } from '../core/input.js';
import { spawnParticles, addFloatingText, updateEffects } from '../core/effects.js';
import { game, player, meters, isHyper } from './state.js';
import { applyGravity, bottom, endSlide, fastFall, startSlide, tryJump } from './player.js';
import { recycleWorld, scrollWorld } from './world.js';
import { updateParallax, resetLandmark } from './parallax.js';
import { addCombo, updateCombo } from './combo.js';
import { resolveCollisions, updateCling, headroomBlocked } from './collisions.js';
import { endRun } from './session.js';

const TITLE_DRIFT = 1.2;
let slidePressed = false;

export function queueJump() {
  player.jumpBuffer = PLAYER.jumpBufferTicks;
}

export function queueSlide() {
  slidePressed = true;
}

export function tick() {
  if (game.mode === 'paused') return;

  if (game.mode === 'playing') tickRun();
  else if (game.mode === 'title') updateParallax(TITLE_DRIFT);

  updateEffects();
  player.anim.update();
  game.shake = game.shake > 0.3 ? game.shake * 0.85 : 0;
}

function tickRun() {
  updateSpeed();
  updateCombo();
  updateClock();

  handleJump();
  handleSlide();

  const prevBottom = bottom();
  applyGravity();
  updateCling();

  const dx = player.clingTo ? 0 : player.speed;
  scrollWorld(dx);
  updateParallax(dx);
  game.distance += dx;

  const supported = resolveCollisions(prevBottom);
  if (game.mode !== 'playing') return;

  player.grounded = supported;
  if (supported) player.coyoteTicks = PLAYER.coyoteTicks;
  else if (player.coyoteTicks > 0) player.coyoteTicks--;

  if (player.y > view.height + 60) {
    endRun();
    return;
  }

  game.score += recycleWorld() * SCORING.building * player.multiplier;
  updateAnimation();
}

function updateSpeed() {
  const p = game.profile;
  const ramp = Math.min(p.maxSpeedBonus, meters() * p.speedPerMeter);
  const hyperBoost = isHyper() ? (player.hyperTicks / COMBO.hyperTicks) * COMBO.hyperSpeedBonus : 0;
  const target = player.baseSpeed + ramp + hyperBoost;
  player.speed += (target - player.speed) * PLAYER.speedEase;

  if (isHyper()) {
    spawnParticles(player.x, player.y + Math.random() * player.height, 2, '#38bdf8', 1, 'star');
  }
}

function updateClock() {
  game.cycle = (game.cycle + WORLD.dayCyclePerTick) % 1;

  const cityIndex = Math.floor(meters() / WORLD.metersPerCity) % game.cities.length;
  if (cityIndex !== game.cityIndex) {
    game.cityIndex = cityIndex;
    game.cityBannerTicks = WORLD.cityBannerTicks;
    resetLandmark();
  }
  if (game.cityBannerTicks > 0) game.cityBannerTicks--;
}

function handleJump() {
  if (player.jumpBuffer <= 0) return;

  if (player.sliding) {
    if (headroomBlocked()) {
      player.jumpBuffer--;
      return;
    }
    endSlide();
  }

  const kind = tryJump();
  if (!kind) {
    player.jumpBuffer--;
    return;
  }
  player.jumpBuffer = 0;

  const cx = player.x + player.width / 2;
  if (kind === 'ground') {
    sfx.jump();
    spawnParticles(cx, bottom(), 6, '#cbd5e1');
  } else if (kind === 'wall') {
    sfx.wallKick();
    player.anim.play('air', true);
    spawnParticles(player.x + player.width, player.y + player.height / 2, 8, '#38bdf8', 1.5, 'star');
    addFloatingText('WALL KICK!', cx, player.y - 10, '#38bdf8');
    addCombo(1);
  } else {
    sfx.airJump();
    player.anim.play('air', true);
    spawnParticles(cx, player.y + player.height / 2, 8, '#c084fc', 1.2, 'star');
  }
}

function handleSlide() {
  if (player.slideBuffer > 0) player.slideBuffer--;

  if (slidePressed) {
    slidePressed = false;
    player.slideBuffer = PLAYER.slideBufferTicks;
    if (!player.grounded && !player.clingTo) {
      fastFall();
      sfx.slide();
      spawnParticles(player.x + player.width / 2, player.y, 4, '#38bdf8');
    }
  }

  const wantsSlide = input.slideHeld || player.slideBuffer > 0;

  if (player.grounded && !player.sliding && !player.clingTo && wantsSlide) {
    startSlide();
    player.slideBuffer = 0;
    sfx.slide();
    spawnParticles(player.x, bottom(), 5, 'rgba(255,255,255,0.7)', 1.2);
  } else if (player.sliding) {
    player.slideTicks++;
    if (!input.slideHeld && player.slideTicks >= PLAYER.slideMinTicks && !headroomBlocked()) endSlide();
  }
}

function updateAnimation() {
  if (player.clingTo) player.anim.play('idle');
  else if (player.sliding) player.anim.play('slide');
  else if (!player.grounded) player.anim.play('air');
  else player.anim.play('run');
}
