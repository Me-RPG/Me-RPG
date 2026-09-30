# HealthRPG: Engineering Plan

## Context
This is a new build (the `Desktop\HealthRPG` folder is empty). The product is a mobile app that looks and feels like a medieval RPG, where the real gameplay is the player's own health and fitness progress. Players set goals and get **questlines**: consecutive quests, each one step harder, that train them for a narrative climax such as slaying a dragon. Each quest offers a few concrete **options** (for example, a specific lifting routine or a specific trail), and completing any one of them completes the quest. A short narrative closes each quest. A boss battle closes each questline, and the player always wins it if they did the fitness work. Stats atrophy at realistic human rates but never penalize normal rest.

**Decisions made:**
- Stack: React Native + Expo (TypeScript) and Supabase.
- Repo location: `%USERPROFILE%\OneDrive\Documents\Projects\HealthRPG\`, per the global CLAUDE.md. The empty Desktop folder stays untouched.
- Order of work: engine first, then a text-game placeholder with visual framing, then accounts and sync, then integrations (Health platforms, Strava, trails). Real art arrives later through an asset manifest.

**Non-negotiable engine principles:**
1. **Deterministic, never AI-dependent at runtime.** The engine is a pure function: `state = fold(events, contentVersion)`. All randomness comes from a seeded PRNG keyed on `(userId, questlineId, eventIndex)`. The engine never calls `Math.random()` or `Date.now()`; time is passed in as input.
2. **Variance lives inside the engine** (seeded choices of flavor, events, and battle beats), so the same inputs always replay to the same result.
3. **Fitness success is the victory condition.** The boss battle is dramatized, not gated.
4. **Minimal intrusion.** No weight or body-composition requirement, only coarse location, and summaries stored instead of raw GPS streams.

---

## Repository layout (pnpm workspaces + Turborepo)
```
HealthRPG/
  apps/
    mobile/            Expo app (expo-router, dev client)
    sim/               Node CLI: text-game REPL + balance simulator
  packages/
    engine/            Pure TS. No IO, no React. The heart of the game.
    fitness-model/     Research-derived parameters + formulas (atrophy, load, trail difficulty)
    content/           Questline/quest/boss/narrative templates (YAML → zod-validated JSON)
    ui-kit/            Design tokens, placeholder renderer, asset registry
    integrations/      Provider adapters (HealthKit, Health Connect, Strava, Trails) behind interfaces
  supabase/
    migrations/        Postgres schema + RLS
    functions/         Edge functions: strava-oauth, strava-webhook, trails-proxy, replay-validate
  research/            Research agent reports (markdown + citations) and extracted JSON params
  scripts/             Content build, placeholder asset generation, research extraction
  outputs/             Generated reports (balance sim results, research summaries)
```

---

## Phase 0: Foundations and research agents
**Goal:** give the engine human-reviewed, cited physiological parameters before any game code depends on them.

Run these research agents in parallel (Claude `general-purpose` agents with WebSearch/WebFetch). Each one produces two things:
- `research/<topic>/report.md`: findings, citations, and a confidence level for each claim.
- `research/<topic>/params.json`: machine-readable ranges, for example `{ "vo2max_decline_pct_per_week": {"low":..,"mid":..,"high":..,"source":[...]}}`.

A human reviews each report before the params are copied into `packages/fitness-model/data/` with a version number. The engine only ever reads versioned params.

| # | Agent | Question it answers | Feeds |
|---|-------|--------------------|-------|
| R1 | Detraining physiology | How fast do strength, hypertrophy, aerobic capacity (VO2max), and mobility decline without training? How do training age and age change that? How quickly does lost capacity come back on retraining ("muscle memory")? | Atrophy curves, grace windows, retraining multiplier |
| R2 | Rest & recovery norms | What counts as normal rest (rest days per week, deloads, recovery between sessions of the same muscle group)? | "Rest never penalized" rules |
| R3 | Safe progression | What are safe rates of progressive overload (ACSM/WHO guidelines, the acute:chronic workload ratio, what the evidence says about the 10% rule)? What are the overtraining red flags? | Quest difficulty ramp caps |
| R4 | Activity normalization | What are MET values from the 2024 Adult Compendium of Physical Activities? How do we compute training load (TRIMP, sRPE) with and without heart rate? | Converting any activity into stat load |
| R5 | Low-intrusion assessment | What minimal onboarding gives a usable starting estimate (PAR-Q+ safety screen, self-reported activity, optional simple field tests like the Rockport walk, a push-up count, the talk test)? How do we infer capacity from imported history? | Onboarding flow, initial capacity |
| R6 | Trail difficulty | What rating systems and formulas exist (Shenandoah rating, Naismith/Tobler, SAC scale, YDS class, altitude effects), and how do they map to aerobic capacity? | Trail scoring and matching to players |
| R7 | Integration landscape | What do the current APIs, terms, rate limits, and data-use restrictions look like for Strava, Apple HealthKit, Google Health Connect, Garmin, Fitbit, Mapy.com, OSM/Overpass, and AllTrails? Verify Strava's 2024+ API agreement changes and whether AllTrails offers any public API or partnership route. | Integration specs and legal constraints |
| R8 | Ethical gamification & compliance | What are the risks (streak anxiety, overtraining, eating-disorder triggers)? What keeps the app a non-medical-device wellness app? What do app-store health-data rules, GDPR/CCPA, and HealthKit/Health Connect policies require? | Design guardrails, privacy policy |

**Deliverables:**
- Monorepo scaffold, TypeScript strict mode, Vitest, fast-check, ESLint rules that ban `Math.random` and `Date` inside `packages/engine`.
- CI running on GitHub Actions.

---

## Phase 1: Engine core (`packages/engine`)
**Core modules:**
- `rng.ts`: a seeded PRNG (xoshiro128**) plus `deriveSeed(...parts)` using a stable hash. Every random draw names its purpose (`rng.fork("battle.turn3")`), which keeps replays stable when code changes.
- `events.ts`: an append-only event log. Event types: `ActivityLogged`, `QuestOptionCompleted`, `QuestlineStarted`, `RestDeclared`, `SanctuaryEntered/Exited`, `BattleAction`, `GoalSet`, `DayTicked`.
- `state.ts`: `reduce(state, event, ctx)`, which yields a `GameState` (character, stats, active questlines, inventory, history). It also provides `hashState()` for determinism checks and server replay.
- `activity.ts`: normalizes any activity (manual, HealthKit, Strava) into a single `ActivityRecord { type, durationMin, distanceM?, elevGainM?, avgHr?, rpe?, metScore, loadByCapacity }`, using R4.

**Stats: two layers.**
- **Hidden capacities** are physiological estimates: `aerobic`, `muscular_strength`, `muscular_endurance`, `mobility`.
  - They are modeled with a Banister fitness/fatigue impulse-response model, one per capacity.
  - Decay constants come from R1.
- **Displayed RPG stats** are derived from the capacities:
  - STR (strength)
  - END (endurance)
  - AGI (mobility)
  - VIT (consistency/recovery)
  - WAN (Wanderlust: distance and elevation traveled; this one is cumulative and never decays)

**Atrophy rules (all values come from R1/R2 and none are hardcoded):**
- Each capacity has a **grace window** (for example, strength ≈ 2–3 weeks). Inside the window, decay is zero. Scheduled rest days, deload weeks, and "Camp" days are always free.
- After the grace window, decay follows the research curve and is floored at a retained baseline. Regaining lost capacity uses a **retraining multiplier**, so lost ground comes back faster than it was first earned.
- Recovery is rewarded. Resting appropriately after hard sessions grants a VIT "Well-Rested" buff that improves the next quest's narrative outcomes.
- **Sanctuary mode** covers illness or injury. It pauses *game* atrophy and pauses questline deadlines. Capacities keep modeling reality internally, so difficulty recalibrates correctly when the player returns.

**Tests:**
- Property test: replaying the same events gives an identical state hash.
- Property test: no activity during a grace window never lowers stats.
- Property test: stats never go negative.
- Golden-file tests for the decay curves against R1's reference numbers.

---

## Phase 2: Quest generation (`packages/engine/quests`, `packages/content`)
**Hierarchy:** Questline → Acts (**Training**, **Journey**, **Confrontation**) → Quests → Options. Completing 1 option completes the quest.

**Questline templates** are YAML in `content/questlines/`, for example `dragon-of-ashpeak.yaml`. A template declares:
- the **boss requirement profile**: target capacities, e.g. aerobic +X% and strength +Y% over the player's baseline;
- a duration range (e.g. 6–12 weeks);
- the act structure;
- narrative beats, and which quest archetypes fit each act.

**Generator (deterministic):**
1. Take the player's current capacities and their goal selection, pick a template, and compute the gap to the boss profile.
2. Plan a progression curve. Weekly load increases are capped by R3's safe-progression params, and deload weeks are scheduled in.
3. For each quest slot, pick an archetype (strength session, tempo walk, long hike, mobility, etc.) and set its difficulty to a target intensity relative to current capacity (roughly 60–85%, tuned by the sim).
4. Generate 2–4 **options** per quest from option libraries: routines in `content/routines/`, trails from the trail provider (Phase 9), and generic distance/time targets.
   - Options must be equivalent in load, within a tolerance.
   - Each option carries narrative tags so the story stays cohesive (a "ford the river" quest → options like waterside trail / rowing session / swim).
5. **Adaptive re-planning.** Skipping a quest never fails the questline; the next quest regenerates from the updated capacities. Quests have soft windows. If a window lapses, the quest re-rolls instead of being counted as a loss.

**Cohesion checks:** each questline must have a consistent location/terrain theme, a consistent antagonist, and Training quests that map to the mechanics the boss battle will use. A content linter enforces this at build time.

---

## Phase 3: Narrative and boss battles
**Narrative engine** (a Tracery-style grammar, fully deterministic):
- Templates contain slots filled from real data: `{trailName}`, `{distanceKm}`, `{elevGainM}`, `{durationMin}`, `{routineName}`, the character's name and class, and the prior quest outcome.
- Variant selection uses the seeded RNG, so each quest ends with a 3–6 sentence story.
- AI may be used **offline at authoring time only**, to draft templates that a human then edits and commits. Runtime never calls a model.

**Boss battle** (a text-based, turn-based encounter):
- **Mechanics are unlocked by training.** Each act's quests grant battle abilities tied to what the player actually did:
  - Strength quests → *Heavy Strike* / *Shield Wall*.
  - Endurance quests → a larger stamina pool and *Second Wind*.
  - Journey hikes → *Terrain Knowledge*, which lets the player avoid the dragon's fire on known ground.
  - Mobility quests → *Evade*.
- **Fate Director (the guaranteed win):**
  - `battleOutcome = questlineComplete ? VICTORY : (battle locked)`. The boss fight only unlocks once every required quest is complete.
  - The director simulates the battle with seeded variance. Whenever player HP would drop below a threshold, it injects a seeded **luck beat** from content, such as "the dragon's talon catches on a jagged rock." The player can therefore never reach 0 HP.
  - Player choices change the *grade* of the victory (Narrow / Valiant / Legendary), the loot, and the epilogue text. They never change whether the player wins.
- **Test invariant:** fast-check runs more than 100k seeds × random action sequences and asserts VICTORY 100% of the time, and that battles stay within turn bounds so they neither drag nor end too fast.

---

## Phase 4: Text game harness and balance simulator (`apps/sim`)
- **REPL:** `pnpm sim play` runs the full loop in the terminal: onboarding → goal → questline → log activities → narratives → battle. This is the primary fast-iteration surface.
- **Balance sim:** `pnpm sim balance` runs synthetic personas for 6–12 simulated months. Personas include:
  - sedentary beginner
  - weekend hiker
  - lifter who skips cardio
  - an injured player who uses Sanctuary
  - an inconsistent player
  - an over-trainer

  It writes charts and CSVs to `outputs/balance/`. It verifies that difficulty ramps stay inside R3's safe caps, that atrophy matches R1's curves, and that no persona is ever punished for normal rest.

---

## Phase 5: Mobile shell with placeholder visuals (`apps/mobile`, `packages/ui-kit`)
- **Framework:** Expo (SDK current at build time), expo-router, and a dev client (needed later for HealthKit). State lives in Zustand, and engine calls run in a pure selector layer.
- **Screens:** Onboarding (PAR-Q+ screen, goals, experience) · Character sheet · Quest board (active quest + options) · Quest log / chronicle (narratives) · Map (a stylized list of acts for now) · Battle (a text log with ability buttons) · Camp (rest/sanctuary) · Settings/Connections.
- **Visual placeholder system:**
  - Design tokens use a medieval palette of parchment, iron, ember, and forest, with open-licensed fonts (e.g. Cinzel for headings, EB Garamond for body text).
  - `assets/manifest.json` maps keys like `boss.dragon.idle`, `ui.frame.parchment`, and `portrait.class.ranger` to files.
  - Until a real file exists, `<GameAsset id=…/>` renders a **placeholder**: a framed SVG silhouette with its label, sized and colored by category. That makes the visuals legible now and lets real art drop in by editing the manifest, with no code changes.
  - The battle and narratives are text-first, framed on parchment cards with simple animations (Reanimated) for hits and luck beats.
- **Persistence:** offline-first. The event log lives in expo-sqlite, and the engine runs on-device.
- **Testing:** Maestro E2E flows cover onboarding → first quest → completion → narrative.

---

## Phase 6: Accounts and sync (Supabase)
- **Auth:** Sign in with Apple (required on iOS if any social login is offered), Google, and email magic link.
- **Schema** (every table has RLS so users can see only their own rows): `profiles`, `characters`, `events` (append-only, `seq` per user), `questline_instances`, `connections` (provider tokens encrypted with Supabase Vault), `activity_summaries`, `content_versions`.
- **Sync:** the client pushes new events and pulls any it's missing. Conflicts are rare because the log is per-user and append-only; they're resolved by sequence number plus a server timestamp for ordering.
- **`replay-validate` edge function:** replays the event log with the same engine package to verify the state hash. This is lightweight anti-tamper, and a later foundation for leaderboards or parties.
- **Compliance:**
  - account deletion and data export in-app (required by the App Store and GDPR);
  - a privacy policy based on R8;
  - no health data used for ads;
  - analytics limited to game events only, never health values (e.g. PostHog, self-host optional).

---

## Phase 7: Health platform integrations (`packages/integrations`)
**`ActivityProvider` interface:** `connect() / disconnect() / fetchSince(cursor) → ActivityRecord[]`, plus dedup keys. Order of work:
1. **Manual entry.** Already exists from Phase 5. It is marked as self-reported and weighted with the same trust as imports; there's no anti-cheat paranoia in a single-player game.
2. **Apple HealthKit** (react-native-health or an Expo module) and **Google Health Connect** (react-native-health-connect). These give the widest coverage, because Garmin, Fitbit, Peloton, and similar apps already write to them.
   - The app only requests the workout types plus heart rate and elevation it needs.
3. **Deduplication:** the same workout can arrive from Strava and from HealthKit. Records are matched on start time ± tolerance, duration, and type.

---

## Phase 8: Strava
- **OAuth:** handled by the `strava-oauth` edge function, so the client secret never ships in the app. Refresh tokens are stored in Vault.
- **Webhooks:** the `strava-webhook` edge function receives activity create/update/delete events and turns them into `ActivityLogged` events.
- **Rate limits and fetching:** the defaults are about 200 requests per 15 minutes and 2,000 per day. The function backs off when it approaches them and fetches summaries only; raw streams are never stored.
- **Terms (from R7):** follow the "Powered by Strava" brand rules, don't show a user's data to other users, and meet any AI or data-retention restrictions in the current agreement.
- **Credentials:** the developer creates the Strava app registration and credentials; Claude does not.

---

## Phase 9: Trails and location
**`TrailProvider` interface:** `searchNear(coarseLocation, radiusKm, filters) → Trail[]`, where `Trail` has distance, elevation gain, max grade, surface, SAC scale, geometry reference, and attribution.

**Providers, in order:**
1. **OpenStreetMap / Overpass**: hiking route relations and `sac_scale` tags, plus a DEM for elevation (e.g. open elevation tiles). Free, global, and needs attribution.
2. **Mapy.com API**: routing and tourist trails, which are strong in Europe. It needs an API key.
3. **AllTrails**: only if a partnership comes through. There's no public API, so R7 will confirm; for now this is a *business-development dependency, not an engineering task*.

**Difficulty engine** (`fitness-model/trails.ts`):
- Compute an R6-derived score from the Shenandoah formula, adjusted for altitude, surface, and SAC scale.
- Estimate time with Tobler's hiking function.
- Map the score to the aerobic capacity required, then match trails to quest target intensity.

**Privacy:**
- Location permission is "while using" only.
- The client snaps location to a roughly 5 km grid before any request goes out.
- The `trails-proxy` edge function caches results by grid cell, and the server never stores player coordinates.
- The player can pick a home region manually instead of sharing location.

---

## Phase 10: Asset integration and beta
- Swap placeholders for purchased or commissioned art through the manifest.
- Add audio: ambient sound and battle stingers.
- Run TestFlight and Play internal testing, and add store listing health disclaimers ("not medical advice; consult a physician").
- Feed R8-driven guardrails back into the design: no punitive streaks, and overtraining nudges ("the innkeeper insists you rest").

---

## Verification
- **Engine:**
  - Vitest unit tests.
  - fast-check properties: determinism (identical state hash), guaranteed victory, no penalty for rest in the grace window, and safe progression caps are never exceeded.
  - Golden tests of the decay curves against the `research/` params.
- **Simulation:** run `pnpm sim balance` and review `outputs/balance/` for all personas before each content release.
- **Playthrough:** complete a full dragon questline in `pnpm sim play` using fabricated activities, and confirm the narratives read coherently and the battle is won.
- **Mobile:** Maestro E2E flows on iOS simulator and Android emulator. Test offline mode, then reconnect and confirm the sync reaches the same server-side replay hash.
- **Integrations:** use a Strava test account for OAuth, trigger the webhook, confirm exactly one `ActivityLogged` event and correct dedup against HealthKit, and use HealthKit sample data in the simulator.
- **Privacy review:**
  - Confirm no precise coordinates or raw streams exist in Supabase tables (checked with a SQL audit).
  - Confirm RLS isolation with a two-user test.

## Suggested immediate next steps (first implementation session)
1. Scaffold `Documents\Projects\HealthRPG` as the monorepo, with `git init`.
2. Launch research agents R1–R8 in parallel, with output going to `research/`.
3. While the research runs, build the Phase 1 engine skeleton (rng, events, reducer, activity normalization) using placeholder params clearly marked `UNVERIFIED`. Swap in the reviewed params once they land.

---

## Future expansion (noted 2026-09-29)
- **Self-betterment platform:** beyond fitness, add goal types such as study plans and learning. Each opens a new player class line (studying/learning = **magic**). Keep capacities, abilities, classes and goal types data-driven so a non-physical track can be added without engine rewrites.
- **Onboarding safety screen** (R5 gentle and prenatal paths): deferred to v2, since the initial audience is tighter.
- **More classes on the same system:** a monk (mobility and yoga, which currently feed shared skills only) and a mage (study, for the self-betterment direction). Classes are data in `packages/content/src/classes.ts`. Each needs a style mapping, a 5-node tree with the same active/passive mix (the content lint enforces this), and a balance-sim parity check.
