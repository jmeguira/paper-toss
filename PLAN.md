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
        DevThrowButtons.ts         # Row of tier buttons (P/H/NH/NM) for dev testing
        FeedbackZone.ts            # Bordered rect placeholder for landing feedback
        NavBar.ts                  # Home + hamburger buttons (top row)
        ScoreRow.ts                # Streak, best score, difficulty label
        ThrowAngle.ts              # Post-throw arrow showing input angle
        TouchButton.ts             # Reusable circular button with press/release tracking
        WindDisplay.ts             # Arrow + numeric label within a container
        ZoneOverlay.ts             # Arc-sector visualization of landing zones
      composites/                  # Compose components into screen-level UI
        DevOverlay.ts              # Dev-mode: ZoneOverlay + tier throw buttons
        SettingsOverlay.ts         # Modal: mode toggle + back to menu
        WallPanel.ts               # HUD panel: ScoreRow + FeedbackZone + WindDisplay
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

### Flight polish + theme completion + palette ✅
- Flight arc amplification (`ARC_SCALE`) and dive effect (`DIVE_EXPONENT`)
- All hardcoded colors wired through theme — zero color literals outside `theme.ts`
- Dev overlay toggle in settings panel
- Bioluminescent teal/orange palette
- Canvas renderer (true anti-aliased curves vs WebGL polygon approximation)
- Live Graphics objects for ball/target (native device resolution, no procedural textures)

### HUD + layout system ✅
- **Percentage-based vertical layout** — `LAYOUT` constant: NAV (7%) → HUD (20%) → Buffer (8%) → Playable (65%). `VANISH_Y_PCT` derived as getter
- **Screen-space WallPanel** — sized by pixel budget, not world-space projection. Works across SE to Pro Max
- **Typographic scale** — `typeScale(screenHeight)` returns heading/body/caption sizes. All text uses it, zero hardcoded px values
- **WallPanel decomposition** — split into ScoreRow, WindDisplay, FeedbackZone components. WallPanel is thin composite
- **NavBar** — home button + hamburger, heading-size icons
- **Dev throw buttons** — P/H/NH/NM tier buttons replace single Perfect button
- **Depth layers** — GRID (0), WALL (1), GAME (10) added to Depth enum
- **Target elevation** — `TARGET_Y = 200` lifts target off ground plane
- **VS Code + lint setup** — Prettier, ESLint, extensions, format-on-save

### Juice — Landing Feedback + Sound + Wind Visuals

The full feedback layer. Proportional, honest responses — the gap between tiers is what makes the top feel special.

**Visual — Shape & Motion**
- Scale pop on streak counter (increment) and high score (when beaten)
- Target ring wobble on NEAR HIT / NEAR MISS — exploring
- Tweened text in feedback zone (eases in, not snaps)
- Anticipation scale: tiny shrink before launch, ball grows during flight for weight

**Visual — Screen-Level**
- Screen shake on NEAR HIT / NEAR MISS only (ball grazed the ring) — capped intensity
- Wall panel flash on landing (restricted to HUD, not full screen) — exploring
- Chromatic aberration on NEAR MISS or MISS — glitchy error feel
- Zoom punch on PERFECT only

**Visual — Particles & Trails**
- Particles tiered per landing: PERFECT full burst, HIT good, NEAR HIT kicks some up, MISS ball disintegrates/glitches out
- Ghost trail: afterimages during flight to show the arc/curve
- Impact rings: expanding ripple from landing point
- Target channel: ball passes through visual channel on hits, channel responds per tier
- Speed lines — maybe, need to see in practice

**Visual — Color & Light**
- Color flash/tint: target ring color-codes to tier, matches feedback zone
- Rim glow: target ring glows on approach/contact — exploring
- Grid pulse: grid lines subtly pulse tier color on landing

**Temporal**
- Hang at apex, slam home feel. Dive exponent handles it now. Time-based approach (stretching `t`) is the cleaner long-term lever if other effects need to sync to the same rhythm. Noting, not changing yet

**Audio (procedural via Web Audio API)**
- Distinct but related tones per tier. PERFECT = crisp, definitive, unmistakable
- Pitch jitter on all tiers except PERFECT — PERFECT is always identical
- Rising pitch on streak: success tone climbs with consecutive hits
- Audio ducking: subtle dip at arc apex for tension, also landing SFX over ambient (when ambient exists)

**Haptic (mobile)**
- Impact vibration per tier — PERFECT is a clean tap, MISS buzzes
- Tiered intensity — proportional, crisp not aggressive

**Wind visualization**
- Ambient flow particles showing wind direction + strength
- Wind source element (visible origin point) — design TBD
- Existing arrow + number display stays

**Parked juice ideas**
- Vignette pulse — revisit if game moves to lives/HP model
- Ambient sound vs soundtrack — undecided, affects ducking
- Speed lines — need to see in practice

### Streak-driven difficulty
- Replace difficulty tiers with progressive ramping based on streak
- targetZ ramps gradually, up to a ceiling
- targetX and launchX may vary per throw — every throw is a unique geometry problem
- Wind range auto-scales via physics (longer flight → more drift)
- One mode, one leaderboard — streak is the identity
- See DESIGN.md for full decision

### Parked
- Dev settings panel — live sliders for feel-based tuning
- Skin system (paper toss easter egg, etc.)

### v2 parking lot
- Skins (baseball, paper toss aesthetic)
- Alternative game modes
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
