import { PLAYER, SCORING } from '../config.js';
import { sfx } from '../core/audio.js';
import { spawnParticles, addFloatingText } from '../core/effects.js';
import { overlaps } from '../core/utils.js';
import { game, player, isHyper } from './state.js';
import { bottom, landOn } from './player.js';
import { scrollWorld } from './world.js';
import { addCombo } from './combo.js';
import { endRun } from './session.js';

const HITBOX_INSET = 4;
const FRONT_WALL_GRACE = 12;

// Where the player stands when on top of an obstacle.
function surfaceY(obs) {
  if (obs.type === 'pipe') return obs.y + 8;
  if (obs.type === 'chimney') return obs.y - 10;
  return obs.y;
}

// Top edge of the part that hurts. The pipe's support legs are scenery.
function hazardTop(obs) {
  if (obs.type === 'pipe') return obs.y + 10;
  if (obs.type === 'chimney') return obs.y - 10;
  return obs.y;
}

const playerRect = () => ({ x: player.x, y: player.y, w: player.width, h: player.height });

// Resolves the player against the level. Returns true if the player is standing on something.
export function resolveCollisions(prevBottom) {
  const supported = resolveBuildings(prevBottom);
  if (game.mode !== 'playing') return false;
  const onObstacle = resolveObstacles(prevBottom);
  if (game.mode !== 'playing') return false;
  collectShurikens();
  return supported || onObstacle;
}

function resolveBuildings(prevBottom) {
  for (const b of game.buildings) {
    if (player.x + player.width <= b.x || player.x >= b.x + b.w) continue;
    const feet = bottom();

    if (player.vy >= 0 && prevBottom <= b.y + PLAYER.landingTolerance && feet >= b.y) {
      if (!player.grounded) spawnParticles(player.x + player.width / 2, b.y, 4, '#94a3b8');
      landOn(b.y);
      return true;
    }

    if (player.x >= b.x + PLAYER.frontWallDepth) continue;

    // Clipped the very edge of a roof on the way down: pull the player up onto it.
    if (player.vy > 0 && feet <= b.y + PLAYER.mantleDepth) {
      landOn(b.y);
      addFloatingText('MANTLE!', player.x + player.width / 2, player.y - 12, '#34d399');
      return true;
    }

    if (feet > b.y + FRONT_WALL_GRACE) {
      if (isHyper()) {
        landOn(b.y);
        return true;
      }
      endRun();
      return false;
    }
  }
  return false;
}

function resolveObstacles(prevBottom) {
  let supported = false;

  for (const obs of game.obstacles) {
    if (obs.destroyed || obs === player.clingTo) continue;
    if (player.x + player.width <= obs.x + HITBOX_INSET || player.x >= obs.x + obs.w - HITBOX_INSET) continue;

    const top = surfaceY(obs);
    const feet = bottom();

    if (player.vy >= 0 && prevBottom <= top + PLAYER.landingTolerance && feet >= top) {
      landOn(top);
      supported = true;
      continue;
    }

    if (player.y >= obs.y + obs.h || feet <= hazardTop(obs)) continue;

    if (isHyper()) {
      smash(obs);
      continue;
    }

    if (obs.type === 'chimney' && !player.grounded && cling(obs)) continue;

    endRun();
    return false;
  }

  return supported;
}

// Grabs the chimney face. The world stops scrolling while the player clings,
// so they stay on the wall until they kick off or climb over the top.
function cling(obs) {
  const overlap = player.x + player.width - obs.x;
  if (overlap > player.speed * 2 + 8) return false;

  if (overlap > 0) scrollWorld(-overlap);
  player.vy = Math.min(player.vy, PLAYER.wallClimbVelocity);
  player.clingTo = obs;
  player.airJumps = PLAYER.airJumps;
  spawnParticles(player.x + player.width, player.y + player.height / 2, 5, '#cbd5e1', 0.8);
  return true;
}

export function updateCling() {
  const obs = player.clingTo;
  if (!obs) return;
  if (obs.destroyed || bottom() <= hazardTop(obs)) player.clingTo = null;
}

function smash(obs) {
  obs.destroyed = true;
  game.score += SCORING.smash;
  game.shake = 6;
  sfx.crash();
  spawnParticles(obs.x + obs.w / 2, obs.y + obs.h / 2, 16, '#38bdf8', 2);
  addFloatingText(`+${SCORING.smash} SMASH!`, player.x + 30, player.y - 10, '#38bdf8');
}

function collectShurikens() {
  const rect = playerRect();
  for (const s of game.shurikens) {
    if (s.collected || !overlaps(rect, s)) continue;
    s.collected = true;
    const points = SCORING.shuriken * player.multiplier;
    game.score += points;
    sfx.coin();
    spawnParticles(s.x + s.w / 2, s.y + s.h / 2, 8, '#fef08a', 1.5, 'star');
    addFloatingText(`+${points}`, s.x + s.w / 2, s.y - 10, '#fde047');
    addCombo(1);
  }
}

// Whether standing up from a slide would put the player's head into an obstacle.
export function headroomBlocked() {
  const head = bottom() - player.standHeight;
  return game.obstacles.some(
    (o) =>
      !o.destroyed &&
      player.x + player.width > o.x + HITBOX_INSET &&
      player.x < o.x + o.w - HITBOX_INSET &&
      head < o.y + o.h &&
      bottom() > hazardTop(o)
  );
}
