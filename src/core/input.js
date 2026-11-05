// Translates keyboard, mouse and touch into game actions:
// 'jump', 'slideStart', 'slideEnd', 'pause', 'mute'.

const KEY_ACTIONS = {
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Enter: 'jump',
  ArrowDown: 'slideStart',
  KeyS: 'slideStart',
  KeyP: 'pause',
  Escape: 'pause',
  KeyM: 'mute',
};

const SLIDE_KEYS = new Set(['ArrowDown', 'KeyS']);

export const input = {
  slideHeld: false,
};

export function initInput(onAction) {
  const heldSlideKeys = new Set();
  const slidePointers = new Set();

  const updateSlideHeld = () => {
    const held = heldSlideKeys.size > 0 || slidePointers.size > 0;
    if (input.slideHeld && !held) onAction('slideEnd');
    input.slideHeld = held;
  };

  window.addEventListener('keydown', (e) => {
    const action = KEY_ACTIONS[e.code];
    if (!action) return;
    e.preventDefault();
    if (e.repeat) return;
    if (SLIDE_KEYS.has(e.code)) {
      heldSlideKeys.add(e.code);
      input.slideHeld = true;
    }
    onAction(action);
  });

  window.addEventListener('keyup', (e) => {
    if (!SLIDE_KEYS.has(e.code)) return;
    heldSlideKeys.delete(e.code);
    updateSlideHeld();
  });

  // Touch: left half of the screen slides (hold to keep sliding), right half jumps.
  // Acting on pointerdown rather than release keeps input latency low.
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') {
      if (e.button === 0) onAction('jump');
      return;
    }
    if (e.clientX < window.innerWidth / 2) {
      slidePointers.add(e.pointerId);
      input.slideHeld = true;
      onAction('slideStart');
    } else {
      onAction('jump');
    }
  });

  const releasePointer = (e) => {
    if (!slidePointers.delete(e.pointerId)) return;
    updateSlideHeld();
  };
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);

  // Stops iOS from turning taps into scrolls, zooms or synthetic mouse clicks.
  window.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('blur', () => {
    heldSlideKeys.clear();
    slidePointers.clear();
    updateSlideHeld();
  });
}
