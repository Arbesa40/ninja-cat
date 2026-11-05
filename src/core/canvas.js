export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Logical (CSS pixel) size. All game code works in these units.
export const view = { width: 0, height: 0, isMobile: false };

export function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.width = window.innerWidth;
  view.height = window.innerHeight;
  view.isMobile = view.width < 850 || window.matchMedia('(pointer: coarse)').matches;

  canvas.width = Math.round(view.width * dpr);
  canvas.height = Math.round(view.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ctx.roundRect is missing on older Safari.
export function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
