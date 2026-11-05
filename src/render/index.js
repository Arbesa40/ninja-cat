import { ctx, view } from '../core/canvas.js';
import { drawParticles, drawFloatingTexts } from '../core/effects.js';
import { getEnvironment } from '../data/timeOfDay.js';
import { game, currentCity } from '../game/state.js';
import { drawSky, drawStars, drawCelestialBody, drawClouds, drawLandmark, drawSkyline, drawFog } from './background.js';
import { drawBuildings } from './buildings.js';
import { drawObstacles, drawShurikens } from './obstacles.js';
import { drawPlayer } from './player.js';
import { drawHud, drawTouchZones, drawCityBanner } from './hud.js';
import { drawTitleScreen, drawPauseScreen, drawGameOverScreen } from './screens.js';

export function render() {
  const now = performance.now();
  const env = getEnvironment(game.cycle);

  ctx.clearRect(0, 0, view.width, view.height);

  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }

  drawSky(env);
  drawStars(env, now);
  drawCelestialBody(env, game.cycle);
  drawClouds(env);
  drawLandmark(currentCity(), now);
  drawSkyline(env);
  drawBuildings(game.buildings, env);
  drawFog(env);
  drawShurikens(game.shurikens, now);
  drawObstacles(game.obstacles, now);
  drawParticles();
  drawPlayer();
  drawFloatingTexts();
  ctx.restore();

  if (game.mode === 'title') {
    drawTitleScreen();
    return;
  }

  drawHud();
  if (game.mode === 'playing') drawTouchZones();
  drawCityBanner();

  if (game.mode === 'paused') drawPauseScreen();
  else if (game.mode === 'over') drawGameOverScreen();
}
