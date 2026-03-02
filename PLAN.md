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
      types.ts                     # Shared interfaces
      scenes/
        BootScene.ts               # Procedural texture generation, then -> GameScene
        GameScene.ts               # Main gameplay orchestrator
      systems/
        SwipeInput.ts              # Touch capture, trail recording, power/angle/spin math
        FlightSimulator.ts         # Ballistic arc + wind + spin, 3D→screen projection
        WindSystem.ts              # Random wind generation per throw
      objects/
        Projectile.ts              # Throwable object
        Target.ts                  # Distant target rings
        GroundPlane.ts             # Perspective grid lines
      ui/
        WindIndicator.ts           # Arrow + strength display
        ScoreDisplay.ts            # Score counter
        SwipeFeedback.ts           # Visual cues during swipe (scale pulse, tint, offset)
```

## Key Design Decisions
- **No Phaser physics engine** — hand-rolled Euler integration (~30 lines) gives full control over the fake-3D ballistic arc
- **Fake 3D**: Internal 3D coordinates (x/y/z) projected to 2D via `scale = focalLength / (focalLength + z)`
- **Procedural graphics only** — no image assets for MVP, all drawn with Phaser Graphics
- **Event-driven**: SwipeInput emits events → GameScene dispatches to FlightSimulator and SwipeFeedback
- **All tuning constants in one file** for rapid playtesting iteration

## Swipe Mechanic (the core)
- Record full touch trail (position + timestamp, up to 60 samples)
- **Power**: speed of final ~80ms of swipe
- **Direction**: angle of overall swipe vector vs straight-up
- **Spin**: accumulated signed curvature (cross-product of consecutive direction vectors along trail)
- **Cancel**: swipe down past 30px threshold → snap projectile back to rest
- **Feedback during swipe** (NOT a trajectory line):
  - Scale pulse — ball swells with swipe speed
  - Tint shift — color warms with power
  - Lateral offset — ball drifts slightly in aim direction

## Implementation Steps (each produces a testable result)

1. **Scaffold** — Create all project files, `npm install`, verify blank Phaser canvas renders ✅
2. **Procedural textures** — Generate circle (projectile) and ring (target) textures in BootScene ✅
3. **Ground plane + Target** — Perspective grid lines converging to vanishing point, target rings at distance ✅
4. **Projectile at rest** — Place projectile sprite at bottom-center ✅
5. **SwipeInput** — Implement touch lifecycle, log ThrowParams to console, test with touch emulation ✅ (angle only; power/spin deferred)
6. **SwipeFeedback** — Wire swipe events to visual cues on projectile ← **UP NEXT**
7. **FlightSimulator (gravity only)** — Basic ballistic arc with depth scaling, no wind/spin yet
8. **Hit detection + score** — Check landing vs target, flash on hit, increment score, reset cycle
9. **Wind** — WindSystem + WindIndicator UI, apply wind force in flight
10. **Spin** — Enable spin in SwipeInput + FlightSimulator, verify curved swipes → curved flights
11. **Polish** — Tune constants, throw-reset flow, session score

Steps 1–8 = core MVP. Steps 9–10 = skill-depth. Step 11 = playtest loop.

## Verification
- `npm run dev` → game loads on mobile browser / Chrome DevTools touch emulation
- Swipe up → projectile flies toward target with depth scaling
- Swipe down → cancel, projectile resets
- Wind arrow visible, affects flight laterally
- Curved swipe → curved flight path
- Hit target → score increments, projectile resets
