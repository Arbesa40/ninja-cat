import { PLAYER } from '../config.js';
import { player } from './state.js';

export function applyProfile(profile) {
  const standing = !player.sliding;
  player.x = profile.playerX;
  player.width = profile.hitWidth;
  player.standHeight = profile.hitHeight;
  player.height = standing ? profile.hitHeight : profile.hitHeight / 2;
  player.renderSize = profile.renderSize;
  player.baseSpeed = profile.baseSpeed;
  player.jumpVelocity = profile.jumpVelocity;
  player.gravity = profile.gravity;
}

export function resetPlayer(roofY) {
  player.sliding = false;
  player.height = player.standHeight;
  player.y = roofY - player.height;
  player.vy = 0;
  player.speed = player.baseSpeed;
  player.grounded = true;
  player.coyoteTicks = 0;
  player.jumpBuffer = 0;
  player.slideBuffer = 0;
  player.airJumps = PLAYER.airJumps;
  player.slideTicks = 0;
  player.clingTo = null;
  player.combo = 0;
  player.multiplier = 1;
  player.comboTicks = 0;
  player.hyperTicks = 0;
}

export const bottom = () => player.y + player.height;

// Returns which kind of jump happened, or null if none was possible.
export function tryJump() {
  if (player.clingTo) {
    player.vy = player.jumpVelocity * PLAYER.wallKickFactor;
    player.clingTo = null;
    player.grounded = false;
    player.airJumps = PLAYER.airJumps;
    return 'wall';
  }
  if (player.grounded || player.coyoteTicks > 0) {
    player.vy = player.jumpVelocity;
    player.grounded = false;
    player.coyoteTicks = 0;
    return 'ground';
  }
  if (player.airJumps > 0) {
    player.vy = player.jumpVelocity * PLAYER.airJumpFactor;
    player.airJumps--;
    return 'air';
  }
  return null;
}

export function startSlide() {
  player.sliding = true;
  player.slideTicks = 0;
  player.y += player.standHeight / 2;
  player.height = player.standHeight / 2;
}

export function endSlide() {
  player.sliding = false;
  player.y -= player.standHeight / 2;
  player.height = player.standHeight;
}

export function fastFall() {
  player.vy = Math.max(player.vy + PLAYER.fastFallBoost, PLAYER.fastFallMinVelocity);
}

export function landOn(surfaceY) {
  player.y = surfaceY - player.height;
  player.vy = 0;
  player.grounded = true;
  player.airJumps = PLAYER.airJumps;
}

export function applyGravity() {
  if (player.clingTo && player.vy >= 0) {
    player.vy = Math.min(player.vy + player.gravity * 0.35, PLAYER.wallSlideMaxVelocity);
  } else {
    player.vy += player.gravity;
  }
  player.y += player.vy;
}
