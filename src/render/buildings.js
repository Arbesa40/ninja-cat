import { ctx, view } from '../core/canvas.js';

const STYLES = {
  cyber_tokyo(b, h, isDay) {
    const { x, y, w, subType } = b;
    ctx.fillStyle = isDay ? (subType === 0 ? '#1e293b' : '#0f172a') : (subType === 0 ? '#0b1120' : '#020617');
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = subType === 0 ? '#38bdf8' : '#818cf8';
    ctx.fillRect(x, y, w, 5);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let lx = x + 16; lx < x + w; lx += 32) {
      ctx.moveTo(lx, y + 6);
      ctx.lineTo(lx, y + h);
    }
    ctx.stroke();

    forEachWindow(b, h, 10, (wx, wy, lit) => {
      if (lit) ctx.fillStyle = isDay ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.75)';
      else ctx.fillStyle = isDay ? '#334155' : '#111827';
      ctx.fillRect(wx, wy, 15, 20);
    });
  },

  haussmann_paris(b, h, isDay) {
    const { x, y, w, subType } = b;
    ctx.fillStyle = isDay ? (subType === 0 ? '#f1f5f9' : '#e2e8f0') : (subType === 0 ? '#64748b' : '#475569');
    ctx.fillRect(x, y, w, h);

    // Mansard roof with railing.
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, 18);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y + 15, w, 3);
    for (let rx = x + 4; rx < x + w - 4; rx += 7) ctx.fillRect(rx, y + 10, 2, 7);

    forEachWindow(b, h, 12, (wx, wy, lit) => {
      ctx.fillStyle = isDay ? '#cbd5e1' : '#334155';
      ctx.fillRect(wx - 2, wy - 3, 20, 28);
      if (lit) ctx.fillStyle = isDay ? '#fef08a' : '#f59e0b';
      else ctx.fillStyle = isDay ? '#94a3b8' : '#1e293b';
      ctx.fillRect(wx, wy, 16, 24);
    });
  },

  tenement_nyc(b, h, isDay) {
    const { x, y, w, subType } = b;
    ctx.fillStyle = subType === 0 ? (isDay ? '#9a3412' : '#571c0d') : (isDay ? '#78350f' : '#451a03');
    ctx.fillRect(x, y, w, h);

    // Cornice.
    ctx.fillStyle = isDay ? '#e7e5e4' : '#78716c';
    ctx.fillRect(x - 2, y, w + 4, 10);
    ctx.fillStyle = isDay ? '#a8a29e' : '#44403c';
    ctx.fillRect(x, y + 10, w, 4);

    forEachWindow(b, h, 14, (wx, wy, lit) => {
      ctx.fillStyle = isDay ? '#d6d3d1' : '#57534e';
      ctx.fillRect(wx - 2, wy - 4, 18, 3);

      if (lit) ctx.fillStyle = isDay ? '#fef08a' : '#fbbf24';
      else ctx.fillStyle = isDay ? '#1c1917' : '#0c0a09';
      ctx.fillRect(wx, wy, 14, 20);

      ctx.fillStyle = isDay ? '#78716c' : '#292524';
      ctx.fillRect(wx + 6, wy, 2, 20);
      ctx.fillRect(wx, wy + 9, 14, 2);
    });
  },
};

function forEachWindow(b, h, bottomMargin, draw) {
  for (const win of b.windows) {
    if (win.relY > h - bottomMargin) continue;
    draw(b.x + win.relX, b.y + win.relY, win.isLit);
  }
}

export function drawBuildings(buildings, env) {
  for (const b of buildings) {
    if (b.x > view.width || b.x + b.w < 0) continue;
    STYLES[b.style](b, view.height - b.y, env.isDay);
  }
}
