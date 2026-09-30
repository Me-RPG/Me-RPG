# Me RPG

A medieval RPG that gamifies real fitness. **Start every session by reading [docs/HANDOFF.md](docs/HANDOFF.md)**, which covers current state, decisions, open items and the next phase. The original plan is in [docs/ENGINEERING_PLAN.md](docs/ENGINEERING_PLAN.md).

## Rules for working here
- **Deterministic engine.** Never use `Math.random`, `Date` or IO in `packages/engine`, `packages/fitness-model` or `packages/content` (ESLint enforces this). All randomness goes through the seeded `Rng`; time comes in through events.
- **Never define "healthy".** No class, style or mix may be mechanically best or penalized. Keep class parity in the balance sim (`npm run balance`).
- **Rest is never penalized.** A maintained stat must never drop inside its grace window; the balance sim checks this (restPenaltyDays must be 0).
- **Safety caps come from research/r3.** Quest targets must respect the 30-day spike cap and the weekly growth caps.
- **Traceable physiology.** Physiology numbers come from `research/*/params.json` via `npm run params`; mark design values as design.
- **Mobile.** Before touching Expo APIs, read `apps/mobile/AGENTS.md` and check the versioned docs for SDK 57. Install packages with `npx expo install`.
- **Git and deletions.** No git commits unless the user asks. Ask before deleting files.
- **Done means green.** Run `npm test`, `npm run typecheck` and `npm run lint` before calling work done.
