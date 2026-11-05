import { STORAGE_KEY } from '../config.js';

const playables = () => window.YTPlayables;

export function loadLocalHighScore() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(highScore) {
  try {
    localStorage.setItem(STORAGE_KEY, String(highScore));
  } catch {
    // Storage can be unavailable (private mode, sandboxed iframes).
  }
  playables()?.saveData?.(JSON.stringify({ highScore }));
}

// Resolves with the cloud-saved high score from YouTube Playables, if any.
export async function loadRemoteHighScore() {
  const yt = playables();
  if (!yt?.loadData) return 0;
  try {
    const saved = await yt.loadData();
    return saved ? JSON.parse(saved).highScore || 0 : 0;
  } catch {
    return 0;
  }
}

export function signalLoading() {
  playables()?.gameLoading?.();
}

export function signalReady() {
  playables()?.gameReady?.();
}
