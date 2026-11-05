import { COMBO } from '../config.js';
import { sfx } from '../core/audio.js';
import { addFloatingText } from '../core/effects.js';
import { view } from '../core/canvas.js';
import { player } from './state.js';

const [TIER_2X, TIER_4X, HYPER_AT] = COMBO.tiers;

export function addCombo(amount = 1) {
  player.combo += amount;
  player.comboTicks = COMBO.windowTicks;

  if (player.combo >= HYPER_AT && player.hyperTicks <= 0) {
    player.hyperTicks = COMBO.hyperTicks;
    player.combo = 0;
    sfx.hyper();
    addFloatingText('⚡ HYPER RUSH! ⚡', view.width / 2, view.height / 2 - 60, '#fde047');
  } else if (player.combo >= TIER_4X) {
    player.multiplier = Math.max(player.multiplier, COMBO.multipliers[2]);
  } else if (player.combo >= TIER_2X) {
    player.multiplier = Math.max(player.multiplier, COMBO.multipliers[1]);
  }
}

export function updateCombo() {
  if (player.hyperTicks > 0) player.hyperTicks--;

  if (player.comboTicks > 0) {
    player.comboTicks--;
  } else {
    player.combo = 0;
    player.multiplier = 1;
  }
}

// 0..1 progress toward the next combo tier, for the HUD bar.
export function comboProgress() {
  if (player.hyperTicks > 0) return player.hyperTicks / COMBO.hyperTicks;
  const tiers = [0, ...COMBO.tiers];
  for (let i = 1; i < tiers.length; i++) {
    if (player.combo < tiers[i]) {
      return (player.combo - tiers[i - 1]) / (tiers[i] - tiers[i - 1]);
    }
  }
  return 1;
}
