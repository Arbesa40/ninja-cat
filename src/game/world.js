import { WORLD } from '../config.js';
import { clamp, randRange } from '../core/utils.js';
import { view } from '../core/canvas.js';
import { game, player, currentCity } from './state.js';

const SPAWN_AHEAD = 600;
const DESPAWN_BEHIND = -100;
const WINDOW_STEPS = {
  cyber_tokyo: [34, 42],
  haussmann_paris: [44, 50],
  tenement_nyc: [38, 46],
};

export const difficulty = () => clamp(game.distance / WORLD.pixelsPerMeter / WORLD.fullDifficultyMeters, 0, 1);

function createBuilding(x, y, w, style) {
  const [stepX, stepY] = WINDOW_STEPS[style];
  const windows = [];
  for (let relX = 20; relX < w - 20; relX += stepX) {
    for (let relY = 24; relY < view.height; relY += stepY) {
      windows.push({ relX, relY, isLit: Math.random() < 0.45 });
    }
  }
  return { x, y, w, style, subType: Math.random() < 0.5 ? 0 : 1, windows };
}

export function resetWorld() {
  const p = game.profile;
  game.buildings = [createBuilding(0, p.startRoofY, 700, currentCity().architecture)];
  game.obstacles = [];
  game.shurikens = [];
  while (game.buildings.at(-1).x < view.width + SPAWN_AHEAD + 200) spawnBuilding();
}

// Frames spent in the air for a full jump that lands `rise` px above take-off.
function airtime(rise) {
  const v0 = -player.jumpVelocity;
  const g = player.gravity;
  return (v0 + Math.sqrt(Math.max(0, v0 * v0 - 2 * g * rise))) / g;
}

function spawnBuilding() {
  const p = game.profile;
  const d = difficulty();
  const last = game.buildings.at(-1);

  // Never ask for a climb above ~65% of a single jump's height.
  const maxRise = (player.jumpVelocity ** 2 / (2 * player.gravity)) * 0.65;
  const y = clamp(
    p.roofBaseY + (Math.random() - 0.5) * p.roofVariance,
    Math.max(p.roofMinY, last.y - maxRise),
    p.roofMaxY
  );

  // Gaps scale with how far a single jump carries at the current speed,
  // so they stay clearable as the run speeds up but widen with difficulty.
  const reach = Math.max(player.speed, player.baseSpeed) * airtime(last.y - y);
  const gap = randRange(reach * 0.3, reach * (0.5 + 0.3 * d));

  const x = last.x + last.w + gap;
  const w = p.buildingMinWidth + Math.random() * p.buildingExtraWidth;
  game.buildings.push(createBuilding(x, y, w, currentCity().architecture));

  spawnGapShurikens(last, x, y, gap);
  spawnObstacles(x, y, w, d);
}

function addShuriken(x, y) {
  const size = game.profile.shurikenSize;
  game.shurikens.push({ x, y, w: size, h: size, collected: false });
}

function spawnGapShurikens(from, nextX, nextY, gap) {
  const p = game.profile;
  const n = p.shurikenArcCount;
  const top = Math.min(from.y, nextY) - p.shurikenArcLift;
  for (let i = 0; i < n; i++) {
    const f = (i + 1) / (n + 1);
    addShuriken(from.x + from.w + gap * f, top - Math.sin(f * Math.PI) * p.shurikenArcHeight);
  }
}

function spawnObstacles(bx, roofY, bw, d) {
  if (bw < 380 || Math.random() > 0.7 + 0.3 * d) return;

  const firstX = bx + bw * randRange(0.4, 0.55);
  placeObstacle(firstX, roofY);

  // Later in the run, long rooftops can hold a second obstacle with enough
  // run-up between them to react.
  const spacing = player.speed * 34;
  const secondX = firstX + spacing;
  if (secondX + 120 < bx + bw - 60 && Math.random() < d * 0.6) placeObstacle(secondX, roofY);
}

function placeObstacle(x, roofY) {
  const p = game.profile;
  const roll = Math.random();
  const sh = p.shurikenSize;

  if (roll < 0.38) {
    const s = p.hvacSize;
    const obs = { type: 'hvac', x, y: roofY - s, w: s * 1.3, h: s };
    game.obstacles.push(obs);
    addShuriken(x + obs.w / 2 - sh / 2, obs.y - sh - 40);
  } else if (roll < 0.68) {
    const { w, h, clearance } = p.pipe;
    game.obstacles.push({ type: 'pipe', x, y: roofY - clearance, w, h });
    addShuriken(x + w / 2 - sh / 2, roofY - sh - 4);
  } else {
    const { w, h } = p.chimney;
    game.obstacles.push({ type: 'chimney', x, y: roofY - h, w, h });
    addShuriken(x + w / 2 - sh / 2, roofY - h - sh - 30);
  }
}

export function scrollWorld(dx) {
  for (const b of game.buildings) b.x -= dx;
  for (const o of game.obstacles) o.x -= dx;
  for (const s of game.shurikens) s.x -= dx;
}

// Drops off-screen objects, tops up the level ahead, and returns how many
// buildings were cleared.
export function recycleWorld() {
  let cleared = 0;
  while (game.buildings.length && game.buildings[0].x + game.buildings[0].w < DESPAWN_BEHIND) {
    game.buildings.shift();
    cleared++;
  }
  game.obstacles = game.obstacles.filter((o) => !o.destroyed && o.x + o.w > DESPAWN_BEHIND);
  game.shurikens = game.shurikens.filter((s) => !s.collected && s.x + s.w > DESPAWN_BEHIND);

  while (game.buildings.at(-1).x < view.width + SPAWN_AHEAD) spawnBuilding();
  return cleared;
}
