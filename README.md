# HealthRPG

A medieval RPG where the gameplay is your real health and fitness. The full engineering plan is in [docs/ENGINEERING_PLAN.md](docs/ENGINEERING_PLAN.md). Current state, decisions and next steps are in [docs/HANDOFF.md](docs/HANDOFF.md).

## Layout
- `packages/engine`: the deterministic game engine. It is pure TypeScript with no IO, no clock, and no `Math.random`, and ESLint enforces that.
- `packages/fitness-model`: physiological parameters and load formulas (R4 TRIMP-style training load).
- `packages/content`: questline templates, quest archetypes, workout routines, and a cohesion linter.
- `research/`: research-agent reports (`report.md`) and extracted parameters (`params.json`), one folder per topic, R1–R8.
- `apps/mobile`: the Expo app (SDK 57, Expo Router, Zustand). It runs the same engine packages.
- `apps/sim`: terminal tools. `play.ts` is the text game, and `plan.ts` prints a generated questline.
- `scripts/build-params.mjs`: regenerates `packages/fitness-model/data/params.v1.json` from the research files.

## Status
- Phase 0 (research): all eight reports are in `research/`. They are awaiting human review.
- Phase 1 (engine core): done. It includes the seeded RNG, event log, reducer, state hash, two-layer capacities with grace-window atrophy, Sanctuary, and retraining.
- Phase 2 (quest generation): done.
  - **Lengths:** players choose short (2 weeks), average (6) or long (12). A longer line builds toward a bigger boss.
  - **Single quests:** a standalone "bounty" of a chosen type, sized to the player's current level, with no boss.
  - **Planner:** builds the week skeleton from R3 plan templates, including deloads, taper, and a boss scaled to what the player can safely reach.
  - **Materializer:** turns each slot into 2–4 equivalent options (same MET-minutes, within 0.5–2× the duration) inside the 30-day spike cap.
  - **Matching:** logged activities complete quests automatically.
  - **No failure:** lapsed quests re-roll instead of failing, and Sanctuary pauses deadlines.

- Phase 3 (narrative + boss battle + text game): done.
  - **Stories:** each completed quest gets a seeded 3–6 sentence story built from grammar templates and the real workout numbers. No AI runs during play.
  - **Boss battle:** turn-based. Abilities come from the quests completed, and the boss telegraphs its special attacks.
  - **Fate Director:** health never falls below 20%, and fate ends the fight by turn 14, so a hero who finished the questline always wins. Choices change the grade (narrow, valiant or legendary), the loot and the epilogue.
  - **Terminal game:** `npm run play` covers onboarding (R5 estimate, no weight asked), the quest board, logging, rest, Sanctuary, the chronicle and the battle. The save file is the event log, stored in `outputs/saves/`.

- **Stakes and persistence** (post-Phase 3):
  - **Stakes:** the hero can fall to 1 HP. Luck saves only a lethal blow, and attacks can land critical hits.
  - **Nick of time:** a finishing blow can come by luck, but only after turn 9 and only when the hero is in danger.
  - **Persistent skills:** skills carry across questlines, rank up with training, and go dull (never lose rank) without it.
  - **Maintenance bounties:** two a week (a walk and a strength session) keep stats and skills up, plus an optional mobility bounty.
- **Classes** (fitness styles, never a definition of "healthy"):
  - **The three classes:** Ranger (cardio), Berserker (lifting) and Warrior (circuits, bodyweight work, rowing, efforts under load). Each has a 5-skill tree that unlocks at class levels 1, 2, 4, 6 and 8.
  - **Non-exclusive:** each session feeds the classes its style belongs to (a readable mapping in `content/src/classes.ts`). XP comes mostly from time spent, so specialists climb one class fast and all-rounders collect skills from every tree.
  - **Class focus:** a questline can take an optional focus (`start dragon_of_ashpeak average berserker`) that leans its sessions toward that style, within the same safety caps.
  - **Legend scaling:** bosses scale with the tree skills a hero has unlocked, so veterans stay challenged.
  - **Class parity:** checked in the balance sim; the largest legendary-rate gap between classes is about 9 points for casual play.
- Phase 4 (balance simulator): done. `npm run balance` writes `outputs/balance/report.html` and CSVs.
  - **Personas:** 8 synthetic players over 52 weeks.
  - **Atrophy:** checked against R1's curves.
  - **Battles:** a 2,400-fight Monte Carlo by play style.
  - **Rule checks:** spike-cap violations 0 and rest penalties 0.

- Phase 5 (mobile shell): done and verified in the browser through Expo web.
  - **Screens:** onboarding, quest board with weekly upkeep, hero sheet with class trees, chronicle, camp (rest, Sanctuary, connection placeholders, prototype time controls), workout logging, quest picker, and battle.
  - **Placeholder art:** every visual comes from `apps/mobile/src/assets/manifest.ts`. A missing asset renders as a labelled silhouette, and real art is a one-line manifest change.
  - **Persistence:** the event log is stored on-device (expo-sqlite on iOS and Android, localStorage on web) and replayed on launch.
  - **Tests:** Maestro flows are in `apps/mobile/.maestro/` and need a simulator or device to run.

> `params.v1.json` uses the **mid values** from `research/r1`–`r4` and is marked `1.0.0-mid-unreviewed`. Open review items are listed inside the file. `params.v0.json` is the old placeholder and is no longer used.

## Commands
```bash
npm install
npm test          # vitest + fast-check property tests
npm run typecheck
npm run lint
npm run params                                  # rebuild params from research
npm run plan -- dragon_of_ashpeak long novice   # print a questline: short | average | long
npm run plan -- single:journey_hike trained     # print a single quest (bounty)
npm run play                                    # play the text game (save: outputs/saves/hero.json)
npm run play -- --save aldric                   # use another save slot
npm run balance                                 # balance sim -> outputs/balance/report.html
npm run mobile:web                              # the app in a browser (http://localhost:8081)
npm run mobile                                  # Expo dev server for a phone/simulator (development build)
```

## Notes
- **OneDrive and Metro:** this project lives in a OneDrive-synced folder, and Metro's file watcher can miss edits there. If the app shows stale code, restart it with `npx expo start --clear` (from `apps/mobile`).
- **Shared packages:** they use Node-style `.js` import suffixes in TypeScript. `apps/mobile/metro.config.js` maps those to `.ts` for Metro.
