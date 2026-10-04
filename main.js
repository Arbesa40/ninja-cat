const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isMobile = false;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  isMobile = window.innerWidth < 850 || ('ontouchstart' in window);
}
window.addEventListener('resize', () => {
  resize();
  initParallax();
});
resize();

// -------------------------------------------------------------
// Procedural Web Audio FX (Zero External Sound Files)
// -------------------------------------------------------------
const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playJump() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  },
  playSlash() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  },
  playSlide() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  },
  playWallKick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  },
  playCoin() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  },
  playHyper() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  },
  playCrash() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
};

// -------------------------------------------------------------
// Visual Feedback & Particles
// -------------------------------------------------------------
let floatingTexts = [];
function addFloatingText(text, x, y, color = '#fef08a') {
  floatingTexts.push({ text, x, y, color, life: 42, maxLife: 42 });
}

let particles = [];
function spawnParticles(x, y, count, color, speedMultiplier = 1, shape = 'circle') {
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
      alpha: 1.0,
      decay: 0.03 + Math.random() * 0.02
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    if (p.shape === 'star') {
      ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// -------------------------------------------------------------
// Day-Night Engine
// -------------------------------------------------------------
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function lerpColor(c1, c2, factor) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * factor);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * factor);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

const TIME_STAGES = [
  {
    name: 'DAWN',
    skyTop: hexToRgb('#0f172a'),
    skyMid: hexToRgb('#3b0764'),
    skyBottom: hexToRgb('#7c2d12'),
    cloudColor: 'rgba(253, 186, 116, 0.35)',
    sunMoonGlow: 'rgba(251, 146, 60, 0.5)',
    bodyColor: '#fed7aa',
    isDay: false,
    starsAlpha: 0.25,
    fogColor: 'rgba(59, 7, 100, 0.08)'
  },
  {
    name: 'MORNING',
    skyTop: hexToRgb('#0284c7'),
    skyMid: hexToRgb('#38bdf8'),
    skyBottom: hexToRgb('#bae6fd'),
    cloudColor: 'rgba(255, 255, 255, 0.7)',
    sunMoonGlow: 'rgba(253, 224, 71, 0.65)',
    bodyColor: '#fef08a',
    isDay: true,
    starsAlpha: 0.0,
    fogColor: 'rgba(186, 230, 253, 0.12)'
  },
  {
    name: 'NOON',
    skyTop: hexToRgb('#0369a1'),
    skyMid: hexToRgb('#0ea5e9'),
    skyBottom: hexToRgb('#7dd3fc'),
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    sunMoonGlow: 'rgba(255, 255, 255, 0.85)',
    bodyColor: '#fff',
    isDay: true,
    starsAlpha: 0.0,
    fogColor: 'rgba(255, 255, 255, 0.08)'
  },
  {
    name: 'AFTERNOON',
    skyTop: hexToRgb('#1e3a8a'),
    skyMid: hexToRgb('#ea580c'),
    skyBottom: hexToRgb('#fde047'),
    cloudColor: 'rgba(254, 215, 170, 0.6)',
    sunMoonGlow: 'rgba(249, 115, 22, 0.7)',
    bodyColor: '#f97316',
    isDay: true,
    starsAlpha: 0.0,
    fogColor: 'rgba(251, 146, 60, 0.16)'
  },
  {
    name: 'EVENING / DUSK',
    skyTop: hexToRgb('#0f172a'),
    skyMid: hexToRgb('#581c87'),
    skyBottom: hexToRgb('#be123c'),
    cloudColor: 'rgba(168, 85, 247, 0.35)',
    sunMoonGlow: 'rgba(225, 29, 72, 0.55)',
    bodyColor: '#fda4af',
    isDay: false,
    starsAlpha: 0.5,
    fogColor: 'rgba(136, 19, 55, 0.18)'
  },
  {
    name: 'MIDNIGHT',
    skyTop: hexToRgb('#020617'),
    skyMid: hexToRgb('#0b1329'),
    skyBottom: hexToRgb('#111827'),
    cloudColor: 'rgba(71, 85, 105, 0.25)',
    sunMoonGlow: 'rgba(192, 132, 252, 0.45)',
    bodyColor: '#f1f5f9',
    isDay: false,
    starsAlpha: 1.0,
    fogColor: 'rgba(15, 23, 42, 0.22)'
  }
];

let worldCycleTime = 0.85;
const CYCLE_SPEED = 0.00004;

function getEnvironmentState() {
  const totalStages = TIME_STAGES.length;
  const progress = (worldCycleTime % 1) * totalStages;
  const idxA = Math.floor(progress);
  const idxB = (idxA + 1) % totalStages;
  const factor = progress - idxA;

  const a = TIME_STAGES[idxA];
  const b = TIME_STAGES[idxB];

  return {
    name: a.name,
    isDay: a.isDay,
    skyTop: lerpColor(a.skyTop, b.skyTop, factor),
    skyMid: lerpColor(a.skyMid, b.skyMid, factor),
    skyBottom: lerpColor(a.skyBottom, b.skyBottom, factor),
    cloudColor: a.cloudColor,
    sunMoonGlow: a.sunMoonGlow,
    bodyColor: a.bodyColor,
    starsAlpha: a.starsAlpha + (b.starsAlpha - a.starsAlpha) * factor,
    fogColor: a.fogColor
  };
}

// -------------------------------------------------------------
// City Biomes Pool
// -------------------------------------------------------------
const BASE_CITIES = [
  { name: 'TOKYO', architecture: 'cyber_tokyo', landmark: 'tokyo_tower', neonAccent: '#38bdf8' },
  { name: 'PARIS', architecture: 'haussmann_paris', landmark: 'eiffel_tower', neonAccent: '#c084fc' },
  { name: 'NEW YORK', architecture: 'tenement_nyc', landmark: 'empire_state', neonAccent: '#f59e0b' }
];

let activeCitySequence = [];
let currentCityIndex = 0;
let cityBannerTimer = 0;
const POINTS_PER_CITY = 160;

function shuffleCities() {
  const pool = [...BASE_CITIES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function getActiveCity(currentScore) {
  const step = Math.floor(currentScore / POINTS_PER_CITY);
  const index = step % activeCitySequence.length;
  return { city: activeCitySequence[index], index };
}

// -------------------------------------------------------------
// Bulletproof Sprite Preloader & Multi-Animation Controller
// -------------------------------------------------------------
const animations = {
  run:   { folder: 'run',         prefix: 'ninja-run_',         count: 12, speed: 3, loop: true,  frames: [] },
  slash: { folder: 'slash',       prefix: 'ninja-slash_',       count: 12, speed: 2, loop: false, frames: [] },
  slide: { folder: 'die',         prefix: 'ninja-die_',         startFrame: 10, endFrame: 11, speed: 6, loop: true, frames: [] },
  wall:  { folder: 'idle active', prefix: 'ninja-idle active_', count: 29, speed: 3, loop: true,  frames: [] },
  die:   { folder: 'die',         prefix: 'ninja-die_',         count: 19, speed: 3, loop: false, frames: [] }
};

let lastValidSpriteFrame = null;

Object.keys(animations).forEach((animKey) => {
  const anim = animations[animKey];
  if (anim.startFrame !== undefined && anim.endFrame !== undefined) {
    for (let i = anim.startFrame; i <= anim.endFrame; i++) {
      const padIndex = i < 10 ? `0${i}` : `${i}`;
      const img = new Image();
      img.src = `assets/${anim.folder}/${anim.prefix}${padIndex}.png`;
      img.onload = () => {
        if (!lastValidSpriteFrame) lastValidSpriteFrame = img;
      };
      anim.frames.push(img);
    }
  } else {
    for (let i = 0; i < anim.count; i++) {
      const padIndex = i < 10 ? `0${i}` : `${i}`;
      const img = new Image();
      img.src = `assets/${anim.folder}/${anim.prefix}${padIndex}.png`;
      img.onload = () => {
        if (!lastValidSpriteFrame) lastValidSpriteFrame = img;
      };
      anim.frames.push(img);
    }
  }
});

const catAnimController = {
  currentAnim: 'run',
  frameIndex: 0,
  tickCount: 0,

  set(animKey) {
    if (this.currentAnim !== animKey) {
      this.currentAnim = animKey;
      this.frameIndex = 0;
      this.tickCount = 0;
    }
  },

  update() {
    const anim = animations[this.currentAnim];
    if (!anim || anim.frames.length === 0) return;

    this.tickCount++;
    if (this.tickCount >= anim.speed) {
      this.tickCount = 0;
      const totalFrames = anim.frames.length;
      if (this.frameIndex < totalFrames - 1) {
        this.frameIndex++;
      } else if (anim.loop) {
        this.frameIndex = 0;
      }
    }
  },

  getFrame() {
    const anim = animations[this.currentAnim];
    if (!anim || anim.frames.length === 0) return lastValidSpriteFrame;
    const frame = anim.frames[this.frameIndex];
    if (frame && frame.complete && frame.naturalWidth > 0) {
      lastValidSpriteFrame = frame;
      return frame;
    }
    return lastValidSpriteFrame;
  }
};

// -------------------------------------------------------------
// Adaptive Player Physics State
// -------------------------------------------------------------
const player = {
  x: 80,
  y: 0,
  width: 38,
  height: 52,
  baseWidth: 38,
  baseHeight: 52,
  renderSize: 76,
  vy: 0,
  baseSpeed: 5.2,
  speed: 5.2,
  jumpStrength: -12.4,
  gravity: 0.58,
  grounded: false,
  sliding: false,
  slideTimer: 0,
  extraJumps: 1,
  maxExtraJumps: 1,
  isWallRunning: false,
  wallSlideSpeed: 1.8,

  comboScore: 0,
  comboMultiplier: 1,
  comboTimer: 0,
  hyperRushTimer: 0
};

function calibratePlayerScale() {
  if (isMobile) {
    player.baseWidth = 36;
    player.baseHeight = 50;
    player.renderSize = 74;
    player.x = Math.max(35, canvas.width * 0.12);
    player.baseSpeed = Math.max(4.6, Math.min(6.0, canvas.width * 0.008));
    player.jumpStrength = -12.0;
    player.gravity = 0.55;
  } else {
    player.baseWidth = 46;
    player.baseHeight = 60;
    player.renderSize = 104;
    player.x = 120;
    player.baseSpeed = 7.6;
    player.jumpStrength = -13.5;
    player.gravity = 0.65;
  }
  player.width = player.baseWidth;
  player.height = player.sliding ? player.baseHeight / 2 : player.baseHeight;
}

// World State
let buildings = [];
let obstacles = [];
let shurikens = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('ninja_cat_high_score') || '0', 10);
let gameOver = false;
let gameOverTime = 0;
let isNewHighScore = false;
let finalDistanceMeters = 0;
let finalCityName = 'TOKYO';

// -------------------------------------------------------------
// Parallax Background
// -------------------------------------------------------------
const parallax = {
  stars: [],
  clouds: [],
  farBuildings: [],
  midBuildings: [],
  landmarkX: 0
};

function initParallax() {
  parallax.landmarkX = canvas.width * 0.45;
  parallax.farBuildings = [];
  parallax.midBuildings = [];
  parallax.clouds = [];
  parallax.stars = [];

  for (let i = 0; i < 65; i++) {
    parallax.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.5),
      size: Math.random() * 2 + 0.8,
      blinkOffset: Math.random() * Math.PI * 2
    });
  }

  for (let i = 0; i < 6; i++) {
    parallax.clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 120,
      scale: 0.6 + Math.random() * 0.5,
      speedFactor: 0.04 + Math.random() * 0.04
    });
  }

  let curX = -50;
  while (curX < canvas.width + 400) {
    const w = 90 + Math.random() * 90;
    const h = (isMobile ? canvas.height * 0.55 : 260) + Math.random() * 140;
    parallax.farBuildings.push({ x: curX, y: canvas.height - h, w, h });
    curX += w + 24;
  }

  curX = -50;
  while (curX < canvas.width + 400) {
    const w = 70 + Math.random() * 70;
    const h = (isMobile ? canvas.height * 0.45 : 180) + Math.random() * 120;
    parallax.midBuildings.push({ x: curX, y: canvas.height - h, w, h });
    curX += w + 35;
  }
}

function updateParallax() {
  const baseSpeed = player.speed;

  parallax.landmarkX -= baseSpeed * 0.08;
  if (parallax.landmarkX < -400) parallax.landmarkX = canvas.width + 200;

  for (let b of parallax.farBuildings) b.x -= baseSpeed * 0.15;
  if (parallax.farBuildings.length > 0 && parallax.farBuildings[0].x + parallax.farBuildings[0].w < -50) {
    const last = parallax.farBuildings[parallax.farBuildings.length - 1];
    const w = 90 + Math.random() * 90;
    const h = (isMobile ? canvas.height * 0.55 : 260) + Math.random() * 140;
    parallax.farBuildings.shift();
    parallax.farBuildings.push({ x: last.x + last.w + 24, y: canvas.height - h, w, h });
  }

  for (let b of parallax.midBuildings) b.x -= baseSpeed * 0.45;
  if (parallax.midBuildings.length > 0 && parallax.midBuildings[0].x + parallax.midBuildings[0].w < -50) {
    const last = parallax.midBuildings[parallax.midBuildings.length - 1];
    const w = 70 + Math.random() * 70;
    const h = (isMobile ? canvas.height * 0.45 : 180) + Math.random() * 120;
    parallax.midBuildings.shift();
    parallax.midBuildings.push({ x: last.x + last.w + 35, y: canvas.height - h, w, h });
  }

  for (let c of parallax.clouds) {
    c.x -= baseSpeed * c.speedFactor;
    if (c.x + 200 * c.scale < 0) {
      c.x = canvas.width + 80;
      c.y = 30 + Math.random() * 120;
    }
  }
}

function drawPuffyCloud(ctx, x, y, scale, fillColor) {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(x, y, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y - 14 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.arc(x + 52 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
  ctx.arc(x + 75 * scale, y + 2 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 36 * scale, y + 10 * scale, 26 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// -------------------------------------------------------------
// Stable Building Generation (Elevated Mid-Way on Mobile)
// -------------------------------------------------------------
function generateBuildingData(x, y, w, h, style) {
  const subType = Math.random() > 0.5 ? 0 : 1;
  const windows = [];

  const stepX = style === 'cyber_tokyo' ? 34 : (style === 'haussmann_paris' ? 44 : 38);
  const stepY = style === 'cyber_tokyo' ? 42 : (style === 'haussmann_paris' ? 50 : 46);

  for (let relX = 20; relX < w - 20; relX += stepX) {
    for (let relY = 24; relY < h; relY += stepY) {
      windows.push({
        relX,
        relY,
        isLit: Math.random() < 0.45
      });
    }
  }

  return { x, y, w, h, style, subType, windows };
}

function initWorld() {
  calibratePlayerScale();
  buildings = [];
  obstacles = [];
  shurikens = [];
  particles = [];
  floatingTexts = [];
  score = 0;
  worldCycleTime = 0.85;
  gameOver = false;
  isNewHighScore = false;

  player.speed = player.baseSpeed;
  player.comboScore = 0;
  player.comboMultiplier = 1;
  player.comboTimer = 0;
  player.hyperRushTimer = 0;

  activeCitySequence = shuffleCities();
  currentCityIndex = 0;
  cityBannerTimer = 180;
  catAnimController.set('run');

  initParallax();

  const startRooftopY = isMobile ? canvas.height * 0.55 : canvas.height - 200;
  buildings.push(generateBuildingData(0, startRooftopY, 700, canvas.height - startRooftopY, activeCitySequence[0].architecture));

  player.y = startRooftopY - player.height;
  player.vy = 0;
  player.grounded = true;
  player.extraJumps = player.maxExtraJumps;

  while (buildings[buildings.length - 1].x < canvas.width + 800) {
    spawnNextBuilding();
  }
}

function spawnNextBuilding() {
  const lastBuilding = buildings[buildings.length - 1];

  const minGap = isMobile ? Math.max(65, canvas.width * 0.14) : 120;
  const maxExtra = isMobile ? 55 : 130;
  const gap = minGap + Math.random() * maxExtra;
  const nextX = lastBuilding.x + lastBuilding.w + gap;

  const baseGround = isMobile ? canvas.height * 0.56 : canvas.height - 210;
  const heightOffset = (Math.random() - 0.5) * (isMobile ? 70 : 130);
  const nextY = Math.min(canvas.height - 110, Math.max(isMobile ? canvas.height * 0.44 : canvas.height - 340, baseGround + heightOffset));
  const nextW = (isMobile ? 320 : 460) + Math.random() * 320;
  const nextH = canvas.height - nextY;

  const { city } = getActiveCity(score);
  buildings.push(generateBuildingData(nextX, nextY, nextW, nextH, city.architecture));

  // Shurikens Arc
  const arcCount = isMobile ? 3 : 4;
  for (let i = 0; i < arcCount; i++) {
    const fraction = (i + 1) / (arcCount + 1);
    const coinX = lastBuilding.x + lastBuilding.w + gap * fraction;
    const arcHeight = Math.sin(fraction * Math.PI) * (isMobile ? 45 : 75);
    const coinY = Math.min(lastBuilding.y, nextY) - (isMobile ? 35 : 50) - arcHeight;
    shurikens.push({ x: coinX, y: coinY, w: isMobile ? 18 : 22, h: isMobile ? 18 : 22, collected: false });
  }

  // Authentic Urban Rooftop Obstacle Spawns
  if (nextW > 380) {
    const roll = Math.random();
    if (roll < 0.38) {
      // 1. HVAC Compressor / Duct (Low / Jump-Over)
      const vSize = isMobile ? 32 : 40;
      obstacles.push({ x: nextX + nextW * 0.5, y: nextY - vSize, w: vSize * 1.3, h: vSize, type: 'hvac' });
    } else if (roll < 0.68) {
      // 2. Overhead Steam Pipe Bridge (High / Duck-Under & Land-On)
      const pipeW = isMobile ? 86 : 108;
      const pipeH = isMobile ? 28 : 34;
      const clearanceY = isMobile ? 54 : 64;
      obstacles.push({ x: nextX + nextW * 0.45, y: nextY - clearanceY, w: pipeW, h: pipeH, type: 'pipe' });
    } else {
      // 3. Brick Chimney & Fire-Parapet (Tall / Wall-Run)
      const wallW = isMobile ? 36 : 44;
      const wallH = isMobile ? 120 : 155;
      obstacles.push({ x: nextX + nextW * 0.6, y: nextY - wallH, w: wallW, h: wallH, type: 'chimney' });
    }
  }
}

// -------------------------------------------------------------
// Input Handlers: Refined Taps & Swipes
// -------------------------------------------------------------
function performJump() {
  AudioEngine.init();

  if (player.grounded) {
    player.vy = player.jumpStrength;
    player.grounded = false;
    catAnimController.set('slash');
    AudioEngine.playJump();
    spawnParticles(player.x + player.width / 2, player.y + player.height, 6, '#cbd5e1', 1);
  } else if (player.isWallRunning) {
    player.vy = player.jumpStrength * 0.95;
    player.isWallRunning = false;
    player.extraJumps = player.maxExtraJumps;
    catAnimController.set('slash');
    AudioEngine.playWallKick();
    spawnParticles(player.x, player.y + player.height / 2, 8, '#38bdf8', 1.5, 'star');
    addCombo(1);
    addFloatingText('WALL KICK!', player.x + 20, player.y - 10, '#38bdf8');
  } else if (player.extraJumps > 0) {
    player.vy = player.jumpStrength * 0.85;
    player.extraJumps--;
    catAnimController.set('slash');
    AudioEngine.playSlash();
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, 8, '#c084fc', 1.2, 'star');
  }
}

function performSlideOrFastFall() {
  AudioEngine.init();

  if (player.grounded && !player.sliding) {
    player.sliding = true;
    player.slideTimer = 32;
    player.height = player.baseHeight / 2;
    player.y += player.baseHeight / 2;
    catAnimController.set('slide');
    AudioEngine.playSlide();
    spawnParticles(player.x, player.y + player.height, 5, 'rgba(255,255,255,0.7)', 1.2);
  } else if (!player.grounded) {
    player.vy = Math.max(player.vy + 11, 15);
    AudioEngine.playSlide();
    spawnParticles(player.x + player.width / 2, player.y, 4, '#38bdf8', 1);
  }
}

function addCombo(amount = 1) {
  player.comboScore += amount;
  player.comboTimer = 130;

  if (player.comboScore >= 20 && player.hyperRushTimer <= 0) {
    player.hyperRushTimer = 260;
    AudioEngine.playHyper();
    addFloatingText('⚡ HYPER RUSH! ⚡', canvas.width / 2, canvas.height / 2 - 60, '#fde047');
  } else if (player.comboScore >= 12) {
    player.comboMultiplier = 4;
  } else if (player.comboScore >= 6) {
    player.comboMultiplier = 2;
  }
}

// Keyboard Listeners (with input debounce on game over)
window.addEventListener('keydown', (e) => {
  if (gameOver) {
    if (Date.now() - gameOverTime > 350) initWorld();
    return;
  }
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') performJump();
  if (e.code === 'ArrowDown' || e.code === 'KeyS') performSlideOrFastFall();
});

// Refined Multi-Touch & Swipe Listener
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

window.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameOver) {
    if (Date.now() - gameOverTime > 350) initWorld();
    return;
  }

  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartTime = Date.now();
}, { passive: false });

window.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (gameOver) return;

  const t = e.changedTouches[0];
  const deltaX = t.clientX - touchStartX;
  const deltaY = t.clientY - touchStartY;
  const deltaTime = Date.now() - touchStartTime;

  if (Math.abs(deltaY) > 35 && deltaTime < 350) {
    if (deltaY < 0) {
      performJump();
    } else {
      performSlideOrFastFall();
    }
    return;
  }

  if (t.clientX < window.innerWidth / 2) {
    performSlideOrFastFall();
  } else {
    performJump();
  }
}, { passive: false });

// -------------------------------------------------------------
// Update Loop
// -------------------------------------------------------------
function update() {
  if (gameOver) {
    catAnimController.set('die');
    catAnimController.update();
    return;
  }

  const speedRamp = isMobile ? Math.min(2.5, score * 0.002) : Math.min(4.5, score * 0.004);
  const hyperBoost = player.hyperRushTimer > 0 ? (player.hyperRushTimer / 260) * 1.8 : 0;
  const targetSpeed = player.baseSpeed + speedRamp + hyperBoost;
  player.speed += (targetSpeed - player.speed) * 0.04;

  if (player.hyperRushTimer > 0) {
    player.hyperRushTimer--;
    spawnParticles(player.x, player.y + Math.random() * player.height, 2, '#38bdf8', 1, 'star');
  }

  if (player.comboTimer > 0) {
    player.comboTimer--;
  } else {
    player.comboScore = 0;
    player.comboMultiplier = 1;
  }

  worldCycleTime = (worldCycleTime + CYCLE_SPEED) % 1;

  const { index: newCityIdx } = getActiveCity(score);
  if (newCityIdx !== currentCityIndex) {
    currentCityIndex = newCityIdx;
    cityBannerTimer = 180;
    parallax.landmarkX = canvas.width + 100;
  }
  if (cityBannerTimer > 0) cityBannerTimer--;

  updateParallax();

  if (player.isWallRunning) {
    catAnimController.set('wall');
  } else if (player.sliding) {
    catAnimController.set('slide');
  } else if (!player.grounded) {
    catAnimController.set('slash');
  } else {
    catAnimController.set('run');
  }

  catAnimController.update();

  const prevBottom = player.y + player.height;

  if (player.isWallRunning) {
    player.vy = player.wallSlideSpeed;
  } else {
    player.vy += player.gravity;
  }
  player.y += player.vy;

  const currentBottom = player.y + player.height;

  if (player.sliding) {
    player.slideTimer--;
    if (player.slideTimer <= 0) {
      player.sliding = false;
      player.y -= player.baseHeight / 2;
      player.height = player.baseHeight;
      catAnimController.set('run');
    }
  }

  for (let b of buildings) b.x -= player.speed;
  for (let obs of obstacles) obs.x -= player.speed;
  for (let sh of shurikens) sh.x -= player.speed;

  let foundGround = false;
  let touchingWall = false;

  for (let b of buildings) {
    const withinHorizontalBounds = (player.x + player.width > b.x) && (player.x < b.x + b.w);

    if (withinHorizontalBounds) {
      if (player.vy >= 0 && prevBottom <= b.y + 14 && currentBottom >= b.y) {
        player.y = b.y - player.height;
        player.vy = 0;
        player.grounded = true;
        player.extraJumps = player.maxExtraJumps;
        player.isWallRunning = false;
        foundGround = true;

        if (prevBottom < b.y) {
          spawnParticles(player.x + player.width / 2, b.y, 4, '#94a3b8');
        }
        break;
      }

      // Ledge Forgiveness / Mantle
      if (player.vy > 0 && currentBottom >= b.y && currentBottom <= b.y + 24 && player.x + player.width >= b.x && player.x < b.x + 24) {
        player.y = b.y - player.height;
        player.vy = 0;
        player.grounded = true;
        player.extraJumps = player.maxExtraJumps;
        foundGround = true;
        addFloatingText('MANTLE!', player.x, player.y - 12, '#34d399');
        break;
      }

      // Front wall impact
      if (currentBottom > b.y + 12 && player.x + player.width >= b.x && player.x < b.x + 20) {
        if (player.hyperRushTimer > 0) {
          player.y = b.y - player.height;
          foundGround = true;
        } else {
          killPlayer();
        }
      }
    }
  }

  // Shurikens
  for (let sh of shurikens) {
    if (!sh.collected && player.x < sh.x + sh.w && player.x + player.width > sh.x && player.y < sh.y + sh.h && player.y + player.height > sh.y) {
      sh.collected = true;
      score += 15 * player.comboMultiplier;
      AudioEngine.playCoin();
      spawnParticles(sh.x + 10, sh.y + 10, 8, '#fef08a', 1.5, 'star');
      addCombo(1);
      addFloatingText(`+${15 * player.comboMultiplier}`, sh.x, sh.y - 10, '#fde047');
    }
  }

  // -----------------------------------------------------------
  // Obstacles Collisions, Pipe Platforming & Wall Run
  // -----------------------------------------------------------
  for (let obs of obstacles) {
    const collidesX = player.x + player.width > obs.x + 4 && player.x < obs.x + obs.w - 4;

    if (collidesX) {
      // 1. PIPE AS A SOLID PLATFORM:
      if (obs.type === 'pipe') {
        const pipeLedgeY = obs.y + 8; // Top rail level

        // Check if player is landing on top OR already walking across it
        const isLandingOnTop = (player.vy >= 0 && prevBottom <= pipeLedgeY + 14 && currentBottom >= pipeLedgeY - 6);
        const isAlreadyOnTop = (Math.abs((player.y + player.height) - pipeLedgeY) <= 8 && player.vy >= 0);

        if (isLandingOnTop || isAlreadyOnTop) {
          player.y = pipeLedgeY - player.height;
          player.vy = 0;
          player.grounded = true;
          player.extraJumps = player.maxExtraJumps;
          foundGround = true;
          continue; // Safely skip lethal collision check below
        }
      }

      // 2. STANDARD HAZARD COLLISION:
      // Pipes only kill if your head/torso hits from underneath or the front
      const hazardTop = obs.type === 'pipe' ? obs.y + 10 : obs.y;
      const collidesY = player.y < obs.y + obs.h && player.y + player.height > hazardTop;

      if (collidesY) {
        if (player.hyperRushTimer > 0) {
          obs.x = -999;
          score += 50;
          AudioEngine.playCrash();
          spawnParticles(player.x + 30, player.y + 20, 16, '#38bdf8', 2);
          addFloatingText('+50 SMASH!', player.x + 30, player.y - 10, '#38bdf8');
          continue;
        }

        // Wall-run against the brick chimney stack
        if (obs.type === 'chimney' && !player.grounded && player.y + player.height < obs.y + obs.h) {
          touchingWall = true;
          player.isWallRunning = true;
        } else {
          killPlayer();
        }
      }
    }
  }

  if (!foundGround) player.grounded = false;
  if (player.isWallRunning && !touchingWall) player.isWallRunning = false;

  if (player.y > canvas.height + 60) killPlayer();

  if (buildings.length > 0 && buildings[0].x + buildings[0].w < -100) {
    buildings.shift();
    score += 20 * player.comboMultiplier;
  }
  obstacles = obstacles.filter((obs) => obs.x + obs.w > -100);
  shurikens = shurikens.filter((sh) => sh.x + sh.w > -100);

  if (buildings[buildings.length - 1].x < canvas.width + 600) {
    spawnNextBuilding();
  }
}

function killPlayer() {
  if (gameOver) return;
  gameOver = true;
  gameOverTime = Date.now();
  AudioEngine.playCrash();
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2, 25, '#f43f5e', 2.5);

  finalDistanceMeters = Math.floor(score * 1.4);
  const { city } = getActiveCity(score);
  finalCityName = city.name;

  if (score > highScore) {
    highScore = score;
    isNewHighScore = true;
    localStorage.setItem('ninja_cat_high_score', highScore.toString());
    if (window.YTPlayables && window.YTPlayables.saveData) {
      window.YTPlayables.saveData(JSON.stringify({ highScore }));
    }
  } else {
    isNewHighScore = false;
  }
}

// -------------------------------------------------------------
// Real Landmark Renderers
// -------------------------------------------------------------
function drawLandmark(ctx, landmarkType, lx, groundY) {
  ctx.save();
  ctx.fillStyle = '#060a17';

  if (landmarkType === 'tokyo_tower') {
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

    const blink = Math.sin(Date.now() * 0.008) > 0;
    ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(lx + 45, groundY - 282, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (landmarkType === 'eiffel_tower') {
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

  } else if (landmarkType === 'empire_state') {
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
  }

  ctx.restore();
}

// -------------------------------------------------------------
// Diverse Architectural Building Style Renderers
// -------------------------------------------------------------
function drawStyledBuilding(ctx, b, env) {
  const { x, y, w, h, style, subType, windows } = b;
  const isDay = env.isDay;

  if (style === 'cyber_tokyo') {
    const baseColor = isDay ? (subType === 0 ? '#1e293b' : '#0f172a') : (subType === 0 ? '#0b1120' : '#020617');
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = subType === 0 ? '#38bdf8' : '#818cf8';
    ctx.fillRect(x, y, w, 5);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let lx = x + 16; lx < x + w; lx += 32) {
      ctx.beginPath();
      ctx.moveTo(lx, y + 6);
      ctx.lineTo(lx, y + h);
      ctx.stroke();
    }

    for (let win of windows) {
      const wx = x + win.relX;
      const wy = y + win.relY;
      if (wy > y + h - 10) continue;

      if (win.isLit) {
        ctx.fillStyle = isDay ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.75)';
      } else {
        ctx.fillStyle = isDay ? '#334155' : '#111827';
      }
      ctx.fillRect(wx, wy, 15, 20);
    }

  } else if (style === 'haussmann_paris') {
    ctx.fillStyle = isDay ? (subType === 0 ? '#f1f5f9' : '#e2e8f0') : (subType === 0 ? '#64748b' : '#475569');
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, 18);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y + 15, w, 3);
    for (let rx = x + 4; rx < x + w - 4; rx += 7) {
      ctx.fillRect(rx, y + 10, 2, 7);
    }

    for (let win of windows) {
      const wx = x + win.relX;
      const wy = y + win.relY;
      if (wy > y + h - 12) continue;

      ctx.fillStyle = isDay ? '#cbd5e1' : '#334155';
      ctx.fillRect(wx - 2, wy - 3, 20, 28);

      if (win.isLit) {
        ctx.fillStyle = isDay ? '#fef08a' : '#f59e0b';
      } else {
        ctx.fillStyle = isDay ? '#94a3b8' : '#1e293b';
      }
      ctx.fillRect(wx, wy, 16, 24);
    }

  } else if (style === 'tenement_nyc') {
    const masonryColor = subType === 0 
      ? (isDay ? '#9a3412' : '#571c0d')
      : (isDay ? '#78350f' : '#451a03');
    ctx.fillStyle = masonryColor;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = isDay ? '#e7e5e4' : '#78716c';
    ctx.fillRect(x - 2, y, w + 4, 10);
    ctx.fillStyle = isDay ? '#a8a29e' : '#44403c';
    ctx.fillRect(x, y + 10, w, 4);

    for (let win of windows) {
      const wx = x + win.relX;
      const wy = y + win.relY;
      if (wy > y + h - 14) continue;

      ctx.fillStyle = isDay ? '#d6d3d1' : '#57534e';
      ctx.fillRect(wx - 2, wy - 4, 18, 3);

      if (win.isLit) {
        ctx.fillStyle = isDay ? '#fef08a' : '#fbbf24';
      } else {
        ctx.fillStyle = isDay ? '#1c1917' : '#0c0a09';
      }
      ctx.fillRect(wx, wy, 14, 20);

      ctx.fillStyle = isDay ? '#78716c' : '#292524';
      ctx.fillRect(wx + 6, wy, 2, 20);
      ctx.fillRect(wx, wy + 9, 14, 2);
    }
  }
}

// -------------------------------------------------------------
// Authentic Urban Rooftop Obstacle Renderers
// -------------------------------------------------------------

// 1. Low Vault: Rooftop HVAC Unit with Fan Grill & Conduit Pipes
function drawHvacUnit(ctx, obs) {
  const { x, y, w, h } = obs;

  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#0f172a';
  for (let ly = y + 8; ly < y + h - 6; ly += 6) {
    ctx.fillRect(x + 6, ly, w * 0.45, 2.5);
  }

  const fanRadius = Math.min(w * 0.22, h * 0.35);
  const fanCx = x + w - fanRadius - 8;
  const fanCy = y + h / 2;

  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(fanCx, fanCy, fanRadius, 0, Math.PI * 2);
  ctx.fill();

  const spin = Date.now() * 0.018;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const angle = spin + (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(fanCx, fanCy);
    ctx.lineTo(fanCx + Math.cos(angle) * fanRadius, fanCy + Math.sin(angle) * fanRadius);
    ctx.stroke();
  }

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x, y, w, 4);
}

// 2. High Duck & Platform: Industrial Steam Pipe Span with Release Vents
function drawSteamPipe(ctx, obs) {
  const { x, y, w, h } = obs;

  // Vertical support pillars
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y + 2, 8, h + 24);
  ctx.fillRect(x + w - 8, y + 2, 8, h + 24);

  // Base plates & bolts
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 2, y + h + 20, 12, 6);
  ctx.fillRect(x + w - 10, y + h + 20, 12, 6);

  // Horizontal conduit bar
  const pipeY = y + 8;
  const pipeH = 14;

  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 2, pipeY, w - 4, pipeH);

  // Highlight ridge
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 2, pipeY + 2, w - 4, 3);

  // Shadow bottom
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 2, pipeY + pipeH - 3, w - 4, 3);

  // Joining collars
  const collarSpacing = (w - 24) / 3;
  ctx.fillStyle = '#e2e8f0';
  for (let i = 1; i <= 2; i++) {
    const cx = x + 12 + collarSpacing * i;
    ctx.fillRect(cx - 3, pipeY - 2, 6, pipeH + 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 1, pipeY, 2, pipeH);
    ctx.fillStyle = '#e2e8f0';
  }

  // Hazard stripes
  const stripeW = 32;
  const stripeX = x + (w - stripeW) / 2;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(stripeX, pipeY, stripeW, pipeH);
  ctx.fillStyle = '#0f172a';
  for (let sx = stripeX + 4; sx < stripeX + stripeW; sx += 8) {
    ctx.beginPath();
    ctx.moveTo(sx, pipeY + pipeH);
    ctx.lineTo(sx + 4, pipeY);
    ctx.lineTo(sx + 7, pipeY);
    ctx.lineTo(sx + 3, pipeY + pipeH);
    ctx.closePath();
    ctx.fill();
  }

  // Venting steam plume
  const steamPulse = (Math.sin(Date.now() * 0.008) + 1) / 2;
  const valveX = x + w * 0.32;
  const valveY = pipeY + pipeH;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(valveX - 2, valveY, 4, 5);

  ctx.save();
  ctx.fillStyle = `rgba(241, 245, 249, ${0.25 + steamPulse * 0.35})`;
  ctx.beginPath();
  ctx.arc(valveX, valveY + 7 + steamPulse * 4, 6 + steamPulse * 5, 0, Math.PI * 2);
  ctx.arc(valveX + 6, valveY + 11 + steamPulse * 6, 8 + steamPulse * 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 3. Tall Wall-Run: Rooftop Brick Chimney Stack with Concrete Coping
function drawChimneyStack(ctx, obs) {
  const { x, y, w, h } = obs;

  // Red masonry brick
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(x, y, w, h);

  // Mortar lines
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  for (let my = y + 12; my < y + h; my += 16) {
    ctx.beginPath();
    ctx.moveTo(x, my);
    ctx.lineTo(x + w, my);
    ctx.stroke();
  }

  // Concrete coping ledge
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x - 3, y, w + 6, 8);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x - 1, y + 8, w + 2, 4);

  // Ladder rungs (visual cue for wall-running)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  for (let ry = y + 20; ry < y + h - 10; ry += 18) {
    ctx.beginPath();
    ctx.moveTo(x + 6, ry);
    ctx.lineTo(x + w - 6, ry);
    ctx.stroke();
  }

  // Clay pots
  const potW = (w - 8) / 2;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 2, y - 10, potW, 10);
  ctx.fillRect(x + potW + 6, y - 10, potW, 10);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 4, y - 12, potW - 4, 3);
  ctx.fillRect(x + potW + 8, y - 12, potW - 4, 3);
}

// -------------------------------------------------------------
// Collectibles Renderer
// -------------------------------------------------------------
function drawGoldenShuriken(ctx, sh) {
  if (sh.collected) return;
  const { x, y, w, h } = sh;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const spin = Date.now() * 0.008;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);

  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 7;
  ctx.fillStyle = '#fef08a';

  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -w / 2);
    ctx.lineTo(w / 5, -w / 5);
    ctx.lineTo(0, 0);
    ctx.lineTo(-w / 5, -w / 5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// -------------------------------------------------------------
// Render Loop
// -------------------------------------------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const env = getEnvironmentState();
  const activeCity = activeCitySequence[currentCityIndex] || BASE_CITIES[0];

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, env.skyTop);
  skyGrad.addColorStop(0.55, env.skyMid);
  skyGrad.addColorStop(1, env.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Stars
  if (env.starsAlpha > 0) {
    ctx.save();
    for (let s of parallax.stars) {
      const flicker = (Math.sin(Date.now() * 0.005 + s.blinkOffset) + 1) / 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${env.starsAlpha * (0.3 + 0.7 * flicker)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Celestial Body
  const celestialAngle = (worldCycleTime * Math.PI * 2) - Math.PI / 2;
  const celestialX = canvas.width / 2 + Math.cos(celestialAngle) * (canvas.width * 0.45);
  const celestialY = canvas.height * 0.6 + Math.sin(celestialAngle) * (canvas.height * 0.44);

  ctx.save();
  const glowGrad = ctx.createRadialGradient(celestialX, celestialY, 12, celestialX, celestialY, 80);
  glowGrad.addColorStop(0, env.sunMoonGlow);
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(celestialX, celestialY, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = env.bodyColor;
  ctx.beginPath();
  ctx.arc(celestialX, celestialY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Clouds
  for (let c of parallax.clouds) {
    drawPuffyCloud(ctx, c.x, c.y, c.scale, env.cloudColor);
  }

  // 5. Landmark Layer
  drawLandmark(ctx, activeCity.landmark, parallax.landmarkX, canvas.height - (isMobile ? 180 : 100));

  // 6. Parallax Skyline Layers
  ctx.fillStyle = env.isDay ? '#334155' : '#0b1329';
  for (let b of parallax.farBuildings) ctx.fillRect(b.x, b.y, b.w, b.h);

  for (let b of parallax.midBuildings) {
    ctx.fillStyle = env.isDay ? '#475569' : '#111827';
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = env.isDay ? 'rgba(254, 240, 138, 0.6)' : 'rgba(253, 224, 71, 0.35)';
    for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 18) {
      for (let wy = b.y + 14; wy < canvas.height; wy += 28) {
        if ((wx + wy) % 5 === 0) ctx.fillRect(wx, wy, 6, 8);
      }
    }
  }

  // 7. Diverse Rooftops
  for (let b of buildings) {
    drawStyledBuilding(ctx, b, env);
  }

  // 8. Low Rooftop Atmospheric Fog
  const fogHeight = isMobile ? 180 : 220;
  const fogGrad = ctx.createLinearGradient(0, canvas.height - fogHeight, 0, canvas.height);
  fogGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  fogGrad.addColorStop(0.5, env.fogColor);
  fogGrad.addColorStop(1, env.fogColor);
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, canvas.height - fogHeight, canvas.width, fogHeight);

  // 9. Collectibles
  for (let sh of shurikens) {
    drawGoldenShuriken(ctx, sh);
  }

  // 10. Rooftop Obstacles
  for (let obs of obstacles) {
    if (obs.type === 'hvac') drawHvacUnit(ctx, obs);
    else if (obs.type === 'pipe') drawSteamPipe(ctx, obs);
    else if (obs.type === 'chimney') drawChimneyStack(ctx, obs);
  }

  // 11. Particles
  updateAndDrawParticles();

  // 12. Ninja Cat Sprite Renderer (ZERO FLICKER)
  ctx.save();
  if (player.hyperRushTimer > 0) {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
  }

  const currentFrameImg = catAnimController.getFrame();
  if (currentFrameImg && currentFrameImg.complete && currentFrameImg.naturalWidth > 0) {
    const size = player.renderSize;
    const drawX = player.x + (player.width - size) / 2;
    const drawY = player.y + player.height - size + 4;

    if (player.isWallRunning) {
      ctx.translate(drawX + size, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(currentFrameImg, 0, 0, size, size);
    } else {
      ctx.drawImage(currentFrameImg, drawX, drawY, size, size);
    }
  }
  ctx.restore();

  // 13. Floating Text
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 1.1;
    ft.life--;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = ft.life / ft.maxLife;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 15px monospace';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // 14. Responsive Cyberpunk HUD
  ctx.save();
  const hudX = isMobile ? 12 : 20;
  const hudY = isMobile ? 10 : 16;
  const hudW = Math.min(680, canvas.width - (isMobile ? 24 : 40));
  const hudH = isMobile ? 44 : 54;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 10);
  ctx.fill();

  ctx.strokeStyle = player.hyperRushTimer > 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Score
  ctx.fillStyle = '#f8fafc';
  ctx.font = isMobile ? 'bold 16px monospace' : 'bold 20px monospace';
  ctx.fillText(score.toString().padStart(5, '0'), hudX + 14, hudY + (isMobile ? 22 : 26));

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SCORE', hudX + 14, hudY + (isMobile ? 36 : 42));

  // High Score & Speed
  ctx.fillStyle = '#facc15';
  ctx.font = isMobile ? 'bold 11px monospace' : 'bold 12px monospace';
  ctx.fillText(`👑 ${highScore}`, hudX + (isMobile ? 78 : 105), hudY + (isMobile ? 22 : 26));

  const kmh = Math.round(player.speed * 4.2);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${kmh} KM/H`, hudX + (isMobile ? 78 : 105), hudY + (isMobile ? 36 : 42));

  // Flow / Multiplier Bar
  const barX = hudX + (isMobile ? 150 : 225);
  const barY = hudY + (isMobile ? 22 : 26);
  const barW = Math.min(isMobile ? 95 : 220, hudW - (isMobile ? 225 : 360));
  const barH = 8;

  const isHyper = player.hyperRushTimer > 0;
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = isHyper ? '#38bdf8' : (player.comboMultiplier > 1 ? '#facc15' : '#94a3b8');
  ctx.fillText(isHyper ? '⚡ HYPER' : `FLOW: ${player.comboMultiplier}x`, barX, hudY + (isMobile ? 15 : 18));

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  let fillFraction = isHyper 
    ? (player.hyperRushTimer / 260) 
    : Math.min(1, (player.comboScore % 6) / 6);
  if (player.comboScore >= 20 && !isHyper) fillFraction = 1;

  const activeFillW = Math.max(0, barW * fillFraction);
  if (activeFillW > 0) {
    ctx.fillStyle = isHyper ? '#38bdf8' : (player.comboMultiplier > 1 ? '#facc15' : '#10b981');
    ctx.beginPath();
    ctx.roundRect(barX, barY, activeFillW, barH, 4);
    ctx.fill();
  }

  // Air Jump Diamonds
  const jumpPipsX = hudX + hudW - (isMobile ? 55 : 90);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('JUMP', jumpPipsX, hudY + (isMobile ? 15 : 18));

  function drawDiamond(x, y, size, filled) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = filled ? '#10b981' : '#334155';
    if (filled) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 6;
    }
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  drawDiamond(jumpPipsX + 12, hudY + (isMobile ? 26 : 32), 8, player.grounded || player.extraJumps > 0);
  drawDiamond(jumpPipsX + 28, hudY + (isMobile ? 26 : 32), 8, player.extraJumps > 0);
  ctx.restore();

  // 15. Mobile Touch Feedback Indicator
  if (isMobile && !gameOver) {
    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = player.sliding ? 'rgba(56, 189, 248, 0.28)' : 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(12, canvas.height - 48, canvas.width / 2 - 18, 38, 8);
    ctx.fill();
    ctx.fillStyle = player.sliding ? '#38bdf8' : 'rgba(255, 255, 255, 0.35)';
    ctx.fillText('▼ SLIDE', canvas.width / 4, canvas.height - 24);

    const isJumping = !player.grounded;
    ctx.fillStyle = isJumping ? 'rgba(52, 211, 153, 0.28)' : 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 + 6, canvas.height - 48, canvas.width / 2 - 18, 38, 8);
    ctx.fill();
    ctx.fillStyle = isJumping ? '#34d399' : 'rgba(255, 255, 255, 0.35)';
    ctx.fillText('▲ JUMP', (canvas.width * 0.75), canvas.height - 24);
    ctx.restore();
  }

  // 16. City Announcement Card
  if (cityBannerTimer > 0) {
    const bannerAlpha = Math.min(1, cityBannerTimer / 40);
    ctx.save();
    ctx.fillStyle = `rgba(15, 23, 42, ${0.85 * bannerAlpha})`;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 140, isMobile ? 65 : 84, 280, 36, 8);
    ctx.fill();
    ctx.strokeStyle = activeCity.neonAccent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ENTERING ${activeCity.name}`, canvas.width / 2, isMobile ? 88 : 107);
    ctx.textAlign = 'start';
    ctx.restore();
  }

  // -----------------------------------------------------------
  // 17. Polished Cyberpunk Mission Summary (Game Over)
  // -----------------------------------------------------------
  if (gameOver) {
    ctx.save();

    // Subtle dark vignette background
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Responsive Modal Card Dimensions
    const cardW = Math.min(380, canvas.width - 36);
    const cardH = isMobile ? 320 : 340;
    const cardX = (canvas.width - cardW) / 2;
    const cardY = (canvas.height - cardH) / 2;

    // Card Glassmorphic Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    ctx.fill();

    // Subtle Neon Border
    ctx.strokeStyle = isNewHighScore ? '#f59e0b' : 'rgba(244, 63, 94, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header Glow Bar
    ctx.fillStyle = isNewHighScore ? '#f59e0b' : '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(cardX + 24, cardY, cardW - 48, 3, 2);
    ctx.fill();

    ctx.textAlign = 'center';

    // Title
    ctx.font = '900 13px monospace';
    ctx.fillStyle = isNewHighScore ? '#fbbf24' : '#f43f5e';
    ctx.fillText(isNewHighScore ? '★ NEW RECORD SET ★' : 'RUN TERMINATED', canvas.width / 2, cardY + 36);

    // Primary Big Score
    ctx.font = '900 38px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(score.toString().padStart(5, '0'), canvas.width / 2, cardY + 84);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('FINAL SCORE', canvas.width / 2, cardY + 102);

    // Stat Grid Splitter Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 24, cardY + 118);
    ctx.lineTo(cardX + cardW - 24, cardY + 118);
    ctx.stroke();

    // Stat Column 1: Best Score
    const col1X = cardX + cardW * 0.25;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RECORD', col1X, cardY + 140);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`${highScore}`, col1X, cardY + 162);

    // Stat Column 2: Sector
    const col2X = cardX + cardW * 0.50;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SECTOR', col2X, cardY + 140);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(finalCityName, col2X, cardY + 162);

    // Stat Column 3: Distance
    const col3X = cardX + cardW * 0.75;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DISTANCE', col3X, cardY + 140);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${finalDistanceMeters}m`, col3X, cardY + 162);

    // Stat Grid Splitter Line 2
    ctx.beginPath();
    ctx.moveTo(cardX + 24, cardY + 182);
    ctx.lineTo(cardX + cardW - 24, cardY + 182);
    ctx.stroke();

    // Call To Action: "RUN AGAIN" Interactive Button
    const btnW = cardW - 48;
    const btnH = 46;
    const btnX = cardX + 24;
    const btnY = cardY + cardH - 72;

    const pulse = (Math.sin(Date.now() * 0.007) + 1) / 2;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 10);
    ctx.fill();

    ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '900 15px monospace';
    ctx.fillStyle = '#38f845';
    ctx.fillText('▶  RUN AGAIN', canvas.width / 2, btnY + 28);

    // Sub-caption Hint
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Tap button or press SPACE', canvas.width / 2, cardY + cardH - 12);

    ctx.restore();
  }

  requestAnimationFrame(() => {
    update();
    draw();
  });
}

// -------------------------------------------------------------
// Initialize & YouTube Playables Integration
// -------------------------------------------------------------
initWorld();
requestAnimationFrame(draw);

window.addEventListener('load', () => {
  if (window.YTPlayables) {
    window.YTPlayables.gameLoading();
    if (window.YTPlayables.loadData) {
      window.YTPlayables.loadData().then((saved) => {
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.highScore && data.highScore > highScore) {
              highScore = data.highScore;
            }
          } catch (e) {}
        }
      });
    }
    window.YTPlayables.gameReady();
  }
});

// YouTube Playables & System Pause/Mute compliance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (AudioEngine.ctx && AudioEngine.ctx.state === 'running') {
      AudioEngine.ctx.suspend();
    }
  } else {
    if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended' && !gameOver) {
      AudioEngine.ctx.resume();
    }
  }
});