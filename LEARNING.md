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
