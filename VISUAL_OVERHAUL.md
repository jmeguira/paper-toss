# Visual Overhaul + Swipe Refinement — In-Flight Plan

## Branch: `dev/2026-03-05-visual`

Pick up by reading this file + `src/game/theme.ts` + `DESIGN.md`.

---

## Goal
Warm, depth-rich aesthetic. Objects with volume, atmospheric environment, intentional design. Plus swipe input refinement for mobile precision.

**Key constraint:** All visual constants live in a single `Theme` object (`src/game/theme.ts`). Game code imports from theme, never hardcodes visual values. Constants = mechanics, theme = style.

---

## Design Decisions Made This Session

- **No re-exports.** Theme values are NOT re-exported through `constants.ts`. Consuming files import directly from `theme.ts`. TypeScript errors serve as the migration checklist.
- **`TARGET_TEXTURE_RADIUS` eliminated.** Canvas padding is derived inline from `TARGET_RADIUS + 20` in BootScene. One constant, one source of truth.
- **Clean split principle:** if changing a value affects hit/miss → constant. If it only affects visuals → theme.
- **Theme vs Depth vs World-Z are independent layers.** Theme = visual skin (swappable). Depth enum = draw order (structural). World Z = 3D placement (gameplay). Adding new objects (fan, obstacles) touches all three but they don't depend on each other.
- **World-object z-ordering:** far objects get low depth (drawn first), near objects get high depth. Painter's algorithm, depth derived from world position. UI depths start at 100+ so no collision with world objects (0–50 range).
- **Sky gradient uses strip-based rendering** (64 horizontal rects with interpolated colors) instead of `fillGradientStyle()` which is WebGL-only and silently fails on Canvas renderer.

---

## Progress

### Step 0: Theme system foundation ✅
- Created `src/game/theme.ts` — typed `Theme` interface + `defaultTheme` object
- Removed visual constants from `constants.ts` (kept gameplay/physics/geometry)
- Migrated 3 files to `import { theme }`: AngleBounds, GroundPlane, BootScene
- Remaining files still have inline hardcoded values — migrate as each is reworked in steps 1–5

### Step 1: Sky gradient + ground plane rework ✅
- `GameScene.drawSky()` — 64-strip gradient (deep indigo → dusty warm purple) + horizon glow band
- `StartScene` — same gradient for seamless scene transitions
- `GroundPlane` — per-line alpha fading (near=0.35, far=0.08), warm purple-gray color from theme
- `main.ts` — `backgroundColor` reads from `theme.canvas`
- **NOT YET VISUALLY VERIFIED** — was looking the same at end of session, may need debugging

### Step 2: Projectile with depth (sphere look) — TODO
Replace flat white circle with faked radial-gradient sphere. Layered concentric circles with offset centers (highlight upper-left, shadow lower-right). Soft outer glow behind.

**Files:** `src/game/scenes/BootScene.ts` — rewrite `generateProjectileTexture()` with layered circles from `theme.ball.*`

**Technique:** 4-5 concentric `fillCircle` calls with offset centers. No special API needed.

### Step 3: Target with dimension — TODO
Replace flat red circle+ring with warm concentric rings (gold/amber) with subtle glow.

**Files:** `src/game/scenes/BootScene.ts` — rewrite `generateTargetTexture()` with multiple rings from `theme.target.*`

### Step 4: Flight trail effect — TODO
Fading trail behind ball during flight. Ring buffer of recent positions rendered as shrinking, fading circles.

**Files:**
- `src/game/systems/FlightAnimator.ts` — trail logic in `evaluate()`, clear on stop/reset
- `src/game/scenes/BootScene.ts` — generate small soft trail dot texture

### Step 5: UI and typography refresh — TODO
Replace monospace with clean sans-serif font stack. All text/button/panel styling pulls from `theme.ui`.

**Files (all pull from theme.ui):**
- `src/game/scenes/StartScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/components/WindIndicator.ts`
- `src/game/components/ScoreDisplay.ts`
- `src/game/composites/SettingsOverlay.ts`

### Step 6: Swipe input refinement — TODO
**6a: Trim trailing points.** Drop last 1-2 trail points in `computeThrow()` — thumb-lift frame introduces lateral jitter.

**6b: Aim-then-fire mode.** Swipe sets angle (shown via ThrowAngle arrow) but doesn't fire. Re-swipe to adjust. Tap ball to launch. Decouples aiming from launching.

**Files:**
- `src/game/systems/SwipeInput.ts` — trim logic + aim-then-fire state machine
- `src/game/constants.ts` — `SWIPE_TRIM_END` count
- `src/game/composites/SettingsOverlay.ts` — aim mode toggle

---

## Files with inline hardcoded values still to migrate to theme
These files have colors/fonts that should move to `theme.ui` during their respective steps:
- `StartScene.ts` — title, buttons, high score label (Step 5)
- `GameScene.ts` — difficulty label, hamburger button (Step 5)
- `SettingsOverlay.ts` — backdrop, panel, title, buttons (Step 5)
- `WindIndicator.ts` — arrow color, label styling (Step 5)
- `ScoreDisplay.ts` — font, stroke (Step 5)
- `ThrowAngle.ts` — arrow color/alpha/width (already in theme, not yet imported)
- `AngleIndicator.ts` — arc/needle colors (already in theme, not yet imported)
- `ZoneOverlay.ts` — zone fill/edge colors (already in theme, not yet imported)
- `TouchButton.ts` — font, alpha values (Step 5)
- `PerfectThrowButton.ts` — font, colors (Step 5)
- `MechanicalInput.ts` — GO button color (Step 5)

## Verification
- `npm run dev` after each step
- Steps 0–5: purely cosmetic, no gameplay changes
- Step 6: test on mobile for improved angle accuracy + aim-then-fire flow
- Swap test: after step 5, duplicate theme with different colors → whole game re-skins
