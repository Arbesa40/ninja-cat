import { view } from '../core/canvas.js';

const FAR = { speed: 0.15, minW: 90, extraW: 90, spacing: 24, mobileHeight: 0.55, desktopHeight: 260, extraH: 140 };
const MID = { speed: 0.45, minW: 70, extraW: 70, spacing: 35, mobileHeight: 0.45, desktopHeight: 180, extraH: 120 };

export const parallax = {
  stars: [],
  clouds: [],
  far: [],
  mid: [],
  landmarkX: 0,
};

function skylineBlock(layer, x) {
  const w = layer.minW + Math.random() * layer.extraW;
  const base = view.isMobile ? view.height * layer.mobileHeight : layer.desktopHeight;
  const h = base + Math.random() * layer.extraH;
  return { x, y: view.height - h, w, h };
}

function fillSkyline(layer) {
  const blocks = [];
  let x = -50;
  while (x < view.width + 400) {
    const b = skylineBlock(layer, x);
    blocks.push(b);
    x += b.w + layer.spacing;
  }
  return blocks;
}

export function initParallax() {
  parallax.landmarkX = view.width * 0.45;

  parallax.stars = Array.from({ length: 65 }, () => ({
    x: Math.random() * view.width,
    y: Math.random() * view.height * 0.5,
    size: Math.random() * 2 + 0.8,
    blinkOffset: Math.random() * Math.PI * 2,
  }));

  parallax.clouds = Array.from({ length: 6 }, () => ({
    x: Math.random() * view.width,
    y: 30 + Math.random() * 120,
    scale: 0.6 + Math.random() * 0.5,
    speedFactor: 0.04 + Math.random() * 0.04,
  }));

  parallax.far = fillSkyline(FAR);
  parallax.mid = fillSkyline(MID);
}

function scrollSkyline(blocks, layer, dx) {
  for (const b of blocks) b.x -= dx * layer.speed;
  if (blocks.length && blocks[0].x + blocks[0].w < -50) {
    const last = blocks.at(-1);
    blocks.shift();
    blocks.push(skylineBlock(layer, last.x + last.w + layer.spacing));
  }
}

export function updateParallax(dx) {
  parallax.landmarkX -= dx * 0.08;
  if (parallax.landmarkX < -400) parallax.landmarkX = view.width + 200;

  scrollSkyline(parallax.far, FAR, dx);
  scrollSkyline(parallax.mid, MID, dx);

  for (const c of parallax.clouds) {
    c.x -= dx * c.speedFactor;
    if (c.x + 200 * c.scale < 0) {
      c.x = view.width + 80;
      c.y = 30 + Math.random() * 120;
    }
  }
}

export function resetLandmark() {
  parallax.landmarkX = view.width + 100;
}
