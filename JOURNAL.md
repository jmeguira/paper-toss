# Progress Log

## 2026-03-02

### Step 1: Scaffold ✅
- Created `package.json` with Phaser 3.90.0, TypeScript 5.9.3, Vite 7.3.1
- Created `tsconfig.json` with strict mode
- Created `vite.config.ts` (minimal — just relative base path)
- Created `index.html` (entry point, mobile viewport, loads main script)
- Created `public/style.css` (margin/padding reset, no-scroll, black background)
- Created `src/main.ts` (entry point, calls createGame)
- Created `src/game/main.ts` (Phaser.Game config — auto renderer, resize scaling)
- Verified: Vite dev server starts, serves page

### Step 2: Procedural Textures ✅
- Created `src/game/constants.ts` (projectile + target tuning values)
- Created `src/game/scenes/BootScene.ts` (generates projectile circle + target bullseye textures, stores in Phaser texture cache, transitions to GameScene)
- Created `src/game/scenes/GameScene.ts` (empty stub)
- Registered both scenes in game config (BootScene first → auto-starts)
- Not visually testable yet — textures in memory but nothing renders them

### Step 3: Ground Plane + Target ✅
- Added fake-3D projection constants (`FOCAL_LENGTH`, `TARGET_Z`, `GROUND_MAX_Z`)
- Created `src/game/objects/GroundPlane.ts` — horizontal + vertical perspective grid lines converging to vanishing point
- Created `src/game/objects/Target.ts` — places bullseye sprite at distance using projection formula
- Wired both into GameScene
- Fixed inverted perspective (ground was receding downward instead of upward)
- Tuned target: pushed back to z=1200, tripled texture radius for crispness at distance
- Added `CLAUDE.md` for project instructions (commit workflow, branch/PR convention)
- Added `TODO.md` for tracking polish/tech debt
- First visually testable step — perspective grid and target visible in browser

### Step 4: Projectile at Rest ✅
- Created `src/game/objects/Projectile.ts` — ball sprite at bottom-center, scale 1 (z=0)
- Added `resetPosition()` method for post-throw reset
- Stored as class property on GameScene (unlike fire-and-forget GroundPlane/Target)
- Added pre-commit hook (tsc --noEmit) with portable `setup.sh`
- Added README

### Step 5: Swipe Input ✅
- Created `src/game/types.ts` — ThrowParams interface (angle only for MVP)
- Created `src/game/systems/SwipeInput.ts` — touch/mouse event lifecycle
- Three cancel gates: swipe down, insufficient distance, insufficient speed
- Thresholds are screen-relative (percentage of viewport height)
- Deferred power and spin from MVP — tracked in TODO
- Wired into GameScene with console logging for testing

## 2026-03-03

### Step 6: Swipe Feedback — Ball-in-Hand + Mechanical Mode ✅
- Expanded `ThrowParams` with `launchX`; added `InputModeType` union and `InputMode` interface
- Added 17 new constants: shared launch bounds, ball pickup, throw line, mechanical mode, mode toggle
- Upgraded `Projectile` with `pickup()`, `follow()`, `setX()`, `resetShot()` (tween snap-back), `isHeld` getter
- Created `src/game/ui/ThrowLine.ts` — dashed line at 62% height as throw trigger
- Reworked `SwipeInput` — touch-near-ball pickup, ball follows finger, throw-line crossing detection, release-below-line cancel. Implements `InputMode` interface with enable/disable lifecycle
- Created `src/game/ui/TouchButton.ts` — reusable circular button with press/release tracking
- Created `src/game/ui/AngleIndicator.ts` — sine-wave oscillating needle for mechanical mode
- Created `src/game/systems/MechanicalInput.ts` — L/R arrow buttons, GO launch, reset button, angle oscillator. Implements `InputMode` interface
- Created `src/game/ui/ModeToggle.ts` — S/M toggle in top-right corner
- Wired both modes into `GameScene` with mode switching, shared update loop
- Bug fixes: removed aggressive drag-down cancel (clamped Y instead), added ball reset after throw
- Layout iteration: moved launch button below ball, added reset button, clustered ← GO → on one row, reset in bottom-right corner
- Updated CLAUDE.md with implementation workflow guidelines (step-by-step, show code, interleave explanations)

### Step 7: FlightSimulator ✅
- Created `src/game/systems/FlightSimulator.ts` — Euler integration on 3D axes (x/y/z), projected to 2D via shared FOCAL_LENGTH perspective system
- Extracted `VANISH_Y_PCT` constant from hardcoded 0.35 in GroundPlane and Target
- Added flight constants: `FLIGHT_SPEED`, `FLIGHT_LAUNCH_VY`, `FLIGHT_GRAVITY`
- Clamped ball Y to throw line in `Projectile.follow()` — prevents crossing throw line without launching
- Ball launches from its actual screen position (mechanical starts from rest Y, swipe from throw line)
- Wired into GameScene: input disabled during flight, re-enabled on landing
- Switched default input mode to mechanical
- Widened launch angle to ±60°
- Added debug logging for raw vs clamped angle in degrees

### Step 8: Hit Detection + Score ✅
- Added `HIT_RADIUS` and `LANDING_PAUSE_MS` constants
- Created `src/game/ui/ScoreDisplay.ts` — streak counter, increments on hit, resets on miss
- Hit detection in world space: distance from landing (x, z) to target (0, TARGET_Z)
- Updated target texture to filled circle matching HIT_RADIUS (removed decorative rings)
- Added 600ms pause after landing before reset cycle
- Fixed throw line showing on startup in mechanical mode (start hidden)

### Step 9: Wind ✅
- Created `src/game/systems/WindSystem.ts` — random lateral force per throw
- Created `src/game/ui/WindIndicator.ts` — directional arrow + abstract 0–10 scale display
- Wind applied as lateral acceleration during flight (same Euler pattern as gravity)
- New wind generated after each landing
- Tuned flight speed to 1100 for center target hits on straight throws

### Session notes
- Updated CLAUDE.md: refined implementation workflow to three-section format (Design / Noteworthy / Changes), dropped line-by-line narration, Python analogies only when clarifying
- Design discussions: difficulty scaling via target distance, lateral target offset, play area aspect ratio, swipe feel vs mechanical mode, wind display as abstract units

## 2026-03-03 (session 2)

### v1 Ship: Swipe Rework (Steps A–C) ✅
- **Step A: Fixed center launch** — Ball always launches from screen center. MechanicalInput: L/R arrow buttons and RESET button hidden (code preserved for v2 lateral movement). launchX hardcoded to width/2. Indicator pinned to center. SwipeInput: launchX hardcoded to center.
- **Step B: Flick gesture rewrite** — Replaced ball-in-hand drag with flick gesture. Touch near ball → brief pulse tween (scale 1→1.08→1). Ball does NOT follow finger. Flick upward with sufficient speed → throw fires. Invalid gesture → silent no-op. Removed ThrowLine dependency (file kept on disk). Removed onCancel callback. Projectile ball-in-hand methods (pickup/follow/setX/resetShot) preserved but unused.
- **Step C: Angle bounds visualization** — New AngleBounds component: two faint lines from ball center at ±60°, white at 8% alpha. Visible in both input modes.
- **Flight tuning** — FLIGHT_LAUNCH_VY bumped 900→1400 for dramatic arc from rest position (ball now launches from 80% height instead of 62% throw line). Added FLIGHT_LATERAL_MULT=2.0 to decouple lateral speed from forward speed — angle displacement doubled for banana-curve feel. Wind range tuned to 1000–2500 (higher floor, higher ceiling).
- **Default mode** — Switched from mechanical to swipe as default input mode.

### Parked for next session
- **Solvability** — At max wind, some shots may be unsolvable. Need to compute max solvable wind or cap dynamically.
- **Second-half curve acceleration** — Wind ramp during flight (30%→100%) for more dramatic late-flight bending.
- **Three-tier landing animations** — Swish (clean hit), rim shot (near miss, ball deflects), wide miss (sails past). Replaces binary hit/miss.

## 2026-03-04

### Dev Overlay + Landing Tiers + Analytical Flight ✅
- **Ball rest position** — Lowered from 80% to 85% of viewport height for better flick ergonomics
- **Five-tier landing zones** — PERFECT (5% of target) / HIT (60%) / NEAR HIT (100%) / NEAR MISS (mirrored outward) / MISS. Tiers derived from two tuning knobs: `TARGET_RADIUS` and `HIT_PCT`
- **Dev overlay** — Created `DevOverlay` component with arc-sector visualization of all landing zones: gold (perfect), bright green (swish), subtle green (hit), red/amber (near-miss), light red (miss), blue buffer slivers at boundaries. Uses `channelEdges()` helper for angle math
- **Wind cap with miss buffer** — Added `MISS_BUFFER` constant (150 world units). Wind cap formula uses `NEAR_MISS_RADIUS + MISS_BUFFER` to guarantee missable space on both flanks. Buffer visualized as fixed-width blue slivers at angle boundaries
- **Perfect throw button** — Dev-mode "▶ Perfect" button fires mathematically solved angle. Wired via callback to `handleThrow()`
- **Analytical flight conversion** — Replaced Euler integration with parametric path evaluation. Flight result computed at launch time; `update()` evaluates `wx(t), wy(t), wz(t)` as pure functions of elapsed time. Zero drift, frame-rate independent, solver and flight use identical equations
- **Flight time fix** — Added shared `flightTime(startHeight)` function (quadratic formula). Fixed systematic error where ball started above ground but flight time assumed ground-level start. Applied to FlightSimulator, DevOverlay, and WindSystem
- **WindSystem refactor** — Now takes `screenHeight` in constructor for correct flight time. `maxWind` derived from physics + buffer constraint

### Difficulty Levels (Distance-Driven Flight Time) ✅
- **Flight model rework** — Replaced gravity-based `flightTime(startHeight)` with distance-based `flightTime(targetZ) = targetZ / FORWARD_SPEED`. Duration now scales with distance, so wind drift scales with distance squared
- **Per-shot launch velocity** — `vy0` computed per-shot from kinematics (`0.5·g·t − wy0/t`) instead of hardcoded constant. Easy = flat toss (~725), Medium = current feel (~1400), Hard = high arc (~2168)
- **Difficulty presets** — Three levels defined by `targetZ` alone: Easy (700), Medium (1200), Hard (1800). Everything else derives from physics
- **Removed constants** — `TARGET_Z` (now per-difficulty), `FLIGHT_LAUNCH_VY` (now per-shot). Added `FORWARD_SPEED = 810`, `DIFFICULTIES` array, `DEFAULT_DIFFICULTY`
- **Updated all consumers** — ShotResolver, WindSystem, WindIndicator, DevOverlay, Target, GameScene all take `targetZ` as parameter instead of using hardcoded values
- **Target repositioning** — `Target.setDistance(z)` method for runtime difficulty changes. Projection scale varies naturally (closer = bigger)
- **WindSystem simplified** — Dropped constructor, `screenHeight` field, `BALL_REST_Y_PCT` dependency. `maxWind(targetZ)` and `generate(targetZ)` take distance directly
- **Difficulty cycle button** — Top-left at (16, 80), cycles Easy→Medium→Hard→Easy. Repositions target, regenerates wind, updates all indicators

### Code Cleanup Pass ✅
- Deleted `ThrowLine.ts` — no longer used after flick gesture rework
- Stripped `Projectile.ts` — removed ball-in-hand methods (pickup, follow, setX, resetShot, isHeld). Now just sprite + resetPosition
- Stripped `MechanicalInput.ts` — removed L/R arrow buttons, RESET button, commented lateral movement code. Now just GO button + angle oscillator
- Removed 11 unused constants from `constants.ts` (SWIPE_CANCEL_*, LAUNCH_X_*, BALL_PICKUP_SCALE, BALL_RESET_*, THROW_LINE_*, MECH_BUTTON_SIZE, MECH_MOVE_SPEED)
- Removed commented ThrowLine import from `GameScene.ts`
- Removed redundant `as number` cast from `DevOverlay.ts`
- Updated DESIGN.md, PLAN.md, LEARNING.md — cleared stale references to ball-in-hand, Euler integration, ThrowLine, specific wind values, "swish" naming

## 2026-03-05

### Start Screen, High Score Persistence, Settings Overlay ✅
- **HighScoreStore** — Pure-logic localStorage wrapper for per-difficulty best streaks. Defensive parsing (handles corrupted/missing data, validates types, ignores unknown keys to prevent prototype pollution). Storage key: `paperToss.highScores`
- **ScoreDisplay.getStreak()** — Exposes current streak so GameScene can submit it to HighScoreStore before `miss()` resets it
- **StartScene** — New scene between Boot and Game. Title, three difficulty buttons with highlight on selection, per-difficulty high score display, Play button. Scene flow: Boot → Start → Game
- **GameScene.init()** — Receives `{ difficultyId }` from scene transition via Phaser's `init(data)` lifecycle hook
- **SettingsOverlay** — Full-screen backdrop (blocks input), centered panel with close button (✕), input mode toggle (Swipe/Mechanical), and "Back to Menu" button. Panel dimensions are screen-percentage based (`OVERLAY_PANEL_W_PCT`, `OVERLAY_PANEL_H_PCT`)
- **Hamburger menu** — ☰ icon at top-right, opens settings overlay. Replaced standalone ModeToggle circle (mode toggle now lives inside settings)
- **returnToMenu()** — Submits current streak before transitioning back to Start (preserves mid-streak records)
- **Depth enum** — Centralized z-ordering tiers in `constants.ts`: HUD (100), DEV (200), CONTROLS (300), OVERLAY (500). Components offset within their tier as needed (e.g. `Depth.DEV + 1`). Replaced all hardcoded depth values across ScoreDisplay, WindIndicator, DevOverlay, GameScene, StartScene, SettingsOverlay
- **PLAN.md** — Added server-validated leaderboard to v2 parking lot

## 2026-03-06

### Visual Overhaul + Swipe Refinement
- **Theme system** — `src/game/theme.ts` with typed `Theme` interface and `defaultTheme` object. All visual constants (colors, fonts, alphas, widths) in one swappable object. Game code imports from `theme`, never hardcodes style values.
- **Perspective grid room** — Replaced flat ground plane + sky gradient with a proper 3D-projected grid room. Floor grid + back wall, both using single `GRID_CELL` world-unit system. Vertical line count derived from visible area to guarantee full coverage. `GROUND_MAX_Z` reduced to 2000 (wall just past hard difficulty target).
- **Ball visual** — Color now from `theme.ball.base` (blue for dev contrast). Attempted sprite sheet spin animation (stripe ball, rotating cross) — deferred as a larger feature requiring proper 3D asset or physics-driven spin system.
- **Target** — Thick rim centered on near-hit/near-miss boundary (`TARGET_RADIUS`), width from `theme.target.rimWidth`. Ellipse squash via `theme.target.squash` for top-down perspective look.
- **UI theme wiring** — All 7 UI files migrated from hardcoded fonts/colors/buttons to `theme.ui.*`. Zero hardcoded style values remain outside `theme.ts`.
- **Swipe refinement** — Trim last 2 trail points (finger-lift noise). Least-squares linear fit over 12 points for angle computation (replaces first-to-last of 5). New constants: `SWIPE_TRIM_END`, `SWIPE_FIT_POINTS`.
- **Aim-then-fire mode** — New `SwipeModeType` (`"instant"` | `"aim"`). In aim mode: swipe sets angle + shows arrow, LAUNCH button appears below ball to fire. Toggle in settings overlay.
- **Dev logger** — `systems/logger.ts` gates `console.log` behind `DEV_MODE`.
- **Cleanup** — Removed dead constants: `GROUND_LINE_COUNT`, `GROUND_VERTICAL_COUNT`, `PROJECTILE_COLOR`, `TARGET_RING_WIDTH`, `GROUND_LINE_COLOR`, `GROUND_LINE_ALPHA`.

### Perfect Throw Button Fix + Throw Angle Arrow + Directory Restructure ✅
- **Perfect throw button fix** — Button now aborts in-flight animation and cancels landing pause timer before firing. Added `FlightAnimator.stop()` and `GameScene.resetForNextShot()`. Wind is NOT regenerated on reset so the perfect throw fires against the same wind its solved angle was computed from
- **Throw angle arrow** — New `ThrowAngle` component: post-throw arrow with arrowhead showing the exact input angle. Shown on throw, cleared on landing reset
- **Angle bounds shrink** — `ANGLE_BOUNDS_LENGTH_PCT` reduced 0.35 → 0.28 (20% shorter)
- **Directory restructure** — Replaced flat `ui/` with `components/` (leaf visual elements) and `composites/` (compositions like DevOverlay, SettingsOverlay). Sorting convention documented in DESIGN.md: scenes → systems → objects → composites → components
- **Component extraction** — DevOverlay decomposed into `ZoneOverlay` (arc-sector zone visualization), `PerfectThrowButton` (dev perfect-throw button), and a thin `DevOverlay` composition layer
- **Dead code removal** — Deleted unused `ModeToggle.ts` (replaced by mode toggle inside SettingsOverlay)
- **PR workflow** — Added code hygiene scan step to CLAUDE.md (step 2: one-pass review of diff for quick tidy-ups or TODOs)

### Flight Polish + Theme Completion + Bioluminescent Palette
- **Flight arc polish** — `ARC_SCALE` amplifies visual arc height (cosmetic only, endpoints preserved). `DIVE_EXPONENT` remaps time via power curve for hang-then-dive feel. Landing result unaffected.
- **Wind display** — Scale changed to 0–12 (obscures max cap from user). Arrow length still proportional.
- **Theme stragglers** — Wired all remaining hardcoded colors: ThrowAngle, AngleBounds, AngleIndicator, ZoneOverlay, MechanicalInput GO button, BootScene target color. Removed dead constants: `TARGET_COLOR`, `TARGET_TEXTURE_RADIUS`, `ANGLE_BOUNDS_COLOR`, `ANGLE_BOUNDS_ALPHA`.
- **Dev overlay toggle** — Settings panel button hides zone arcs, perfect throw button, and angle bounds. Throw angle arrow stays visible.
- **Settings panel layout** — Auto-layout: items array drives even spacing, add/remove buttons without hardcoding positions.
- **Bioluminescent palette** — Teal/cyan world + warm orange player elements. Two-color rule: teal = environment, orange = player actions. Soft glow alphas, deep ocean canvas. Wind indicator neutral gray.
- **Canvas renderer** — Switched from WebGL (`Phaser.AUTO`) to `Phaser.CANVAS`. WebGL approximates circles as polygons; Canvas 2D draws true anti-aliased curves via native `arc()`.
- **Live Graphics objects** — Replaced procedural texture generation (BootScene `generateTexture()`) with live Graphics for ball and target. Canvas 2D renders at native device resolution every frame — crisp on all screens without supersampling. Removed `TEXTURE_SCALE` constant and all plumbing.
- **Deleted** — `VISUAL_OVERHAUL.md` (temp planning doc, completed)

## 2026-03-07

### Wall Panel HUD, Dev Buttons, Target Elevation
- **Wall panel** — New `WallPanel` composite replacing ScoreDisplay + WindIndicator. Streak, best score, difficulty, wind arrow, feedback zone placeholder — all in a projected panel on the back wall
- **NavBar** — Extracted hamburger into NavBar component with proportional sizing
- **Depth layers** — Added GRID (0), WALL (1), GAME (10) to Depth enum. All game objects now have explicit depth
- **Dev throw buttons** — Row of tier buttons (P/H/NH/NM) replacing single Perfect button. DevOverlay owns `resolveZones()`, passes to ZoneOverlay and buttons
- **Zone resolution refactor** — ZoneOverlay is now a pure renderer (receives pre-computed ZoneInfo)
- **Target elevation** — `TARGET_Y = 200` lifts target off ground plane. Flight baseline interpolates to TARGET_Y. ShotResolver vy0 formula updated
- **Tuning** — Focal length 250→225, difficulty spread widened (600/1000/1400), landing tier percentages adjusted, ARC_SCALE 1.5→1.2
- **VS Code + lint** — Prettier, ESLint (TS + Prettier compat), extensions.json, format-on-save settings

## 2026-03-08

### Layout System + Typographic Scale + WallPanel Decomposition
- **Percentage-based layout** — `LAYOUT` constant with NAV_PCT (7%), HUD_PCT (20%), BUFFER_PCT (8%). `VANISH_Y_PCT` is a derived getter. Playable space = everything below 35%
- **Screen-space WallPanel** — Replaced world-space projection sizing with pixel budget from LAYOUT. Panel width 88% of screen, centered. Works across iPhone SE to Pro Max
- **Typographic scale** — `typeScale(screenHeight)` in theme.ts: heading (20–32px), body (12–20px), caption (10–16px). Migrated all 7 files with hardcoded font sizes
- **NavBar cleanup** — Home button (⌂) added, heading-size icons, dropped unused scene field
- **WallPanel decomposition** — Split into ScoreRow (streak/best/difficulty + state), WindDisplay (arrow + label), FeedbackZone (bordered rect placeholder). WallPanel reduced from 198 to 95 lines
- **Cleanup** — Removed unused `wallPanel.label` from theme, dead `ui.score.fontSize`, extra blank line in GameScene
- **Design decision** — Streak-driven difficulty replaces tier presets. One mode, one leaderboard. targetZ/targetX/launchX ramp with streak

### Juice Catalog Design Pass
- Walked through full game juice taxonomy: shape/motion, screen-level, particles/trails, color/light, temporal, audio, haptics
- Made per-technique decisions for each landing tier — what to use, where, and how
- Design philosophy: proportional, honest feedback. Gap between tiers is the design. PERFECT earns full treatment, MISS gets ball disintegration
- Key decisions: screen shake only on NEAR HIT/NEAR MISS (ring contact), zoom punch PERFECT only, chromatic aberration on MISS, ghost trail during flight, grid pulse on landing, procedural audio via Web Audio API, PERFECT tone always identical
- Wind visualization scoped: ambient particles + potential source element (design TBD)
- Consolidated everything into PLAN.md "Juice" section, deleted NEXT_UP.md and JUICE_CATALOG.md
- Added explicit code-guardrail to CLAUDE.md (no code until user gives green light)

### Constants Cleanup
- Reorganized `constants.ts` into labeled sections: projection, layout, flight, difficulty, target/scoring, wind, ball, input, rendering/dev, UI
- Naming consistency: `FORWARD_SPEED` → `FLIGHT_FORWARD_SPEED`, `PROJECTILE_RADIUS` → `BALL_RADIUS`, `PANEL_W_PCT` → `WALL_PANEL_W_PCT`
- Moved `NAV_PAD_X_PCT` into `LAYOUT` object, `MISS_BUFFER` to target/scoring section
- Removed vestigial `NavBar.bottom` property (layout derives from `LAYOUT.NAV_PCT`)

## 2026-03-09

### Juice Design Pass — Landing Feedback Layer
First implementation pass through the juice catalog. All effects scale with a logarithmic juice intensity curve driven by streak count.

**Juice intensity system**
- `juiceIntensity(streak)` — logarithmic 0–1 curve, ceiling at 5 streaks
- All visual effects multiply by this value — low streaks get subtle feedback, high streaks get full treatment
- Centralized in `constants.ts`, used across all juice components

**Tweened landing feedback text** (FeedbackZone)
- Animated text replaces empty bordered rect placeholder
- Per-tier color from theme (gold/teal/pink), sized to 85% of zone height
- NEAR_HIT → "HIT", NEAR_MISS → "MISS" label mapping
- Punch scale on PERFECT (1.5x, juice-scaled), instant appear + timed fade-out

**Score pop animations** (ScoreRow)
- Streak and best values get scale-pop tweens on change
- Two-stage chain: fast punch (Quad.easeOut) + slow settle (Sine.easeInOut)
- Pop intensity scales with juice intensity
- Labels uppercased (STREAK:/BEST:), difficulty display removed

**Camera effects** (GameScene)
- Zoom punch on PERFECT/HIT/NEAR_HIT (stepped down per tier)
- Screen shake on NEAR_HIT/NEAR_MISS/MISS (intensity varies)
- All config in `theme.cameraFx` — per-tier ceilings scaled by juice intensity

**Flight weight** (FlightAnimator)
- Launch bump: 1.12x scale at launch, decays over first 20% of flight
- Mass accretion: ball grows toward landing (1.1–1.8x, juice-scaled)
- Ball radius scales with juice intensity across throws (Projectile)

**Impact rings** (ImpactRing component)
- Ball impact ring: expanding circle at landing point
- Target impact ring: expanding from rim, perspective-squashed
- Separate theme configs for ball vs target (independently tunable)
- `tierColor()` helper shared with Target

**Target landing reaction** (Target)
- Color flash synced with feedback text hold duration
- Scale punch (1.05–1.2x, juice-scaled) via two-stage tween chain
- Spawns target impact ring at rim radius

**Theme additions**
- `juice` palette: gold/teal/pink in CSS string + hex number formats
- `feedback` config: per-tier color, punchScale, holdMs, fadeMs
- `cameraFx` config: per-tier zoom punch, shake intensity/duration
- `impactRing` config: separate ball and target sub-configs

**Cleanup**
- Removed touch pulse on swipe pickup (SwipeInput)
- Removed dead constants (`BALL_TOUCH_SCALE`, `BALL_TOUCH_PULSE_MS`)
- Removed dead `currentZ` field from Target

**Neutral palette + score flash** (ScoreRow, Target, theme)
- Unified off-white neutral color (`NEUTRAL = 0xddd8cc`) across target ring resting state, HUD text, score numbers
- Score numbers flash tier feedback color on scoring, synced with feedback text hold duration
- Target NEAR_MISS gets color pulse (pink) but no punch or impact ring
- `theme.juice.neutral`/`neutralHex` added to Theme interface

**Theme palette consolidation** (theme.ts)
- `css()` helper: define each color once as hex number, derive CSS strings
- Raw palette constants at top of file: GOLD, TEAL, PINK, NEUTRAL, ORANGE, GRID, VOID, DEEP, etc.
- All inline hex/CSS values replaced with constant references — zero duplicate color definitions

**Glitch effect** (GlitchFx component)
- Chromatic aberration: 3 RGB-offset full-screen rects
- Staggered scan-line fracture: 12 full-width slices with random height/position, jittered timing
- Fires on MISS (full intensity) and NEAR_MISS (50% intensity)
- Nothing at streak 0 — scales with juice intensity. Duration 140–260ms
- All constants in `theme.glitch`

**Flight trail** (FlightTrail component, FlightAnimator)
- Ring buffer of squashed afterimage ellipses during flight
- Stroke-only circles with bright channel dots at top/bottom poles
- Alpha, fade duration, and max count all scale with juice intensity (30–100%)
- Per-shape alpha via fillStyle for independent body/channel dot brightness

**Target channel** (Target)
- 5-layer draw: bottom exit ring, opaque dark backdrop (obscures grid/wall), vortex depth rings, channel side lines, top target ring
- Channel narrows toward base (spread: 0.6), length compensated for squash
- Vortex rings: 5 concentric circles interpolating down the channel, fading deeper

**Ball fade-through** (FlightAnimator)
- Ball dissolves as it passes through target ring — starts at 92% linear flight progress
- Uses un-warped linear progress (not dive-warped time) for consistent fade timing
- `Projectile.resetPosition()` now restores alpha

**Design discussions parked for next session**
- Particle vortex inside target channel (gravity well black hole aesthetic)
- Pulsing vortex rings as constant heartbeat (target feels alive)
- Ground/wall lines pulse with landing feedback (separate from target heartbeat)
- Three-layer Graphics split vs per-frame redraw for animated vortex
