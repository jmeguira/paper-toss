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
- Abstract, minimal
- Procedural graphics for now — visual polish is a priority but not yet scoped
- Fake 3D: 2D canvas with depth scaling to simulate perspective
- Ground plane with perspective grid lines — dev scaffold for spatial readability, not final art

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

### Difficulty (future)
- Target distance controls difficulty: closer = shorter flight, less wind effect, bigger apparent target
- Lateral target offset adds further complexity (not straight ahead)
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
- FLIGHT_LAUNCH_VY bumped to 1400 (from 900) — ball launches from rest position (85%) not throw line (62%)
- Wind range derived from physics — high floor ensures every throw has wind, cap guarantees solvability

### Flight Model
- Analytical (parametric path), not Euler simulation. Landing result computed at throw time; animation is cosmetic
- `flightTime(startHeight)` shared helper — quadratic formula accounting for ball starting above ground
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

## Open Decisions (for later)
- Play area aspect ratio (9:16? 9:19.5?)
- Obstacle design and placement
- Unlock system for projectile types
- Visual polish direction (colors, effects, juice)
- Sound design
- Haptic feedback on throw/hit
