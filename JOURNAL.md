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
