import { WORLD } from '../config.js';
import { ctx, view, roundRect } from '../core/canvas.js';
import { isMuted } from '../core/audio.js';
import { input } from '../core/input.js';
import { game, player, currentCity, meters, isHyper } from '../game/state.js';
import { comboProgress } from '../game/combo.js';

export function drawHud() {
  const m = view.isMobile;
  const x = m ? 12 : 20;
  const y = m ? 10 : 16;
  const w = Math.min(680, view.width - (m ? 24 : 40));
  const h = m ? 44 : 54;
  const hyper = isHyper();
  const line1 = y + (m ? 22 : 26);
  const line2 = y + (m ? 36 : 42);
  const label = y + (m ? 15 : 18);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
  roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = hyper ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Score.
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${m ? 16 : 20}px monospace`;
  ctx.fillText(String(game.score).padStart(5, '0'), x + 14, line1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SCORE', x + 14, line2);

  // Best, distance and speed.
  const statX = x + (m ? 78 : 105);
  ctx.fillStyle = '#facc15';
  ctx.font = `bold ${m ? 11 : 12}px monospace`;
  ctx.fillText(`👑 ${game.highScore}`, statX, line1);
  const kmh = Math.round(((player.speed * 60) / WORLD.pixelsPerMeter) * 3.6);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${meters()}m · ${kmh}KM/H`, statX, line2);

  // Combo / hyper bar.
  const barX = x + (m ? 168 : 245);
  const barW = Math.min(m ? 80 : 220, w - (m ? 240 : 380));
  if (barW > 30) {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = hyper ? '#38bdf8' : player.multiplier > 1 ? '#facc15' : '#94a3b8';
    ctx.fillText(hyper ? '⚡ HYPER' : `FLOW ${player.multiplier}x`, barX, label);

    ctx.fillStyle = '#0f172a';
    roundRect(barX, line1, barW, 8, 4);
    ctx.fill();

    const fill = barW * comboProgress();
    if (fill > 0) {
      ctx.fillStyle = hyper ? '#38bdf8' : player.multiplier > 1 ? '#facc15' : '#10b981';
      roundRect(barX, line1, fill, 8, 4);
      ctx.fill();
    }
  }

  // Jump charges.
  const pipsX = x + w - (m ? 55 : 90);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(isMuted() ? 'JUMP 🔇' : 'JUMP', pipsX, label);
  const pipY = y + (m ? 26 : 32);
  drawDiamond(pipsX + 12, pipY, player.grounded || player.clingTo || player.coyoteTicks > 0);
  drawDiamond(pipsX + 28, pipY, player.airJumps > 0);

  ctx.restore();
}

function drawDiamond(x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = filled ? '#10b981' : '#334155';
  if (filled) {
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
  }
  ctx.fillRect(-4, -4, 8, 8);
  ctx.restore();
}

export function drawTouchZones() {
  if (!view.isMobile) return;
  const { width: w, height: h } = view;
  const zoneW = w / 2 - 18;

  ctx.save();
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';

  const sliding = input.slideHeld || player.sliding;
  ctx.fillStyle = sliding ? 'rgba(56, 189, 248, 0.28)' : 'rgba(255, 255, 255, 0.06)';
  roundRect(12, h - 48, zoneW, 38, 8);
  ctx.fill();
  ctx.fillStyle = sliding ? '#38bdf8' : 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('▼ HOLD TO SLIDE', w / 4, h - 24);

  const airborne = !player.grounded;
  ctx.fillStyle = airborne ? 'rgba(52, 211, 153, 0.28)' : 'rgba(255, 255, 255, 0.06)';
  roundRect(w / 2 + 6, h - 48, zoneW, 38, 8);
  ctx.fill();
  ctx.fillStyle = airborne ? '#34d399' : 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('▲ JUMP', w * 0.75, h - 24);

  ctx.restore();
}

export function drawCityBanner() {
  if (game.cityBannerTicks <= 0) return;
  const city = currentCity();
  const alpha = Math.min(1, game.cityBannerTicks / 40);
  const y = view.isMobile ? 65 : 84;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(view.width / 2 - 140, y, 280, 36, 8);
  ctx.fill();
  ctx.strokeStyle = city.neonAccent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ENTERING ${city.name}`, view.width / 2, y + 23);
  ctx.restore();
}
