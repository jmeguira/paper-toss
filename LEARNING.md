# Learning Notes

## Project Tooling

### package.json
- Equivalent of `requirements.txt` + `pyproject.toml` — declares dependencies and scripts
- `"private": true` prevents accidental publish to npm (JS's PyPI)
- `"type": "module"` enables modern `import/export` syntax (vs old `require()`)
- `"scripts"` is like a Makefile — `npm run dev`, `npm run build`
- `dependencies` = runtime, `devDependencies` = build-time only (don't ship in final game)

### Vite
- Dev server + bundler. Like if `flask run` and `pyinstaller` had a baby
- In dev: serves `.ts` files directly, compiles to JS on the fly when the browser requests them. No rebuild step — save file, see change instantly (hot module reload)
- In production (`npm run build`): bundles everything into optimized files, tree-shakes unused code, minifies
- Why not just `<script>` tags? Vite handles TypeScript compilation, `import/export` resolution, auto-reload, and load order — all with near-zero config
- `base: "./"` in config = use relative paths (avoids issues if deployed to a subdirectory)

### tsconfig.json
- Like `mypy.ini` — configures the TypeScript compiler
- `strict: true` = all strict type checks on. The big win over JS: variables have types enforced at compile time instead of discovering mismatches at runtime
- `skipLibCheck: true` = don't type-check inside node_modules. We trust libraries to type themselves correctly
- `moduleResolution: "bundler"` = let Vite handle import resolution

### node_modules
- Equivalent of `.venv/lib/python3.x/site-packages/` — where all installed dependencies live

## TypeScript / JS Concepts

### TS vs JS
- JS: anything can be anything. You find type mismatches at runtime
- TS: types enforced at compile time. `strict: true` makes this rigorous — same philosophy as Python type hints + strict mypy, but enforced by default

### Syntax mapping (Python → TS)
- `self` → `this`
- `super().__init__(...)` → `super(...)`
- `def method(self)` → `method(): void`
- `_private_method` (convention) → `private method()` (enforced by compiler)
- `from x import y` → `import { y } from "./x"`
- Nothing is public unless you `export` it (inverse of Python where everything is public by default)
- `if __name__ == "__main__"` → the entry point file (`src/main.ts`) loaded by the HTML `<script>` tag

## Browser / Web Concepts

### index.html
- The entry point the browser loads. Pulls in CSS and the main script
- `viewport` meta tag tells mobile browsers to use actual screen width; `user-scalable=no` prevents pinch-to-zoom interfering with swipe gestures
- `<script type="module">` enables `import/export` and lets Vite intercept/compile the TS

### Canvas
- An HTML element that gives you a blank rectangle to draw pixels on — like a pygame window
- All browser games work this way: one `<canvas>`, redrawing 60 times per second

### WebGL vs Canvas 2D
- Canvas 2D: simple drawing API, CPU-based. Like pygame's `surface.blit()`
- WebGL: talks to GPU directly, much faster for games
- `Phaser.AUTO` picks WebGL if available, falls back to Canvas 2D. We never interact with either directly

### CSS
- `public/` directory = files served as-is, no Vite processing. `public/style.css` → `/style.css`
- CSS is cascading: rules apply top-to-bottom, more specific selectors win. `*` is least specific, so anything overrides it
- Our CSS is just a reset (kill default margins, prevent scrolling, black background). All visuals are on Phaser's canvas, not HTML/CSS

## Phaser Concepts

### Phaser.Game
- The engine. Creating `new Phaser.Game(...)` does everything: creates the canvas, starts the 60fps game loop (input → update → render), manages scenes, handles sprites and input
- Like choosing pygame over raw SDL — batteries-included game framework

### Scenes
- Self-contained game states (boot screen, menu, gameplay). Like rooms you walk through
- Lifecycle methods called by Phaser automatically:
  - `preload()` — load external assets (images, audio from disk). Pauses scene until done
  - `create()` — runs once when scene starts. Setup goes here
  - `update()` — runs every frame (60fps). Game logic goes here
- Scenes reference each other by string key: `super("Boot")` registers the key, `this.scene.start("Game")` transitions to it
- First scene in the `scene: [...]` array starts automatically

### Sprites
- A visual game object: has position, scale, rotation, tint. The basic unit of "thing you can see and manipulate"
- Like a pygame `Surface` you `blit`, but with built-in transform properties

### Procedural Textures (BootScene)
- Instead of loading image files, we draw shapes in code and snapshot them into reusable textures
- `this.add.graphics()` creates a temporary drawing surface
- `gfx.generateTexture("name", w, h)` snapshots the drawing into Phaser's texture cache under a string key
- `gfx.destroy()` frees the temporary drawing surface after we've captured the texture — like closing a file handle
- Any scene can then create sprites from cached textures: `this.add.sprite(x, y, "projectile")`
- If we ever swap to hand-drawn images, only the texture generation changes — sprites downstream don't care where textures came from

### Textures vs Sprites (the stamp analogy)
- Texture = rubber stamp carved once, stored in memory
- Sprite = an impression of that stamp placed on screen, with its own position/scale/rotation/tint
- Constants define the stamp's resolution (pixel size at generation). Actual on-screen size is controlled by the sprite's `scale` at runtime
- Trade-off: bigger texture = sharper when scaled up but more memory. For simple geometric shapes at modest sizes, not a concern
- Q: "Shouldn't target size be dynamic, not a constant?" → Constants set the texture blueprint dimensions. The sprite created from the texture is what game logic manipulates (position, scale, alpha, tint) at runtime. Constants never change; sprites do.

### fillCircle(x, y, radius) — why radius appears three times
- The three params are: x center, y center, radius — not radius three times
- With a texture sized `radius * 2`, the center is at `(radius, radius)` — one radius in from each edge. Same number, different meaning each time

### Graphics game object
- Phaser's freehand drawing tool — draw lines, circles, rectangles directly on screen
- Different from sprites: sprites display a texture, Graphics draws shapes programmatically
- Used for things like ground plane lines where there's no reusable "stamp" to make — just lines drawn in place

### preload() vs create()
- `preload()` loads external files (images, audio) from disk. Phaser pauses the scene and shows a loading bar while downloading
- `create()` runs once after preload. Setup and procedural generation goes here
- We skip preload entirely because we draw textures in code instead of loading image files

## Fake 3D Projection

### The core formula
- `scale = focalLength / (focalLength + z)` — one line does all the perspective
- z = distance from camera. Things far away (large z) get small scale, things close (z≈0) get scale≈1
- Two separate steps: (1) compute scale from z, (2) map that scale onto actual screen pixel coordinates

### Focal length
- Not pixels — an arbitrary unit in our fake 3D coordinate system
- Controls how "zoomed in" the camera feels: small = wide-angle GoPro, large = flat telephoto
- Only meaningful relative to z values. 300 is a starting point — tune by feel
- At z = focalLength, scale = 0.5 (half size). At z = 2x focalLength, scale = 0.33

### Vanishing point
- Where parallel lines converge at "infinity" — set at 35% from top of screen
- "Up on screen" = "far away," not "above you." Correct perspective: horizon (vanishing point) is at eye level, ground stretches down from there to your feet
- The farthest drawn lines may not reach the vanishing point (only z=∞ would). Solved by increasing GROUND_MAX_Z

### Target distance
- Target sits at a specific z-depth, NOT at the vanishing point (which is infinity)
- Like a basketball hoop — far, but not at the horizon
- Q: "Does it make sense for the target to be at the vanishing point?" → No. Vanishing point = infinity. Target is at a specific playable distance

### draw() vs update()
- `draw()` in GroundPlane runs once in the constructor — the lines are static shapes that just sit there
- Only code inside a scene's `update()` runs every frame (60fps)
- Static visuals: draw once. Animated/moving things: redraw in update()

### Dynamic resizing
- Phaser handles canvas resizing via `Scale.RESIZE`, but our objects calculate positions once in their constructors
- Fine for mobile (viewport doesn't change mid-game), needs fix for desktop — tracked in TODO.md

### Class properties — fire-and-forget vs stored
- GroundPlane and Target are created with `new X(this)` and never referenced again — they draw themselves and sit
- Projectile is stored as `private projectile!: Projectile` because other systems (swipe, flight, hit detection) need to manipulate it
- The `!` is a "definite assignment assertion" — tells TS "this gets set in create(), not the constructor, trust me"

### Event-driven input (Phaser pointer events)
- `scene.input.on("pointerdown", callback, this)` — Phaser calls callback on touch/click. Third arg binds `this` context
- `pointer` works for both touch and mouse — no separate handling needed
- Click-drag-release = finger-down-move-up. Same events, same code

### Callback pattern
- `public onThrow: ((params: ThrowParams) => void) | null = null` — a property that holds a function or null
- GameScene sets it: `swipe.onThrow = (params) => { ... }`
- SwipeInput calls it: `this.onThrow?.(params)` — the `?.` is optional chaining (does nothing if null instead of crashing)
- Python equivalent: `self.on_throw and self.on_throw(params)`

### ThrowParams as abstraction boundary
- `interface ThrowParams { angle: number }` — the contract between input and flight systems
- Flight simulator consumes this interface, never knows whether it came from a swipe, slider, button, or keyboard
- Adding new input methods later doesn't touch flight logic

### Swipe → angle (radians)
- A swipe is two points (start, end). The line between them is the vector
- `Math.atan2(dx, -dy)` converts that vector to an angle: straight up = 0, right = positive, left = negative
- Radians (not degrees) because every math function (`sin`, `cos`, `atan2`) expects radians natively
- The `-dy` flips the y-axis: screen coordinates go down, but "up" should be zero angle

### Screen-relative thresholds
- Fixed pixel values (e.g., 30px) mean different things on different screens
- Percentage of viewport height gives consistent physical feel across devices
- e.g., `BALL_REST_Y_PCT = 0.85` → ball position adapts to any screen height

### Swipe validation — distance vs speed
- Distance alone is insufficient: a slow 200px drag and a fast 200px flick feel completely different
- Speed = distance / time. Below a minimum speed threshold, the gesture is a drag, not a throw
- Three cancel gates in order: (1) swiped down, (2) too short, (3) too slow

## Git / Tooling

### Pre-commit hooks
- Shell script in `.git/hooks/pre-commit` — runs before every commit
- `.git/hooks/` is NOT tracked by git (local only)
- Solution: tracked `hooks/` directory + `setup.sh` that copies hooks into place. Run once per machine
- `$?` = exit code of last command (0 = success). `-ne` = "not equal". `[ ... ]` = shell test syntax

### Git hooks beyond pre-commit
- commit-msg: validate commit message format
- pre-push: run tests before sharing code (heavier than pre-commit)
- post-merge: auto-run npm install after pull if deps changed
- pre-rebase: prevent rebasing published branches

### Branches after merge
- Deleting a merged branch is safe — commit history is preserved on main via commit hashes
- Branches are just movable labels pointing at commits. Deleting the label doesn't delete the history

## Event-Driven Architecture (Step 6)

### The "swimmy" feeling — backend vs game dev mental models
- Backend Python: request → process → response. Linear, one entry point, one exit
- Game code is event-driven: no `main()` that runs top to bottom. Objects *react* to things happening
- Control flow feels scattered because it IS — multiple concurrent paths (pointer events, update loop, mode toggles) all touching the same objects
- Think in three layers:
  - **GameScene** (orchestrator): who exists, who's active, who talks to whom. Creates objects, wires callbacks, switches modes, calls update() each frame
  - **Systems** (SwipeInput, MechanicalInput): listen for input, compute ThrowParams, hand them off. Know NOTHING about what happens after
  - **Objects + UI** (Projectile, ThrowLine, etc.): dumb. No initiative. Only do what they're told
- Data flows UP (input events → systems → GameScene via callbacks). Commands flow DOWN (GameScene → systems → objects)
- Python analogy: GameScene = Django view (coordinates responses), Systems = service classes (business logic), Objects = models (state + methods, no initiative)

### The `InputMode` interface — Strategy pattern
- `interface InputMode { enable(); disable(); destroy() }` — a contract like a Python ABC
- Both SwipeInput and MechanicalInput implement it, so GameScene can swap between them without caring which one it's talking to
- `enable()` hooks up event listeners, `disable()` unhooks them (object stays alive but deaf), `destroy()` tears down Phaser game objects entirely
- The throw logic doesn't live in any lifecycle method — it's in the `onThrow` callback, wired up by the consumer

### Callback pattern (deeper)
- Hand a function to an object: "call this when something happens." The object doesn't know what the function does
- `onThrow?.()` — the `?.` is optional chaining. If nobody wired a callback, safely does nothing
- Python equivalent: `button.config(command=my_function)` or `self.on_throw and self.on_throw(params)`
- Keeps systems reusable: SwipeInput has zero knowledge of game rules beyond "compute angle and position"

### Union types
- `type InputModeType = "swipe" | "mechanical"` — only these two string values are valid
- Python equivalent: `Literal["swipe", "mechanical"]`
- TypeScript rejects any other string at compile time

### Config interfaces with optional fields
- `fillAlpha?: number` — the `?` makes the field optional. Python equivalent: `fill_alpha: float = 0.4`
- Defaults applied via destructuring in constructor: `const { fillAlpha = 0.4 } = config`
- Better than 8 positional constructor args — named, self-documenting, order-independent

### Definite assignment assertion (`!`)
- `private projectile!: Projectile` — tells TS "this gets set in create(), not the constructor, trust me"
- Phaser's lifecycle means create() runs after construction. TS can't see that, so `!` suppresses the warning

### Phaser tweens
- `scene.tweens.add({ targets, x, y, duration, ease })` — Phaser's animation engine
- Pass target object + property values to animate TO, Phaser interpolates from current values
- `"Back.easeOut"` gives slight overshoot — slides past target, then settles. More physical than linear
- Like CSS transitions but in code; Python analogy: pygame manual lerp, but Phaser does all per-frame interpolation

### Phaser.Math.Clamp
- `Phaser.Math.Clamp(value, min, max)` — constrains a value to a range
- Python equivalent: `max(minimum, min(value, maximum))`

### Delta-time scaling
- `delta` (ms since last frame) is NOT constant — Phaser measures actual elapsed time via browser's requestAnimationFrame
- ~16.67ms at 60fps, ~8.3ms at 120Hz, higher during GC hiccups
- Always multiply by `delta / 1000` (convert to seconds) for consistent real-world speed regardless of frame rate
- Without it: animation runs faster on 120Hz screens, slower on laggy phones
- Phaser caps delta to prevent spiral-of-death (e.g. tab backgrounded → 500ms frame → teleportation)

### Edge detection pattern
- `if (prevY > lineY && pointer.y <= lineY)` — trigger on the *transition*, not while above
- Only fires once when crossing, not every frame the condition is true
- Same concept as hardware interrupts: react to the *change*, not the state

### Sliding window trail
- `trail.shift()` when at max size — removes oldest, keeps recent. Like Python's `deque(maxlen=60)`
- Old approach: stop recording after 60 points. New: always has recent data, even on long drags
- Speed computed from last 5 points (~83ms at 60fps) — measures instantaneous speed at crossing, not average over whole drag

### setInteractive() — opt-in events
- Phaser game objects ignore pointer events by default
- Must call `setInteractive()` to make an object respond to pointerdown/up/over/out
- Performance benefit: only objects that need input are checked against pointer position each frame

### Event context binding (the `this` problem)
- `scene.input.on("pointerdown", this.onPointerDown, this)` — third arg binds `this` context
- Without it, `this` inside the handler would be undefined (JS doesn't auto-bind like Python's `self`)
- `on` / `off` for subscribe/unsubscribe — Python equivalent: `signal.connect()` / `signal.disconnect()`

### Phaser Graphics arc angles
- Phaser measures angles from 3 o'clock position (standard math convention: 0 = right)
- To center on 12 o'clock: offset by `-Math.PI / 2` (rotate 90° counterclockwise)
- `cos`/`sin` convert angle + radius to x,y endpoint — basic trig for drawing needles, pointers, etc.

### WebGL vs Canvas 2D (deeper)
- WebGL is the newer, GPU-accelerated API. Canvas 2D is older, CPU-based. Both widely supported.
- Phaser's `Phaser.AUTO` tries WebGL first, falls back to Canvas 2D silently.
- Some Phaser APIs (like `fillGradientStyle()`) are WebGL-only and silently no-op on Canvas fallback.
- Strip-based gradient rendering (stacking thin rects with interpolated colors) works on both renderers.

### Perspective projection — world-unit grids
- Instead of arbitrary line counts, define a `GRID_CELL` size in world units and project everything through the perspective formula.
- Floor lines at `z = i * GRID_CELL`, verticals at `worldX = j * GRID_CELL` — both naturally converge via `scale = f / (f + z)`.
- Back wall at `z = GROUND_MAX_Z`: same worldX positions as floor verticals, but straight vertical (flat surface, constant z).
- To guarantee full line coverage: calculate visible world extent from the most zoomed-out surface (the wall), derive line count from that.

### Least-squares linear fit for swipe angle
- Instead of first-to-last slope from 2 points, fit a line through all recent points to average out jitter.
- Fit `x` as a function of `y` (not `y(x)`) because swipes are mostly vertical — `y(x)` would blow up for near-vertical gestures.
- Formula: `slope = (nΣxy - ΣxΣy) / (nΣy² - (Σy)²)` — same as `np.polyfit(y, x, 1)` in Python.
- The slope `dxdy` = lateral drift per unit vertical travel. Convert to angle with `atan2(-dxdy, 1)`.

### Phaser sprite sheet animation
- Generate multiple frames side-by-side in one texture, register individual frame regions with `texture.add(frameIndex, ...)`.
- `this.anims.create({ key, frames, frameRate, repeat: -1 })` defines a looping animation.
- `sprite.play({ key, startFrame, timeScale })` plays with variation. `timeScale` controls speed.
- Negative `timeScale` does NOT work for reverse playback in Phaser — create a separate animation with reversed frame order instead.

### Underscore prefix for unused params
- `_pointer` in `onPointerUp(_pointer)` — tells TypeScript "I know this exists, I'm not using it"
- Python equivalent: `_` in `for _ in range(10)`

## Flight & Physics (Steps 7–9)

### Euler integration
- Simplest physics simulation: each frame, update velocity from acceleration, update position from velocity
- `vy -= gravity * dt; y += vy * dt` — same pattern on each axis
- Error per frame is proportional to dt² — at 60fps, negligible for a game
- "Euler overshoot": ball may jump past y=0 in a single frame. Catch with `wy <= 0` check and clamp

### 3D-to-2D projection
- `scale = FOCAL_LENGTH / (FOCAL_LENGTH + z)` — same formula used by GroundPlane, Target, and FlightSimulator
- `screenX = width/2 + wx * scale` — lateral offset shrinks with distance
- `groundY = vanishY + (height - vanishY) * scale` — where the ground is at this depth
- `screenY = groundY - wy * scale` — lift above ground by height, also scaled by perspective
- At z=0 (camera): scale=1, full size. At z=FOCAL_LENGTH: scale=0.5, half size

### World space vs screen space
- Hit detection uses world coordinates, not screen pixels
- Perspective distorts screen positions — things near the vanishing point look bunched together
- A "near miss" on screen might be far off in world space, and vice versa
- Checking in world space keeps the feel consistent regardless of where the ball lands

### Wind as lateral acceleration
- Same pattern as gravity but on the X axis: `vx += windForce * dt`
- Wind is constant acceleration, so it compounds over time — longer flights get pushed more
- Angled throws have lower forward speed (vz = speed * cos(angle)), so they're in the air longer and more affected by wind

### cos(angle) effect on forward speed
- `vz = FLIGHT_SPEED * cos(angle)` — angled throws travel forward slower
- At 30°: 87% forward speed. At 60°: 50%. Compensating for wind inherently makes throws harder
- This creates natural difficulty layering without any explicit difficulty code

### Decoupling lateral and forward speed
- Problem: single FLIGHT_SPEED controls both sideways (sin) and forward (cos) velocity
- Increasing FLIGHT_SPEED for bigger lateral arcs also shortens flight time (faster forward), reducing wind effect
- Solution: separate lateral multiplier — `vx = SPEED * MULT * sin(angle)`, `vz = SPEED * cos(angle)`
- This lets angle displacement be dramatic without changing how long the ball is in the air

### Wind acceleration vs angle velocity — the solvability trap
- Launch angle gives a one-time initial velocity (linear displacement: v×t)
- Wind is constant acceleration (quadratic displacement: ½at²). Over time, wind always wins
- Worse: steeper angles to compensate slow forward speed (cos drops), giving wind MORE flight time
- Diminishing returns — there's a mathematical ceiling on how much wind angle can counteract
- Need to either cap wind dynamically or change the wind model to keep every shot solvable

### Phaser tweens — yoyo
- `yoyo: true` in a tween config makes it animate to the target value then back to the start
- Used for the flick pulse: scale 1→1.08→1 in 80ms — quick visual acknowledgment without moving the ball
- Like a CSS keyframe that goes 0% → 50% → 100% automatically

## Analytical vs Simulation Flight (Session 4)

### Why analytical beats Euler for deterministic games
- Euler integration accumulates error each frame — the ball drifts from where math says it should land
- The error is proportional to `windForce × dt × flightTime` — small per frame, significant over a full flight
- Analytical: compute exact landing position at throw time, animate the path as a parametric curve
- Result: solver, overlay, wind cap, and flight all use the same equations — single source of truth
- Frame-rate independent: same path at 30fps or 144fps. No accumulated state, no drift

### Parametric path evaluation
- Store path parameters at launch: `wx0, wy0, vx0, vy0, vz, wind, duration`
- Each frame: `wx(t) = wx0 + vx0·t + ½·wind·t²`, `wy(t) = wy0 + vy0·t - ½·g·t²`, `wz(t) = vz·t`
- Pure function of elapsed time — no mutable velocity state, no integration loop
- Landing result known at launch, just delayed until animation finishes

### Decoupling physics from presentation
- When flight result is pre-computed, the animation is "just a movie"
- Can exaggerate arcs, add slow-mo near target, screen shake — without affecting outcomes
- Future mid-flight mechanics (gusts, obstacles) = split the analytical path into segments at event boundaries, or compute ray-curve intersections

### Flight time with starting height
- Ball starts above ground (`wy0 = height × 0.15`), so actual flight time is longer than `2·vy/g`
- Correct formula: `T = (vy + √(vy² + 2·g·h)) / g` (positive root of the quadratic)
- This affects vz (forward speed), wind drift, solved angle — everything that depends on flight duration
- Original code used zero-height time everywhere, causing z-overshoot and incorrect solver predictions

### Distance-driven flight time — the difficulty insight
- Old model: `flightTime(startHeight)` used a gravity quadratic. Duration was ~1.48s regardless of target distance
- Problem: changing `targetZ` was cosmetic — wind drift was identical at all distances
- Fix: `flightTime = targetZ / FORWARD_SPEED`. Now distance IS duration. Wind drift `= ½·wind·t²` scales with distance squared
- `FORWARD_SPEED = 810` chosen to preserve Medium feel exactly: `1200 / 810 ≈ 1.48s`

### Per-shot computed values vs constants
- `vy0` was a hardcoded constant (`FLIGHT_LAUNCH_VY = 1400`). Works fine for one distance
- With variable distance, the arc must fit the flight time: `vy0 = ½g·t − wy0/t` (solve kinematic equation for launch velocity)
- Easy: ~725 (flat toss), Medium: ~1400 (current), Hard: ~2168 (high arc). Physics creates the right feel automatically

### `as const` narrowing trap
- `DIFFICULTIES = [...] as const` narrows each element to its literal type
- `difficulty = DEFAULT_DIFFICULTY` infers `{ id: "MEDIUM", label: "Medium", targetZ: 1200 }` — not the union
- Assigning a different element (`DIFFICULTIES[0]`) fails because `"EASY"` isn't assignable to `"MEDIUM"`
- Fix: explicitly type as the union: `difficulty: (typeof DIFFICULTIES)[number] = DEFAULT_DIFFICULTY`
- Python analogy: like `Literal["MEDIUM"]` vs `Literal["EASY", "MEDIUM", "HARD"]` — TS infers the narrowest type from the initializer

### Derived constants pattern
- Landing tiers derived from two knobs: `TARGET_RADIUS` and `HIT_PCT`
- `HIT_RADIUS = TARGET_RADIUS × HIT_PCT`, `NEAR_MISS_RADIUS = TARGET_RADIUS × (2 - HIT_PCT)`
- Change one value, all zones scale proportionally. Near-miss mirrors the near-hit band outward
- Same principle as CSS variables or Python dataclass computed fields

## localStorage & Client Security (Session 5)

### `private` vs `#private` — compile-time vs runtime
- TypeScript's `private` keyword is erased at compile time. The emitted JS has no access control — `(obj as any).secret` bypasses it
- JavaScript's `#field` syntax is enforced by the JS engine at runtime. No casting tricks work
- `private` is a developer guardrail (like Python's `_underscore` convention, but compiler-enforced). `#` is a security boundary
- For internal code talking to itself, `private` is fine. For adversarial contexts, use `#`

### localStorage is always user-editable
- Anyone can open DevTools → Application → Local Storage and edit values directly
- No injection risk (it's a string→string store, no query language or interpreter)
- The danger is malformed data that crashes your code — defensive parsing is the defense
- Validate types, ranges, and keys explicitly. Default to safe values on any parse failure

### Prototype pollution defense
- If `load()` blindly does `Object.assign(this.data, parsed)`, an attacker could store `{"__proto__": {"isAdmin": true}}` and pollute the object prototype
- Defense: only read explicitly named keys from parsed data, never iterate unknown keys into your objects
- This is the JS equivalent of SQL injection — data that changes program behavior through shared mutable structures

### Schema migration for localStorage
- If the stored data shape changes (e.g., adding per-difficulty stats), you need a migration
- Pattern: add a `version` field, check on load, run migration functions chained v(N)→v(N+1)
- Don't add preemptively — current defensive parsing handles v0→v1 naturally (bad data → fresh start)

### `Partial<Record<K, V>>` pattern
- `Record<DifficultyId, number>` = all keys must exist. `Partial<...>` = any key might be missing
- Access with `?? 0` to default missing keys. Python equivalent: `dict.get(key, 0)`

### Leaderboard tamper resistance — the spectrum
1. **Client-submitted scores + server storage** — easy to build, easy to cheat (`curl POST { streak: 9999 }`)
2. **Server-side replay validation** — client sends inputs (angle, wind, difficulty), server re-runs `resolveShot()` to verify. Much harder to fake
3. **Server-authoritative simulation** — server generates wind, validates each throw live. Impossible to cheat. Most work to build
- For deterministic physics games, option 2 is the sweet spot — the math is cheap to replay server-side

## UI Patterns (Session 5)

### Phaser scene data passing (`init()`)
- `this.scene.start("Game", { difficultyId: "HARD" })` — second arg passed to target scene's `init(data)` method
- `init()` fires before `create()` in Phaser's lifecycle, so data is available during setup
- Python equivalent: like calling a class constructor with kwargs, but split across two lifecycle hooks

### Directory convention — sorting rule for new files
- One-pass decision: Phaser.Scene → `scenes/`, pure logic → `systems/`, world-space entity → `objects/`, composes components → `composites/`, draws one thing → `components/`
- Key distinction: `objects/` = world space (depth-projected), `components/` = screen space (HUD/UI). `components/` = leaf, `composites/` = branch
- `systems/` never touches the display list. FlightAnimator stays in systems even though it moves a sprite — the sprite is owned by Projectile, not the animator
- Previous flat `ui/` directory mixed leaf components and compositions — splitting prevents the bag-of-everything problem as the project grows

### Component extraction pattern
- When a class does multiple things (DevOverlay: zone arcs + button + gating), extract each into its own component with `show()`/`hide()`, then compose them from a thin parent
- Each component owns exactly one Graphics/Text/Sprite. Toggling one never affects another
- Composites wire callbacks between components (e.g. PerfectThrowButton asks ZoneOverlay for the solved angle)

### Depth enum — z-ordering tiers
- `const enum Depth { HUD = 100, DEV = 200, CONTROLS = 300, OVERLAY = 500 }`
- Defines global visual stacking roles, not per-scene values. Depth is a canvas-wide rendering concern
- Components offset within their tier locally: `Depth.DEV + 1` for buttons above graphics
- Tiers spaced by 100 to leave room for insertion without renumbering
- `const enum` is fully erased at compile time — values are inlined as literal numbers in the JS output. Zero runtime cost
