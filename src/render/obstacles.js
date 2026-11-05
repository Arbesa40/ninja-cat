import { ctx } from '../core/canvas.js';

function drawHvac({ x, y, w, h }, now) {
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Louvres.
  ctx.fillStyle = '#0f172a';
  for (let ly = y + 8; ly < y + h - 6; ly += 6) ctx.fillRect(x + 6, ly, w * 0.45, 2.5);

  // Spinning fan.
  const r = Math.min(w * 0.22, h * 0.35);
  const cx = x + w - r - 8;
  const cy = y + h / 2;
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  const spin = now * 0.018;
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = spin + (i * Math.PI) / 2;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x, y, w, 4);
}

function drawPipe({ x, y, w, h }, now) {
  // Support legs and base plates.
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y + 2, 8, h + 24);
  ctx.fillRect(x + w - 8, y + 2, 8, h + 24);
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 2, y + h + 20, 12, 6);
  ctx.fillRect(x + w - 10, y + h + 20, 12, 6);

  const pipeY = y + 8;
  const pipeH = 14;
  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 2, pipeY, w - 4, pipeH);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 2, pipeY + 2, w - 4, 3);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 2, pipeY + pipeH - 3, w - 4, 3);

  // Collars.
  const spacing = (w - 24) / 3;
  for (let i = 1; i <= 2; i++) {
    const cx = x + 12 + spacing * i;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cx - 3, pipeY - 2, 6, pipeH + 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 1, pipeY, 2, pipeH);
  }

  // Hazard stripes.
  const stripeW = 32;
  const sx0 = x + (w - stripeW) / 2;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(sx0, pipeY, stripeW, pipeH);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  for (let sx = sx0 + 4; sx < sx0 + stripeW; sx += 8) {
    ctx.moveTo(sx, pipeY + pipeH);
    ctx.lineTo(sx + 4, pipeY);
    ctx.lineTo(sx + 7, pipeY);
    ctx.lineTo(sx + 3, pipeY + pipeH);
    ctx.closePath();
  }
  ctx.fill();

  // Steam vent.
  const pulse = (Math.sin(now * 0.008) + 1) / 2;
  const vx = x + w * 0.32;
  const vy = pipeY + pipeH;
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(vx - 2, vy, 4, 5);
  ctx.fillStyle = `rgba(241, 245, 249, ${0.25 + pulse * 0.35})`;
  ctx.beginPath();
  ctx.arc(vx, vy + 7 + pulse * 4, 6 + pulse * 5, 0, Math.PI * 2);
  ctx.arc(vx + 6, vy + 11 + pulse * 6, 8 + pulse * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawChimney({ x, y, w, h }) {
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(x, y, w, h);

  // Mortar courses.
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let my = y + 12; my < y + h; my += 16) {
    ctx.moveTo(x, my);
    ctx.lineTo(x + w, my);
  }
  ctx.stroke();

  // Coping.
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x - 3, y, w + 6, 8);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x - 1, y + 8, w + 2, 4);

  // Ladder rungs hint that the wall can be climbed.
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let ry = y + 20; ry < y + h - 10; ry += 18) {
    ctx.moveTo(x + 6, ry);
    ctx.lineTo(x + w - 6, ry);
  }
  ctx.stroke();

  // Chimney pots.
  const potW = (w - 8) / 2;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 2, y - 10, potW, 10);
  ctx.fillRect(x + potW + 6, y - 10, potW, 10);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 4, y - 12, potW - 4, 3);
  ctx.fillRect(x + potW + 8, y - 12, potW - 4, 3);
}

const DRAWERS = { hvac: drawHvac, pipe: drawPipe, chimney: drawChimney };

export function drawObstacles(obstacles, now) {
  for (const obs of obstacles) {
    if (!obs.destroyed) DRAWERS[obs.type](obs, now);
  }
}

export function drawShurikens(shurikens, now) {
  const spin = now * 0.008;
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 7;

  for (const s of shurikens) {
    if (s.collected) continue;
    const r = s.w / 2;
    ctx.save();
    ctx.translate(s.x + r, s.y + s.h / 2);
    ctx.rotate(spin);

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, -r);
      ctx.lineTo(r / 2.5, -r / 2.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(-r / 2.5, -r / 2.5);
      ctx.closePath();
    }
    ctx.fill();

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
