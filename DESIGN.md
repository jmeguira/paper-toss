# Paper Toss — Design Decisions

## Core Concept
Mobile-first projectile throwing game. Behind-the-thrower (first person) perspective. Swipe to throw at a distant target. Streak/endless mode — consecutive makes = score.

## Confirmed Decisions

### Throw Mechanic (Pokemon Go style)
- See the projectile only — no hand/arm visible
- Single swipe gesture encodes direction, power, and spin
- **No trajectory/arc preview** — the skill IS reading the throw
- Subtle feedback during swipe: scale pulse (power), tint shift (intensity), lateral offset (direction)
- Swipe down = cancel/readjust

### Visual Style
- Abstract, minimal
- Procedural graphics (no image assets for MVP)
- Fake 3D: 2D canvas with depth scaling to simulate perspective
- Ground plane with perspective grid lines, target rings in the distance

### Physics
- Hand-rolled Euler integration (no Phaser physics engine)
- Internal 3D coordinates (x/y/z) projected to 2D screen
- Wind affects flight (lateral + headwind/tailwind)
- Spin from swipe curvature affects trajectory (Magnus effect approximation)

### Projectile Types (only Balanced active for MVP)
- **Heavy**: wind resistant, low spin response, drops faster
- **Balanced**: middle ground (MVP default)
- **Flippy**: high spin curve, wind affected, floats more

### Tech Stack
- Phaser 3 + Vite + TypeScript
- Mobile-first, touch input priority
- Capacitor wrapping for iOS/Android (later)

## Open Decisions (for later)
- Obstacle design and placement
- Unlock system for projectile types
- Scoring tiers (ring accuracy: inner/middle/outer)
- Visual polish direction (colors, effects, juice)
- Sound design
- Haptic feedback on throw/hit
