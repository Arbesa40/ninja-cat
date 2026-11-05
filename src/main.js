import { TICK_MS, MAX_FRAME_MS } from './config.js';
import { resizeCanvas, view } from './core/canvas.js';
import { unlockAudio, toggleMute, suspendAudio, resumeAudio } from './core/audio.js';
import { initInput } from './core/input.js';
import { loadSprites } from './core/sprites.js';
import { loadLocalHighScore, loadRemoteHighScore, signalLoading, signalReady } from './core/storage.js';
import { game } from './game/state.js';
import { showTitle, startRun, canRestart, pause, resume, handleResize } from './game/session.js';
import { tick, queueJump, queueSlide } from './game/update.js';
import { render } from './render/index.js';

function onAction(action) {
  unlockAudio();

  if (action === 'mute') {
    toggleMute();
    return;
  }
  if (action === 'slideEnd') return;

  switch (game.mode) {
    case 'title':
      if (action !== 'pause') startRun();
      break;
    case 'paused':
      resume();
      break;
    case 'over':
      if (action !== 'pause' && canRestart()) startRun();
      break;
    case 'playing':
      if (action === 'jump') queueJump();
      else if (action === 'slideStart') queueSlide();
      else if (action === 'pause') pause();
      break;
  }
}

// Fixed 60 Hz simulation so the game plays the same on 60, 120 and 144 Hz displays.
let lastFrame = performance.now();
let accumulator = 0;

function frame(now) {
  accumulator += Math.min(now - lastFrame, MAX_FRAME_MS);
  lastFrame = now;
  while (accumulator >= TICK_MS) {
    tick();
    accumulator -= TICK_MS;
  }
  render();
  requestAnimationFrame(frame);
}

function boot() {
  signalLoading();
  resizeCanvas();
  game.highScore = loadLocalHighScore();
  showTitle();

  let lastWidth = view.width;
  window.addEventListener('resize', () => {
    resizeCanvas();
    handleResize(view.width !== lastWidth);
    lastWidth = view.width;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pause();
      suspendAudio();
    } else if (game.mode !== 'paused') {
      resumeAudio();
    }
  });

  initInput(onAction);

  loadRemoteHighScore().then((remote) => {
    game.highScore = Math.max(game.highScore, remote);
  });
  loadSprites().then(signalReady);

  requestAnimationFrame(frame);
}

boot();
