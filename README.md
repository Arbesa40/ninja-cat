# Ninja Cat: Rooftop Runner

An endless rooftop runner in plain JavaScript and Canvas 2D. No build step and no dependencies.

## Running locally

The game uses ES modules, so it needs to be served over HTTP. Opening `index.html` directly from disk won't work.

```sh
python3 -m http.server 8000
# or: npx serve .
```

Then open <http://localhost:8000>.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Jump / double jump | Space, ↑, W | Tap right half |
| Slide (hold to keep sliding) | Hold ↓ or S | Hold left half |
| Fast fall | ↓ while airborne | Left half while airborne |
| Wall kick | Jump while clinging to a chimney | Same |
| Pause | P or Esc | Auto-pauses when the app is backgrounded |
| Mute | M | — |

If you hit a chimney mid-air, the cat clings to it. Jump to kick up the wall, and keep jumping to climb over the top.

## Project layout

```
index.html, style.css
src/
  main.js            boot, fixed-timestep loop, input routing
  config.js          all tuning: physics, combo, scoring, per-device layout profiles
  core/              engine-level pieces with no game rules
    canvas.js        canvas sizing (HiDPI), roundRect fallback
    audio.js         procedural Web Audio sound effects
    input.js         keyboard / mouse / touch -> game actions
    sprites.js       sprite loading and the Animator
    effects.js       particles and floating text
    storage.js       high score (localStorage + YouTube Playables)
    utils.js
  data/              static content: cities, time-of-day palettes
  game/              game rules and simulation
    state.js         the game and player state objects
    session.js       title / start / pause / game over transitions
    update.js        one simulation tick
    player.js        jump, slide, gravity
    collisions.js    rooftops, obstacles, wall cling, pickups
    world.js         procedural level generation
    combo.js         flow multiplier and Hyper Rush
    parallax.js      background layer state
  render/            drawing only: reads state, never changes it
scripts/package.sh   builds ninja-cat.zip for upload
```

## Tuning

Almost every number that affects game feel lives in `src/config.js`. `getProfile()` holds the separate desktop and mobile values for sizes, speeds, jump arc and level layout.

## Packaging

```sh
./scripts/package.sh
```

This creates `ninja-cat.zip` containing the game files, ready for upload (for example, to YouTube Playables).

## Play online

https://arbesa40.github.io/ninja-cat/
