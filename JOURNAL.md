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
