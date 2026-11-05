import { ctx } from '../core/canvas.js';
import { player, isHyper } from '../game/state.js';

const SPRITE_FOOT_OFFSET = 4;

export function drawPlayer() {
  const img = player.anim.image();
  if (!img) return;

  const size = player.renderSize;
  const x = player.x + (player.width - size) / 2;
  const y = player.y + player.height - size + SPRITE_FOOT_OFFSET;

  ctx.save();
  if (isHyper()) {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
  }
  // While clinging, mirror the sprite so the cat faces back off the wall.
  if (player.clingTo) {
    ctx.translate(x + size, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, size, size);
  } else {
    ctx.drawImage(img, x, y, size, size);
  }
  ctx.restore();
}
