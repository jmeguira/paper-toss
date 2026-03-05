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
      scenes/
        BootScene.ts               # Procedural texture generation, then -> GameScene
        GameScene.ts               # Main gameplay orchestrator, mode switching
      systems/
        SwipeInput.ts              # Flick gesture input — touch near ball, flick upward
        MechanicalInput.ts         # Button-based input: oscillating angle + GO launch
        FlightSimulator.ts         # Analytical parametric flight + wind, 3D→screen projection
        WindSystem.ts              # Per-throw wind with solvability cap
      objects/
        Projectile.ts              # Throwable object — sprite + reset
        Target.ts                  # Distant target rings
        GroundPlane.ts             # Perspective grid lines
      ui/
        TouchButton.ts             # Reusable circular button with press/release tracking
        AngleIndicator.ts          # Oscillating needle for mechanical mode
        ModeToggle.ts              # S/M toggle to switch input modes
        DevOverlay.ts              # Dev-mode zone visualization + perfect throw button
        WindIndicator.ts           # Arrow + strength display
        ScoreDisplay.ts            # Streak counter
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

### Next up
- **Dev settings panel** — Live sliders for targetZ, wind range, TARGET_RADIUS, tier percentages, etc. for feel-based tuning without recompiling
- **Sound + haptics**
- **Start screen + high score persistence**

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
