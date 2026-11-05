// The asset pack has no dedicated slide animation, so two crouched frames
// from the death sequence stand in for it.
const ANIMATIONS = {
  run: { folder: 'run', prefix: 'ninja-run_', frames: range(0, 11), ticksPerFrame: 3, loop: true },
  air: { folder: 'slash', prefix: 'ninja-slash_', frames: range(0, 11), ticksPerFrame: 2, loop: false },
  slide: { folder: 'die', prefix: 'ninja-die_', frames: range(10, 11), ticksPerFrame: 6, loop: true },
  idle: { folder: 'idle active', prefix: 'ninja-idle active_', frames: range(0, 28), ticksPerFrame: 3, loop: true },
  die: { folder: 'die', prefix: 'ninja-die_', frames: range(0, 18), ticksPerFrame: 3, loop: false },
};

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const images = {};
let fallbackFrame = null;

const isReady = (img) => img && img.complete && img.naturalWidth > 0;

export function loadSprites() {
  const pending = [];
  for (const [key, anim] of Object.entries(ANIMATIONS)) {
    images[key] = anim.frames.map((n) => {
      const img = new Image();
      img.src = `assets/${anim.folder}/${anim.prefix}${String(n).padStart(2, '0')}.png`;
      pending.push(
        new Promise((resolve) => {
          img.onload = () => {
            if (!fallbackFrame) fallbackFrame = img;
            resolve();
          };
          img.onerror = resolve;
        })
      );
      return img;
    });
  }
  return Promise.all(pending);
}

export class Animator {
  constructor(initial = 'run') {
    this.current = initial;
    this.frame = 0;
    this.ticks = 0;
  }

  play(key, restart = false) {
    if (this.current === key && !restart) return;
    this.current = key;
    this.frame = 0;
    this.ticks = 0;
  }

  update() {
    const anim = ANIMATIONS[this.current];
    if (++this.ticks < anim.ticksPerFrame) return;
    this.ticks = 0;
    if (this.frame < anim.frames.length - 1) this.frame++;
    else if (anim.loop) this.frame = 0;
  }

  // Falls back to the last good frame so the sprite never blinks out while loading.
  image() {
    const img = images[this.current]?.[this.frame];
    if (isReady(img)) {
      fallbackFrame = img;
      return img;
    }
    return isReady(fallbackFrame) ? fallbackFrame : null;
  }
}
