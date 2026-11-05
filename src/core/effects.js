import { ctx } from './canvas.js';

const PARTICLE_GRAVITY = 0.08;
const TEXT_LIFE = 42;

let particles = [];
let floatingTexts = [];

export function clearEffects() {
  particles = [];
  floatingTexts = [];
}

export function spawnParticles(x, y, count, color, speedMultiplier = 1, shape = 'circle') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 3 + 1) * speedMultiplier;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      size: Math.random() * 3.5 + 2,
      color,
      shape,
      alpha: 1,
      decay: 0.03 + Math.random() * 0.02,
    });
  }
}

export function addFloatingText(text, x, y, color = '#fef08a') {
  floatingTexts.push({ text, x, y, color, life: TEXT_LIFE });
}

export function updateEffects() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += PARTICLE_GRAVITY;
    p.alpha -= p.decay;
  }
  particles = particles.filter((p) => p.alpha > 0);

  for (const t of floatingTexts) {
    t.y -= 1.1;
    t.life--;
  }
  floatingTexts = floatingTexts.filter((t) => t.life > 0);
}

export function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    if (p.shape === 'star') {
      ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawFloatingTexts() {
  ctx.save();
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  for (const t of floatingTexts) {
    ctx.globalAlpha = t.life / TEXT_LIFE;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.restore();
}
