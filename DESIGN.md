# Paper Toss — Design Decisions

## Core Concept
Mobile-first projectile throwing game. Behind-the-thrower (first person) perspective. Swipe to throw at a distant target. Streak/endless mode — consecutive makes = score.

## Confirmed Decisions

### Input Modes
Two input modes, both obeying identical launch bounds (±60° angle, 25-75% horizontal):

**Swipe mode**:
- Touch within pickup radius of ball to grab (scale bump feedback)
- Ball follows finger while held, Y clamped (no dragging off-screen)
- Horizontal position clamped to launch bounds (25–75% screen width)
- Cross the throw line (dashed line at 62% height) with sufficient speed → throw fires
- Release below throw line → cancel with tweened snap-back to rest position
- Angle computed from last 5 trail points, launchX from pointer X at line crossing

**Mechanical mode** (default):
- ← → arrow buttons nudge ball horizontally (step size per press, clamped to bounds)
- Oscillating angle indicator (sine wave needle) sweeps ±60° continuously
- GO button fires with current angle + current ball X position
- RESET button (bottom-right corner) returns ball to center
- Layout: ← GO → clustered on one row below the ball, RESET separate

**Shared rules:**
- **No trajectory/arc preview** — the skill IS reading the throw
- ThrowParams: `{ angle, launchX }` — both clamped to shared bounds
- Both modes implement `InputMode` interface (enable/disable lifecycle)
- Mode toggle (S/M) in top-right corner switches between modes
- Power and spin deferred from MVP

### Visual Style
- Abstract, minimal
- Procedural graphics for now — visual polish is a priority but not yet scoped
- Fake 3D: 2D canvas with depth scaling to simulate perspective
- Ground plane with perspective grid lines — dev scaffold for spatial readability, not final art

### Physics
- Hand-rolled Euler integration (no Phaser physics engine)
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
- Binary hit/miss — no accuracy tiers for now

### Difficulty (future)
- Target distance controls difficulty: closer = shorter flight, less wind effect, bigger apparent target
- Lateral target offset adds further complexity (not straight ahead)
- Play area aspect ratio should be locked for universal feel across devices

## Open Decisions (for later)
- Play area aspect ratio (9:16? 9:19.5?)
- Obstacle design and placement
- Unlock system for projectile types
- Visual polish direction (colors, effects, juice)
- Sound design
- Haptic feedback on throw/hit
- Swipe mode: may be binned if feel can't be tuned right. Mechanical mode is primary
