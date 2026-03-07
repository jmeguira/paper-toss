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

### Difficulty
- Distance is the single difficulty knob: `targetZ` controls flight time, wind drift, and visual target size
- `flightTime = targetZ / FORWARD_SPEED` — duration scales linearly with distance, wind drift scales quadratically
- `vy0` computed per-shot from kinematics so the arc fits the flight time (not a constant)
- Three presets: Easy (700), Medium (1200), Hard (1800). `FORWARD_SPEED = 810` preserves current Medium feel
- Wind range auto-scales via physics: shorter flight → higher maxWind allowed but less actual drift
- Visual target size scales naturally via depth projection (closer = bigger)
- Lateral target offset adds further complexity (not straight ahead — v2)
- Play area aspect ratio should be locked for universal feel across devices

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
- Perfect throw button fires the solved angle — PERFECT hit every time
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
- Centralized `Depth` enum in constants.ts: HUD (100), DEV (200), CONTROLS (300), OVERLAY (500)
- Components offset within their tier as needed (e.g. `Depth.DEV + 1`)
- `const enum` — fully erased at compile time, zero runtime cost

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

## Open Decisions (for later)
- Play area aspect ratio (9:16? 9:19.5?)
- Obstacle design and placement
- Unlock system for projectile types
- Visual polish direction (colors, effects, juice)
- Sound design
- Haptic feedback on throw/hit
