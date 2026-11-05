import { ctx, view } from '../core/canvas.js';
import { parallax } from '../game/parallax.js';

export function drawSky(env) {
  const grad = ctx.createLinearGradient(0, 0, 0, view.height);
  grad.addColorStop(0, env.skyTop);
  grad.addColorStop(0.55, env.skyMid);
  grad.addColorStop(1, env.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, view.width, view.height);
}

export function drawStars(env, now) {
  if (env.starsAlpha <= 0) return;
  for (const s of parallax.stars) {
    const flicker = (Math.sin(now * 0.005 + s.blinkOffset) + 1) / 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${env.starsAlpha * (0.3 + 0.7 * flicker)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The sun/moon travels an ellipse once per day cycle.
export function drawCelestialBody(env, cycle) {
  const angle = cycle * Math.PI * 2 - Math.PI / 2;
  const x = view.width / 2 + Math.cos(angle) * view.width * 0.45;
  const y = view.height * 0.6 + Math.sin(angle) * view.height * 0.44;

  const glow = ctx.createRadialGradient(x, y, 12, x, y, 80);
  glow.addColorStop(0, env.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = env.bodyColor;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
}

export function drawClouds(env) {
  ctx.fillStyle = env.cloudColor;
  for (const { x, y, scale: s } of parallax.clouds) {
    ctx.beginPath();
    ctx.arc(x, y, 24 * s, 0, Math.PI * 2);
    ctx.arc(x + 22 * s, y - 14 * s, 28 * s, 0, Math.PI * 2);
    ctx.arc(x + 52 * s, y - 10 * s, 25 * s, 0, Math.PI * 2);
    ctx.arc(x + 75 * s, y + 2 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 36 * s, y + 10 * s, 26 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

const LANDMARKS = {
  tokyo_tower(lx, groundY, now) {
    ctx.beginPath();
    ctx.moveTo(lx, groundY);
    ctx.lineTo(lx + 40, groundY - 240);
    ctx.lineTo(lx + 50, groundY - 240);
    ctx.lineTo(lx + 90, groundY);
    ctx.lineTo(lx + 70, groundY);
    ctx.lineTo(lx + 45, groundY - 140);
    ctx.lineTo(lx + 20, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(lx + 38, groundY - 150, 14, 16);
    ctx.fillRect(lx + 43, groundY - 280, 4, 40);

    ctx.fillStyle = Math.sin(now * 0.008) > 0 ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(lx + 45, groundY - 282, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  eiffel_tower(lx, groundY) {
    ctx.beginPath();
    ctx.moveTo(lx, groundY);
    ctx.quadraticCurveTo(lx + 40, groundY - 110, lx + 42, groundY - 220);
    ctx.lineTo(lx + 48, groundY - 220);
    ctx.quadraticCurveTo(lx + 50, groundY - 110, lx + 90, groundY);
    ctx.lineTo(lx + 74, groundY);
    ctx.quadraticCurveTo(lx + 45, groundY - 60, lx + 16, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(lx + 32, groundY - 80, 26, 6);
    ctx.fillRect(lx + 38, groundY - 150, 14, 6);
    ctx.fillRect(lx + 44, groundY - 260, 2, 40);
  },

  empire_state(lx, groundY) {
    const cx = lx + 45;
    ctx.fillRect(cx - 35, groundY - 140, 70, 140);
    ctx.fillRect(cx - 24, groundY - 210, 48, 70);
    ctx.fillRect(cx - 14, groundY - 250, 28, 40);
    ctx.fillRect(cx - 6, groundY - 275, 12, 25);
    ctx.fillRect(cx - 2, groundY - 310, 4, 35);

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(cx, groundY - 278, 3, 0, Math.PI * 2);
    ctx.fill();
  },
};

export function drawLandmark(city, now) {
  const groundY = view.height - (view.isMobile ? 180 : 100);
  ctx.fillStyle = '#060a17';
  LANDMARKS[city.landmark](parallax.landmarkX, groundY, now);
}

export function drawSkyline(env) {
  ctx.fillStyle = env.isDay ? '#334155' : '#0b1329';
  for (const b of parallax.far) ctx.fillRect(b.x, b.y, b.w, b.h);

  const windowColor = env.isDay ? 'rgba(254, 240, 138, 0.6)' : 'rgba(253, 224, 71, 0.35)';
  for (const b of parallax.mid) {
    ctx.fillStyle = env.isDay ? '#475569' : '#111827';
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = windowColor;
    for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 18) {
      for (let wy = b.y + 14; wy < view.height; wy += 28) {
        // Pseudo-random pattern that stays stable as the block scrolls.
        if (Math.floor(wx - b.x + wy * 7 + b.w) % 5 === 0) ctx.fillRect(wx, wy, 6, 8);
      }
    }
  }
}

export function drawFog(env) {
  const h = view.isMobile ? 180 : 220;
  const grad = ctx.createLinearGradient(0, view.height - h, 0, view.height);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.5, env.fogColor);
  grad.addColorStop(1, env.fogColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, view.height - h, view.width, h);
}
