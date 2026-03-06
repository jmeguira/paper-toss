# Paper Toss MVP — Implementation Plan

## Context
Building a mobile-first projectile throwing game (Pokemon Go-style throw mechanic) from scratch using Phaser 3 + Vite. The core game loop: swipe to throw a projectile at a distant target, with wind and spin affecting flight. No trajectory preview — the skill IS feeling the throw. Fake 3D via 2D canvas with depth scaling.

## Project Structure
```
paper-toss/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  public/style.css
  src/
    main.ts                        # DOM bootstrap
    game/
      main.ts                      # Phaser.Game config (RESIZE scaling, single pointer)
      constants.ts                 # All tuning knobs in one file
      types.ts                     # Shared interfaces (ThrowParams, InputMode, etc.)
      scenes/                      # Phaser Scene subclasses — orchestrators
        BootScene.ts               # Procedural texture generation, then -> StartScene
        StartScene.ts              # Title, difficulty select, high scores, Play button
        GameScene.ts               # Main gameplay orchestrator
      systems/                     # Pure logic, no rendering
        SwipeInput.ts              # Flick gesture input — touch near ball, flick upward
        MechanicalInput.ts         # Button-based input: oscillating angle + GO launch
        FlightAnimator.ts          # Analytical parametric flight + wind, 3D→screen projection
        ShotResolver.ts            # Computes landing result + zone edges from throw params
        WindSystem.ts              # Per-throw wind with solvability cap
        HighScoreStore.ts          # localStorage persistence for per-difficulty best streaks
      objects/                     # World-space entities (depth-projected, part of game world)
        Projectile.ts              # Throwable object — sprite + reset
        Target.ts                  # Distant target rings
        GroundPlane.ts             # Perspective grid lines
      components/                  # Visual building blocks (one Graphics/Text, screen-space)
        AngleBounds.ts             # Faint ±60° cone lines from ball
        AngleIndicator.ts          # Oscillating needle for mechanical mode
        ThrowAngle.ts              # Post-throw arrow showing input angle
        ZoneOverlay.ts             # Arc-sector visualization of landing zones
        PerfectThrowButton.ts      # Dev button that fires the solved angle
        TouchButton.ts             # Reusable circular button with press/release tracking
        WindIndicator.ts           # Arrow + strength display
        ScoreDisplay.ts            # Streak counter
      composites/                  # Compose components into screen-level UI
        DevOverlay.ts              # Dev-mode: ZoneOverlay + PerfectThrowButton
        SettingsOverlay.ts         # Modal: mode toggle + back to menu
```

## Input Mechanic (the core)
Two input modes sharing identical launch bounds (±45° angle, 25–75% horizontal):

**Swipe mode** — touch near ball to pick up, drag upward, cross throw line to fire:
- Touch within pickup radius → ball scales up, follows finger
- Horizontal position clamped to launch bounds while dragging
- Cross throw line (62% height) with sufficient speed → throw fires
- Release below line → tweened snap-back to rest position
- Angle computed from last 5 trail points; launchX from pointer X at crossing
- Power and spin deferred from MVP

**Mechanical mode** — button-based alternative:
- ← → buttons nudge ball horizontally, GO fires, RESET returns to center
- Oscillating angle indicator (sine wave) sweeps ±45°
- GO captures current angle + ball X position as ThrowParams

## Implementation Steps (each produces a testable result)

1. **Scaffold** — Create all project files, `npm install`, verify blank Phaser canvas renders ✅
2. **Procedural textures** — Generate circle (projectile) and ring (target) textures in BootScene ✅
3. **Ground plane + Target** — Perspective grid lines converging to vanishing point, target rings at distance ✅
4. **Projectile at rest** — Place projectile sprite at bottom-center ✅
5. **SwipeInput** — Implement touch lifecycle, log ThrowParams to console, test with touch emulation ✅ (angle only; power/spin deferred)
6. **SwipeFeedback** — Ball-in-hand pickup, throw-line crossing, mechanical input mode, mode toggle ✅ (deviated from original plan: implemented full input rework with two modes instead of just visual cues)
7. **FlightSimulator (gravity only)** — Basic ballistic arc with depth scaling, no wind/spin yet ✅ (ball launches from actual position, Euler integration, perspective projection)
8. **Hit detection + score** — Check landing vs target, flash on hit, increment score, reset cycle ✅ (world-space distance check, streak counter, filled target matching hit zone)
9. **Wind** — WindSystem + WindIndicator UI, apply wind force in flight ✅ (lateral only, abstract 0–10 display scale, per-throw randomization)
10. ~~**Spin** — Enable spin in SwipeInput + FlightSimulator, verify curved swipes → curved flights~~ (deferred — see TODO)
11. **Polish** — Tune constants, throw-reset flow, session score

Steps 1–9 complete = core MVP with skill-depth. Step 11 = playtest/polish loop.

## v1 Ship

### Completed
- **Swipe rework (A–C)** ✅ — Flick gesture replaces ball-in-hand drag. Fixed center launch. Angle bounds cone. Flight tuning (lateral multiplier, higher arc, wind rebalance). Swipe as default mode.
- **Dev overlay + landing tiers + analytical flight** ✅ — Five-tier landing zones (PERFECT/HIT/NEAR HIT/NEAR MISS/MISS) with derived radii. Dev overlay with arc-sector zone visualization. Wind cap with miss buffer guarantee. Perfect throw button. Analytical flight (parametric path replaces Euler integration). Shared `flightTime()` helper fixes starting-height bug.
- **Code cleanup pass** ✅
- **Difficulty levels** ✅ — Distance-driven flight time, three presets (Easy/Medium/Hard), cycle button

### Visual overhaul ✅
- **Theme system** — all visual constants in `theme.ts`, all UI files wired to `theme.ui.*`
- **Perspective grid room** — floor + back wall using `GRID_CELL` world-unit projection
- **Target** — thick rim on scoring boundary, ellipse squash for perspective
- **Ball** — color from theme (blue placeholder)
- **Spin** — deferred (needs proper 3D asset or physics-driven spin system)
- **Flight trail** — deferred (unnecessary if visual ends up being a paper ball)

### Swipe refinement ✅
- Trim last 2 trail points (finger-lift noise) + least-squares linear fit over 12 points
- Aim-then-fire mode with LAUNCH button (toggle in settings)
- Dev logger gating console output behind DEV_MODE

### Next up
- **Dev settings panel** — Live sliders for targetZ, wind range, TARGET_RADIUS, tier percentages, etc. for feel-based tuning without recompiling
- **Sound + haptics**
- ~~**Start screen + high score persistence**~~ ✅ — StartScene with difficulty selector + high scores, HighScoreStore (localStorage), settings overlay with mode toggle, hamburger menu, Depth enum

### v2 parking lot
- Skins (baseball, paper toss aesthetic)
- Alternative game modes
- Lateral launch point (re-enable L/R buttons)
- Moving targets
- Power mechanic (swipe speed, separate UI, or fixed)
- Spin mechanic (curved swipe → curved flight)
- Projectile types (Heavy/Balanced/Flippy) with unlock system
- Swipe sensitivity settings (user-adjustable thresholds)
- Accessibility options (mechanical angle/power input alternatives)
- Dynamic window resizing (reposition objects on viewport change — desktop only)
- Overall complexity tuning (how many mechanics is the right amount)
- Server-validated leaderboard (replay validation — client sends inputs, server re-runs physics)

## Verification
- `npm run dev` → game loads on mobile browser / Chrome DevTools touch emulation
- Swipe up → projectile flies toward target with depth scaling
- Swipe down → cancel, projectile resets
- Wind arrow visible, affects flight laterally
- Curved swipe → curved flight path
- Hit target → score increments, projectile resets
