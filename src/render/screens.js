import { ctx, view, roundRect } from '../core/canvas.js';
import { game, currentCity, meters } from '../game/state.js';

const CENTER = () => view.width / 2;

function card(height, accent) {
  const w = Math.min(380, view.width - 36);
  const x = (view.width - w) / 2;
  const y = Math.max(12, (view.height - height) / 2);

  ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
  ctx.fillRect(0, 0, view.width, view.height);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  roundRect(x, y, w, height, 16);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = accent;
  roundRect(x + 24, y, w - 48, 3, 2);
  ctx.fill();

  ctx.textAlign = 'center';
  return { x, y, w, h: height };
}

function divider(c, y) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c.x + 24, y);
  ctx.lineTo(c.x + c.w - 24, y);
  ctx.stroke();
}

function pulsingButton(c, y, text) {
  const pulse = (Math.sin(performance.now() * 0.007) + 1) / 2;
  const bx = c.x + 24;
  const bw = c.w - 48;
  ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + pulse * 0.08})`;
  roundRect(bx, y, bw, 46, 10);
  ctx.fill();
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + pulse * 0.4})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 15px monospace';
  ctx.fillStyle = '#4ade80';
  ctx.fillText(text, CENTER(), y + 28);
}

function hint(c, text) {
  ctx.font = '10px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(text, CENTER(), c.y + c.h - 12);
}

function stat(x, y, label, value, color, size = 15) {
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(label, x, y);
  ctx.font = `bold ${size}px monospace`;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y + 22);
}

const CONTROLS = {
  desktop: [
    ['SPACE / ↑', 'jump · again in mid-air'],
    ['HOLD ↓', 'slide under pipes'],
    ['↓ IN AIR', 'fast fall'],
    ['P · M', 'pause · mute'],
  ],
  mobile: [
    ['TAP RIGHT', 'jump · again in mid-air'],
    ['HOLD LEFT', 'slide under pipes'],
    ['LEFT IN AIR', 'fast fall'],
  ],
};

function drawTitleScreenBody() {
  const rows = view.isMobile ? CONTROLS.mobile : CONTROLS.desktop;
  const c = card(250 + rows.length * 20, '#38bdf8');

  ctx.font = '900 30px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('NINJA CAT', CENTER(), c.y + 50);
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('ROOFTOP RUNNER', CENTER(), c.y + 70);

  divider(c, c.y + 88);

  ctx.font = '11px monospace';
  rows.forEach(([key, action], i) => {
    const y = c.y + 112 + i * 20;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(key, CENTER() - 8, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(action, CENTER() + 8, y);
  });
  ctx.textAlign = 'center';
  ctx.font = '10px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Hit a chimney mid-air to cling, then jump to climb.', CENTER(), c.y + 120 + rows.length * 20);

  pulsingButton(c, c.y + c.h - 76, '▶  START RUN');
  hint(c, game.highScore > 0 ? `BEST ${game.highScore}` : view.isMobile ? 'Tap to start' : 'Press SPACE to start');
}

function drawPauseScreenBody() {
  const c = card(150, '#38bdf8');
  ctx.font = '900 22px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('PAUSED', CENTER(), c.y + 48);
  pulsingButton(c, c.y + 70, '▶  RESUME');
  hint(c, view.isMobile ? 'Tap to resume' : 'Press P or SPACE to resume');
}

function drawGameOverScreenBody() {
  const record = game.isNewHighScore;
  const accent = record ? '#f59e0b' : '#f43f5e';
  const c = card(view.isMobile ? 320 : 340, accent);

  ctx.font = '900 13px monospace';
  ctx.fillStyle = record ? '#fbbf24' : '#f43f5e';
  ctx.fillText(record ? '★ NEW RECORD ★' : 'RUN OVER', CENTER(), c.y + 36);

  ctx.font = '900 38px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(String(game.score).padStart(5, '0'), CENTER(), c.y + 84);
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('FINAL SCORE', CENTER(), c.y + 102);

  divider(c, c.y + 118);
  stat(c.x + c.w * 0.25, c.y + 140, 'BEST', String(game.highScore), '#facc15', 16);
  stat(c.x + c.w * 0.5, c.y + 140, 'CITY', currentCity().name, '#38bdf8', 14);
  stat(c.x + c.w * 0.75, c.y + 140, 'DISTANCE', `${meters()}m`, '#34d399');
  divider(c, c.y + 182);

  pulsingButton(c, c.y + c.h - 72, '▶  RUN AGAIN');
  hint(c, view.isMobile ? 'Tap anywhere to run again' : 'Press SPACE to run again');
}

const withSavedState = (draw) => () => {
  ctx.save();
  draw();
  ctx.restore();
};

export const drawTitleScreen = withSavedState(drawTitleScreenBody);
export const drawPauseScreen = withSavedState(drawPauseScreenBody);
export const drawGameOverScreen = withSavedState(drawGameOverScreenBody);
