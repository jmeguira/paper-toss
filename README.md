# Paper Toss

A mobile-first projectile throwing game built around a single skill: feel the throw. No trajectory preview, no aim assist — just a flick gesture, wind, and a target in the distance. Streak-driven scoring, five landing tiers (PERFECT → MISS), and a juice system that scales every effect with the streak you're building.

**▶ Live demo: https://jmeguira.github.io/paper-toss/**

> Best on a touch device or mobile-emulated browser (Chrome DevTools → device toolbar). Desktop mouse works for testing but the gesture is built for thumbs.

<!-- TODO: drop a gameplay GIF here once recorded -->

## How it plays

1. Touch near the ball at the bottom of the screen.
2. Flick upward — the angle of your flick is the angle of the throw.
3. Wind pushes laterally during flight. Read it, compensate.
4. Land in the target ring to score. The closer to dead center, the higher the tier:
   - **PERFECT** → **HIT** → **NEAR HIT** count as makes
   - **NEAR MISS** and **MISS** reset your streak

There is no difficulty selector. The only score that matters is your streak — and as it climbs, the game wakes up: feedback effects intensify, the ball gains visual weight, the target reacts harder. Miss, and you start over.

## Built with AI

This repo is an artifact of a long collaboration with Claude (Anthropic). Every design decision, build step, and dead-end is recorded in the markdown files at the root — not as polish, but as the actual working notes from the sessions:

- [`CLAUDE.md`](./CLAUDE.md) — the assistant's persona, workflow rules, and conventions for this project
- [`PLAN.md`](./PLAN.md) — implementation roadmap, current progress, parked ideas
- [`DESIGN.md`](./DESIGN.md) — confirmed design decisions and the reasoning behind them
- [`JOURNAL.md`](./JOURNAL.md) — what was built, when, and what shifted along the way
- [`LEARNING.md`](./LEARNING.md) — concepts and Q&A from a Python developer learning TypeScript and Phaser in real time

The aesthetic principle running through it: AI handles syntax and scaffolding; the human drives every decision about what to build, why, and when to stop.

## Tech stack

- **[Phaser 3](https://phaser.io/)** — 2D game framework (Canvas renderer, not WebGL — cleaner anti-aliased curves)
- **TypeScript** — strict mode, types everywhere
- **Vite** — dev server + production build
- **GitHub Actions + Pages** — automatic deploy on push to `main`

No physics engine. Flight is analytical (parametric path computed at throw time) — landing result is decided up-front, animation is purely cosmetic. Lets us layer presentation tricks (arc amplification, dive curves, screen shake) without affecting outcomes.

## Project structure

```
src/game/
  scenes/        Phaser Scene subclasses — orchestrators
  systems/       Pure logic, no rendering (input, flight math, scoring)
  objects/       World-space entities, depth-projected (ball, target, ground)
  components/    Visual building blocks — one Graphics/Text/Sprite each
  composites/    Compose components into screen-level UI
  theme.ts       Single-source palette and visual constants
  constants.ts   Tuning knobs (physics, layout, depth ordering)
```

The directory split is deliberate — see `DESIGN.md → Directory Convention` for the one-pass sorting rule.

## Local development

```sh
npm install
npm run dev      # local dev server with hot reload
npm run build    # production build → dist/
```

Requires Node 25+ (see `.nvmrc`).

For mobile-viewport testing, use Chrome DevTools' device toolbar (Cmd+Shift+M) — the game listens for touch events, so emulation is a closer match to real input than mouse.

## Status

MVP complete. Currently in a "v1 ship" pass — visual juice, audio, haptics, and a streak-driven difficulty rework. Power and spin mechanics are parked for v2. See `PLAN.md` for the live progress board.
