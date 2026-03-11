# Paper Toss — Design Decisions

## Core Concept
Mobile-first projectile throwing game. Behind-the-thrower (first person) perspective. Swipe to throw at a distant target. Streak/endless mode — consecutive makes = score.

## Confirmed Decisions

### Input Modes
Two input modes sharing ±60° angle bounds and fixed center launch:

**Swipe mode** (default):
- Flick gesture: touch near ball → pulse feedback, flick upward → throw
- Ball does NOT follow finger. No throw line. No cancel flow.
- Angle from gesture direction, launchX fixed at center

**Mechanical mode**:
- Oscillating angle indicator sweeps ±60° continuously
- GO button fires with current angle
- Fixed center launch (lateral movement parked for v2)

**Shared rules:**
- **No trajectory/arc preview** — the skill IS reading the throw
- ThrowParams: `{ angle, launchX }` — angle from input, launchX always center
- Both modes implement `InputMode` interface (enable/disable lifecycle)
- Mode toggle (S/M) in top-right corner switches between modes
- Power and spin deferred from MVP

### Visual Style
- **Bioluminescent palette:** teal/cyan world + warm orange player elements. Deep ocean canvas, soft glow, not neon. Portal/Tron inspired but accessible.
- **Two-color rule:** teal = environment (grid, target, bounds), orange = player actions (ball, throw arrow, GO button). Wind = neutral gray.
- **Theme system:** all visual constants in `theme.ts`. Single import point, swappable for re-skinning. Zero hardcoded colors outside theme.
- **Canvas renderer:** `Phaser.CANVAS` instead of WebGL. Canvas 2D draws true anti-aliased curves; WebGL approximates circles as polygons.
- **Live Graphics:** ball and target are Graphics objects, not pre-rendered textures. Canvas 2D renders at native device resolution every frame — crisp on all screens.
- Fake 3D: 2D canvas with depth scaling to simulate perspective
- **Perspective grid room:** floor + back wall using `GRID_CELL` world-unit projection. Lines converge naturally via perspective math. Wall sits at `GROUND_MAX_Z`.
- **Target:** ellipse (squashed circle) with thick rim centered on near-hit/near-miss boundary
- **Ball:** solid orange from theme
- Spin animation deferred — needs physics-driven spin or proper 3D asset, not a texture hack

### Flight Animation
- **Arc amplification:** `ARC_SCALE` multiplies visual height of the arc (cosmetic only, endpoints preserved via baseline interpolation)
- **Dive effect:** `DIVE_EXPONENT` remaps time through a power curve — slow start, fast finish. Ball hangs at peak then accelerates into the target
- Both are presentation-layer tricks on top of the pre-computed analytical flight. Landing result is never affected.

### Physics
- Analytical parametric flight (no Phaser physics engine, no Euler integration)
- Internal 3D coordinates (x/y/z) projected to 2D screen
- Wind: lateral only (no headwind/tailwind). Random per throw, displayed as abstract 0–10 scale
- Y axis (height) is cosmetic — creates the parabolic arc but doesn't affect hit/miss
- Hit detection in world space: distance from landing (x, z) to target center
- Spin deferred from MVP

### Projectile Types (only Balanced active for MVP)
- **Heavy**: wind resistant, low spin response, drops faster
- **Balanced**: middle ground (MVP default)
- **Flippy**: high spin curve, wind affected, floats more

### Tech Stack
- Phaser 3 + Vite + TypeScript
- Mobile-first, touch input priority
- Capacitor wrapping for iOS/Android (later)

### Scoring
- Streak-based: consecutive hits increment counter, any miss resets to 0
- Five landing tiers: PERFECT (5% of hit channel), HIT (60%), NEAR HIT (100%), NEAR MISS (mirrored outward), MISS
- Tiers derived from two knobs: `TARGET_RADIUS` and `HIT_PCT`. Near-miss mirrors near-hit band outside the target
- PERFECT, HIT, and NEAR HIT all count as hits (score). NEAR MISS and MISS reset streak

### Difficulty — Streak-Driven Ramping (planned)
- **No difficulty tiers.** One mode, one leaderboard. Streak is the single point of pride.
- Distance (`targetZ`) ramps gradually as streak increases, up to a ceiling
- Target X and launch X may also vary per throw — every throw is a unique geometry problem
- Wind range auto-scales via physics: longer flight → more drift, for free
- Visual target size scales naturally via depth projection (further = smaller)
- Play area aspect ratio should be locked for universal feel across devices
- Currently: three presets still in code (Easy/Medium/Hard) pending rework

### Swipe Input (v1 rework)
- Flick gesture replaces ball-in-hand drag: touch near ball → pulse feedback, flick upward → throw
- Ball does NOT follow finger. No throw line. No cancel flow.
- Fixed center launch: ball always at width/2 for v1. Lateral launch is v2.
- Default input mode: swipe (was mechanical)

### Angle Bounds
- Two faint lines from ball at ±60° showing valid throw angle range
- Visible in both input modes (oscillator sweeps within the cone in mechanical mode)

### Flight Tuning (v1)
- Lateral multiplier (2.0x) decouples sideways speed from forward speed for dramatic banana arcs
- Launch velocity (`vy0`) computed per-shot from kinematics — adapts to difficulty distance automatically
- Wind range derived from physics — high floor ensures every throw has wind, cap guarantees solvability

### Flight Model
- Analytical (parametric path), not Euler simulation. Landing result computed at throw time; animation is cosmetic
- `flightTime(targetZ)` = `targetZ / FORWARD_SPEED` — distance-based, not gravity-based
- `vy0 = 0.5·g·duration − wy0/duration` — computed per-shot so arc fits flight time
- Flight path: `wx(t) = wx0 + vx0·t + ½·wind·t²`, `wy(t) = wy0 + vy0·t - ½·g·t²`, `wz(t) = vz·t`
- Enables future presentation tricks (exaggerated arcs, slow-mo, screen shake) without affecting outcomes

### Wind Solvability
- Wind cap derived from `NEAR_MISS_RADIUS + MISS_BUFFER` — guarantees missable space on both flanks
- `MISS_BUFFER` = 150 world units of clear space beyond near-miss zone at each angle boundary
- At max wind, near-miss zone runs right up to buffer line but never crosses it
- Every shot is solvable: there's always an angle that hits, and always room to miss on both sides

### Dev Overlay
- Arc-sector visualization of all landing zones: gold (perfect), green (hit/near-hit), red (near-miss), light red (miss), blue (buffer)
- Tier throw buttons (P/H/NH/NM) fire angles into specific landing bands
- DevOverlay owns the single `resolveZones()` call — passes results to ZoneOverlay and button callbacks
- Only visible when `DEV_MODE = true`

### Scene Flow
- Boot → Start → Game, with return path via settings overlay
- StartScene: title, difficulty selector (three buttons, selected highlights), per-difficulty high score, Play button
- GameScene receives difficulty via `init({ difficultyId })` from scene transition
- Settings overlay: hamburger (☰) top-right opens full-screen modal with mode toggle + "Back to Menu"
- Returning to menu submits current streak to HighScoreStore (preserves mid-streak records)

### High Score Persistence
- Per-difficulty best streak stored in localStorage under `paperToss.highScores`
- Defensive parsing: validates types, ignores unknown keys, defaults to zeroes on corruption
- Schema migration deferred — current shape is trivially simple; defensive load handles future v0→v1 naturally

### Z-Ordering
- Centralized `Depth` enum in constants.ts: GRID (0), WALL (1), GAME (10), HUD (100), DEV (200), CONTROLS (300), OVERLAY (500)
- Components offset within their tier as needed (e.g. `Depth.DEV + 1`)
- `const enum` — fully erased at compile time, zero runtime cost

### Vertical Layout System
- Percentage-based budget in `LAYOUT` constant: NAV (7%), HUD (20%), Buffer (8%)
- `VANISH_Y_PCT` is a derived getter (sum of the three zones = 0.35)
- Everything above the vanish line is UI; everything below is playable space (sacred)
- Playable space = court + launch area (65% of screen height)
- WallPanel is screen-space with a wall aesthetic — sized by pixel budget, not world-space projection

### Typographic Scale
- `typeScale(screenHeight)` returns three clamped tiers: heading (20–32px), body (12–20px), caption (10–16px)
- All text in the game pulls from this scale — zero hardcoded font sizes in game code
- Ensures readability from iPhone SE (667px) to Pro Max (932px)

### Directory Convention
One-pass sorting rule for new files — ask in order:
1. Extends `Phaser.Scene`? → `scenes/`
2. Pure logic, no rendering? → `systems/`
3. World-space entity (depth-projected)? → `objects/`
4. Composes other visual components? → `composites/`
5. Otherwise (draws one thing, owns one Graphics/Text/Sprite) → `components/`

Key distinctions:
- **objects** vs **components** = world space vs screen space
- **components** vs **composites** = leaf vs branch
- **systems** = never touches the display list

### Juice Philosophy
- **Proportional, honest feedback** — the gap between tiers is what makes the top feel special. Absence of feedback is itself feedback.
- Anti-patterns: aim assist, manufactured difficulty, every-hit-is-a-celebration, time pressure as fake difficulty
- Full technique catalog with per-tier decisions in PLAN.md under "Juice" section
- PERFECT earns the full treatment. MISS gets ball disintegration/glitch. The gradient between is the design.
- Audio via procedural Web Audio API — PERFECT tone is always identical (crisp, unmistakable), all other tiers get pitch jitter
- Rising pitch on streak — success tone climbs with consecutive hits

### Juice Intensity System
- `juiceIntensity(streak)` — logarithmic curve from 0–1, ceiling tunable (currently 5)
- All visual effects multiply by this value: scale pops, camera effects, flight weight, impact rings
- Early streaks ramp fast (biggest perceptual jump at 0→1), high streaks plateau
- Single multiplier drives the entire feel — the game "wakes up" as the player's streak builds

### Feedback Color Palette
- `theme.juice` defines three semantic colors: `perfect` (gold #ffcc44), `good` (teal #44ddcc), `bad` (pink #DD459B)
- HSL-matched: all three share similar saturation/lightness for palette cohesion
- Used by feedback text, impact rings, target color flash — any tier-coded visual
- Per-tier config in `theme.feedback` and `theme.cameraFx` for independent tuning

### Landing Feedback Architecture
- **Feedback text:** instant appear (no fade-in), punch scale on PERFECT only, timed hold + fade-out. Per-tier config in `theme.feedback`
- **Camera effects:** zoom punch for scoring tiers (PERFECT > HIT > NEAR_HIT), screen shake for contact tiers (NEAR_HIT, NEAR_MISS, MISS). Config in `theme.cameraFx`
- **Target reaction:** color flash synced with feedback hold duration, scale punch (two-stage tween), impact ring from rim. Only fires on NEAR_HIT or better
- **Ball impact ring:** expanding circle at landing point, separate theme config from target ring
- **Flight weight:** launch bump (1.12x, decays over 20% of flight) + mass accretion (grows toward landing, juice-scaled). Both cosmetic — multiply with perspective scale

### Theme Palette Architecture
- Every color defined once as a hex number constant at the top of `theme.ts`
- `css()` helper derives CSS string format from hex: `const css = (hex: number) => '#${hex.toString(16).padStart(6, "0")}'`
- Raw palette: GOLD, TEAL, PINK, NEUTRAL, ORANGE, GRID, VOID, DEEP, WIND_C, BLACK, PANEL + CSS-only button/text colors
- Zero duplicate color values — change one constant, everything updates

### Target Channel
- 5-layer draw order: bottom exit ring → dark backdrop → vortex depth rings → side lines → top ring
- Channel narrows toward base (spread: 0.6 of rim width), length extends 1.2 target radii (compensated for squash)
- Dark void backdrop obscures ground plane and wall grid lines
- Vortex rings interpolate size and alpha down the channel — conveys depth perspective
- Ball fades through the target ring like a basketball hoop (starts at 92% flight progress)
- Channel body effects are subtler than the target ring (lower stroke scale, lower alpha)
- **Planned:** particle vortex (gravity well aesthetic), pulsing rings (heartbeat), per-frame animation

### Glitch Effect
- Fires on MISS (full) and NEAR_MISS (50% intensity), nothing at streak 0
- Chromatic aberration: 3 full-screen RGB rects with horizontal offset
- Scan-line fracture: staggered full-width slices with random height/position, jittered timing
- WCAG safe: single flash under 3/second, low alpha (max 0.3), staggering reduces simultaneous coverage
- Duration scales with juice: 140ms (base) → 260ms (ceiling)

### Flight Trail
- Ring buffer of squashed afterimage ellipses — stroke-only circles with bright channel dots at poles
- Everything scales with juice intensity: alpha (30–100%), count, fade duration
- Per-shape alpha via fillStyle (not object alpha) for independent body/channel dot brightness

### Juice Flags & Dev Panel
- `juiceFlags` — per-effect runtime boolean toggles, checked at each trigger point with early return
- `juiceOverride` — when enabled, `juiceIntensity()` returns fixed value instead of computing from streak
- Dev tab in settings overlay (DEV_MODE only) with categorized toggles and JI slider
- All 11 effects independently toggleable: wind particles, speed lines, flight trail, flight weight, ball fade, impact rings, target reaction, camera FX, glitch, score pop, feedback text

### Speed Lines
- Velocity-oriented streaks behind ball during flight (SpeedLines component)
- Spawned opposite to velocity vector with perpendicular spread
- Orange color, intensity from screen-space speed × juice intensity
- Per-line fade, hard cap on active count

### Wind Particles
- Directional dots showing wind force during flight (WindParticles component)
- Speed distributed around wind-proportional base (gaussian-ish via Irwin-Hall)
- Size variation + 12% large particle variants for visual interest
- Cross-screen alpha fade (bright upwind, dims downwind)
- Active only during flight, graceful fade-out after, zero cost between throws

### Energy Discharge Concept (planned)
- **Ball charge:** glow expands and brightens during flight as ball moves through the field
- **Channel rework:** animated energy structure that pulses as ball approaches
- **Grid discharge:** on scoring hit, energy flows from landing point along grid lines — lightning-walk paths with heads + trails
- **Miss dispersion:** unfocused energy burst that dissipates without flowing through grid
- Near miss = miss behavior (no energy flows through channel)
- Each energy path has its own head and ghost trail that dissipates over time

## Open Decisions (for later)
- Play area aspect ratio (9:16? 9:19.5?)
- Obstacle design and placement
- Unlock system for projectile types
- Ambient sound vs soundtrack (affects audio ducking implementation)
