export const TICK_MS = 1000 / 60;
export const MAX_FRAME_MS = 250;

export const STORAGE_KEY = 'ninja_cat_high_score';
export const RESTART_DELAY_MS = 600;

export const PLAYER = {
  airJumps: 1,
  coyoteTicks: 6,
  jumpBufferTicks: 8,
  wallKickFactor: 0.95,
  airJumpFactor: 0.85,
  wallClimbVelocity: -5,
  wallSlideMaxVelocity: 1.8,
  slideMinTicks: 30,
  slideBufferTicks: 6,
  fastFallBoost: 11,
  fastFallMinVelocity: 15,
  landingTolerance: 14,
  mantleDepth: 24,
  frontWallDepth: 20,
  speedEase: 0.04,
};

export const COMBO = {
  windowTicks: 130,
  tiers: [6, 12, 20],
  multipliers: [1, 2, 4],
  hyperTicks: 260,
  hyperSpeedBonus: 1.8,
};

export const SCORING = {
  shuriken: 15,
  building: 20,
  smash: 50,
};

export const WORLD = {
  pixelsPerMeter: 30,
  metersPerCity: 250,
  fullDifficultyMeters: 1500,
  dayCyclePerTick: 0.00004,
  startCycle: 0.85,
  cityBannerTicks: 180,
};

// Layout and tuning differ between narrow/touch screens and desktop.
export function getProfile(view) {
  const h = view.height;

  if (view.isMobile) {
    return {
      playerX: Math.max(35, view.width * 0.12),
      hitWidth: 36,
      hitHeight: 50,
      renderSize: 74,
      baseSpeed: Math.max(4.6, Math.min(6.0, view.width * 0.008)),
      maxSpeedBonus: 2.5,
      speedPerMeter: 0.0017,
      jumpVelocity: -12.0,
      gravity: 0.55,

      startRoofY: h * 0.55,
      roofBaseY: h * 0.56,
      roofMinY: h * 0.44,
      roofMaxY: h - 110,
      roofVariance: 70,
      buildingMinWidth: 320,
      buildingExtraWidth: 320,
      minGap: Math.max(65, view.width * 0.14),

      shurikenSize: 18,
      shurikenArcCount: 3,
      shurikenArcHeight: 45,
      shurikenArcLift: 35,

      hvacSize: 32,
      pipe: { w: 86, h: 28, clearance: 54 },
      chimney: { w: 36, h: 120 },
    };
  }

  return {
    playerX: 120,
    hitWidth: 46,
    hitHeight: 60,
    renderSize: 104,
    baseSpeed: 7.6,
    maxSpeedBonus: 4.5,
    speedPerMeter: 0.003,
    jumpVelocity: -13.5,
    gravity: 0.65,

    startRoofY: h - 200,
    roofBaseY: h - 210,
    roofMinY: h - 340,
    roofMaxY: h - 110,
    roofVariance: 130,
    buildingMinWidth: 460,
    buildingExtraWidth: 320,
    minGap: 120,

    shurikenSize: 22,
    shurikenArcCount: 4,
    shurikenArcHeight: 75,
    shurikenArcLift: 50,

    hvacSize: 40,
    pipe: { w: 108, h: 34, clearance: 64 },
    chimney: { w: 44, h: 155 },
  };
}
