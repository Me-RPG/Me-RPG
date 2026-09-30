# HealthRPG: Handoff (state as of 2026-09-29)

Read this first in a new session. The original plan is in [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md). This file records what was actually built, what was decided along the way, and what is next.

**Location:** `%USERPROFILE%\OneDrive\Documents\Projects\HealthRPG` (not Desktop\HealthRPG, which is an empty launch folder).
**Git:** initialized, **no commits by user choice**. Everything is local.
**Health:** 77 tests pass (`npm test`); `npm run typecheck` and `npm run lint` are clean; `expo-doctor` passes 21/21.

---

## 1. Phase status

| Phase | Status | Where |
|---|---|---|
| 0 Research | Done. 8 reports + params in `research/r1..r8`. **Human review pending** | `research/` |
| 1 Engine core | Done | `packages/engine` |
| 2 Quest generation | Done (lengths short/average/long, single bounties, class focus) | `packages/engine/src/quests` |
| 3 Narrative + boss battle + text game | Done | `packages/engine/src/{narrative,battle}`, `apps/sim/src/play.ts` |
| 4 Balance simulator | Done | `apps/sim/src/balance.ts` → `outputs/balance/report.html` |
| Classes (added) | Done: Ranger / Berserker / Warrior | `packages/content/src/classes.ts`, `packages/engine/src/classes.ts` |
| 5 Mobile shell | Done, **verified in the browser (Expo web) only** | `apps/mobile` |
| **6 Accounts + sync (Supabase)** | **Next.** Waiting on items in section 7 | — |
| 7 HealthKit / Health Connect | Not started | — |
| 8 Strava | Not started (heavy API restrictions, see R7) | — |
| 9 Trails (OSM/Overpass; AllTrails not viable) | Not started | — |
| 10 Art, audio, beta | Not started | — |

---

## 2. Architecture in one screen

- **Event-sourced, deterministic engine.**
  - `state = fold(events)`, applied through `reduce(state, event, ctx)` in `packages/engine/src/state.ts`.
  - No `Math.random` and no `Date` in engine, fitness-model or content; ESLint enforces this. The seeded RNG lives in `rng.ts` (xoshiro128**), and named forks keep replays stable.
  - The save file **is** the event log. It is replayed on load, and `hashState()` gives the determinism check.
- **Packages** (npm workspaces):
  - `packages/fitness-model`: physiology params (`data/params.v1.json`, generated) and the training-load formulas. `load.ts` holds R4's TRIMP-style load plus MET-minutes; `onboarding.ts` holds R5's non-exercise VO2max estimate.
  - `packages/content`: data plus the cohesion linter. It holds the questline templates, archetypes (quest types with options), routines, abilities, bosses, classes and skill trees, the story grammar, and the maintenance bounties. `lint.ts` enforces cohesion and class-tree parity.
  - `packages/engine`:
    - core: state/reducer, capacities (two-layer atrophy), stats, skills, classes, maintenance;
    - `quests/`: `planner.ts` (week skeleton), `materialize.ts` (concrete options), `history.ts`;
    - `narrative/`: grammar plus stories;
    - `battle/`: turn-based fight with the Fate Director.
  - `apps/sim`: `play.ts` (terminal text game), `plan.ts` (print a plan), `balance.ts` + `report.ts` (balance simulator and HTML report).
  - `apps/mobile`: Expo SDK 57, Expo Router (routes in `src/app/`), Zustand store (`src/game/store.ts`), event store (`storage.ts` for native SQLite, `storage.web.ts` for localStorage), UI kit (`src/ui/`), asset manifest (`src/assets/manifest.ts`).

### Event types (packages/engine/src/events.ts)
- CharacterCreated, ActivityLogged, RestDeclared
- SanctuaryEntered / SanctuaryExited
- QuestlineStarted `{templateId, length, focus?}`, SingleQuestStarted `{archetypeId}`, QuestOptionCompleted
- BattleStarted, BattleActionTaken
- DayTicked

### Key mechanics
- **Capacities.** Aerobic is in VO2max units; strength, muscular endurance and mobility are points.
  - Real fitness drives difficulty; the displayed value is protected by Sanctuary.
  - Each capacity has a grace window with no decay, then decays toward a floor (R1 mids).
  - A rolling 7-day "stimulus bank" decides whether the maintenance dose was met. **Rest never lowers a maintained stat**, and the balance sim confirms 0 rest penalties.
- **Quests.**
  - The planner uses R3's templates, with 2 weeks = B T as a design addition. Weekly growth is capped at 10–15%; the boss is at most 1.1× the longest session in the prior 30 days, after a rehearsal of at least 90%; there are deloads and a taper. The boss is scaled to what the player can safely reach.
  - Options are equivalent on **MET-minutes** within a 0.5–2× duration band. Lapsed quests re-roll and never fail.
- **Battle** (constants in `BATTLE` in `battle.ts`).
  - The hero can fall to 1 HP. Luck saves only a lethal blow; critical hits are 12% at ×1.75.
  - Nick-of-time finishing blows can happen from turn 9 when the hero is at 30% HP or below. Fate ends the fight at turn 16.
  - Grade depends on how often luck intervened.
  - Legend scaling: bosses gain HP and damage per unlocked class-tree skill.
- **Skills** persist across questlines, rank 1–5, and never lose rank. They dull gently after 7 days without training, and twice-weekly **maintenance bounties** (a 30-min walk and a 30-min strength session, plus optional mobility) keep them sharp.
- **Classes** are non-exclusive. XP comes from an activity→class mapping (`CLASS_AFFINITY`), mostly time-based (minutes × (0.5 + intensity)). There are 5-node trees at levels 1/2/4/6/8. The design rule: **never define "healthy"** and keep classes at parity.

---

## 3. Decisions made (don't re-litigate)
- **Stack:** Expo/React Native, Supabase, npm workspaces (pnpm is not installed).
- **v1 scope:**
  - **No onboarding safety screen** (a v2 feature) and no commits.
  - High-stakes battles; only long-term players should suspect they can't lose.
  - Classes by fitness style, non-exclusive.
- **Integration order** (from R7): HealthKit/Health Connect → OSM trails → Mapy → Garmin → Google Health API → Strava (last; owner-only display, no AI use, 7-day cache).
- **Future:** a self-betterment expansion (study = a mage class), plus a monk class for mobility.
- Params use the research **mid** values. The user will review later.

## 4. Open review items / known gaps
- **Params** (`packages/fitness-model/data/params.v1.json` → `_openReviewItems`):
  - aerobic grace R1 7 d vs R2 10 d;
  - mobility tau is low confidence;
  - capacity split is expert judgment;
  - gain calibration is design;
  - the 2-week template is design;
  - the muscular-endurance maintenance override.
- **Battle tuning:** casual players are saved at 1 HP in about 36% of fights, which may reveal the guarantee. Ranger parity sits at the low end (about 55% vs 61–64% legendary). The Warrior levels slightly slower.
- **Stuck questline:** a player who refuses one modality (e.g. no cardio) never progresses. A "swap quest" feature is needed.
- **Save versioning:** rule changes can break replay of old saves. Saves record `RULES_VERSION`; there is no migration strategy yet.
- **Mobile:**
  - native iOS/Android not yet run;
  - Maestro flows (`apps/mobile/.maestro/`) not yet run;
  - placeholder bundle id `com.healthrpg.app`;
  - the "Prototype tools" in the Camp tab (time skip, reset) must be removed before release.
- **Health data:** HealthKit/Health Connect need a development build (not Expo Go).

## 5. Gotchas
- **Metro and `.js` suffixes:** the shared packages use Node-style `.js` import suffixes. `apps/mobile/metro.config.js` maps them to `.ts`.
- **OneDrive:** Metro's file watcher can miss edits in this folder. Restart with `npx expo start --clear`.
- **Typecheck scope:** the root `tsconfig.json` excludes `apps/mobile`, which has its own JSX tsconfig; `npm run typecheck` runs both.
- **Shell scripting:** heredocs containing quotes have broken several times in this Git Bash. Prefer the Write/Edit tools for multi-line code.
- **Screenshots:** Browser-pane screenshots of the Expo web app time out intermittently; `get_page_text` and `find` work. Serve static HTML via localhost to screenshot it (the `file://` pane can't be captured).

## 6. Commands (run from the project root)
```bash
npm install
npm test
npm run typecheck
npm run lint
npm run params                                 # regenerate params.v1.json from research/*
npm run plan -- dragon_of_ashpeak long novice  # print a questline plan (or single:<archetype>)
npm run play -- --save <name>                  # terminal text game; saves in outputs/saves/
npm run balance                                # balance sim -> outputs/balance/report.html
npm run mobile:web                             # app in a browser at http://localhost:8081
npm run mobile                                 # Expo dev server for device/simulator
```

## 7. Phase 6 (Supabase) — status and what's needed
- **Have:** project URL `https://gebeanamnzbomxjrlvwh.supabase.co` (project ref `gebeanamnzbomxjrlvwh`).
- **Need from the user:**
  1. **The publishable/anon key.** It is public by design and goes in `apps/mobile/.env.local` as `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. **Never** take the service_role key or the DB password in chat.
  2. **The user runs** `npx supabase login` and `npx supabase link --project-ref gebeanamnzbomxjrlvwh` (the link step prompts for the DB password in their terminal).
  3. **Sign-in methods:** recommended email OTP/magic link first. Apple needs an Apple Developer account (asked; no answer yet). Google needs a Google Cloud OAuth client.
  4. **The project region** (an EU region eases GDPR).
  5. **Auth redirect URLs** added in the dashboard: `healthrpg://**` and `http://localhost:8081/**`.
- **Plan** (see the plan, Phase 6):
  - `supabase/migrations`: profiles, events (append-only, per-user seq), connections, content_versions, with RLS so each user reads and writes only their own rows;
  - sync: push local events, pull missing ones;
  - `supabase/functions/replay-validate`: the engine in Deno, recomputing the state hash;
  - in-app account deletion plus data export (App Store / GDPR requirement, from R8).

## 8. File inventory (excluding node_modules and generated output)
- **Root:** `package.json` (workspaces + scripts), `tsconfig.base.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `.github/workflows/ci.yml`, `README.md`, `docs/ENGINEERING_PLAN.md`, `docs/HANDOFF.md`, `CLAUDE.md`.
- **research/r1..r8:** `report.md` + `params.json` each:
  - R1 detraining
  - R2 rest and recovery
  - R3 safe progression
  - R4 activity normalization
  - R5 low-intrusion assessment
  - R6 trail difficulty
  - R7 integrations
  - R8 ethics and compliance
- **scripts/build-params.mjs:** research → `params.v1.json`.
- **packages/fitness-model:** `data/params.v1.json` (in use), `data/params.v0.json` (old placeholder, unused, deletable), `src/{types,params,load,onboarding,index}.ts`, `test/load.test.ts`.
- **packages/content/src:**
  - `types.ts`, `families.ts`, `archetypes.ts` (8 quest types), `routines.ts` (5 routines)
  - `abilities.ts` (15 skills), `bosses.ts` (2), `classes.ts` (3 + affinity), `maintenance.ts`, `narrative.ts`
  - `questlines/` (dragon-of-ashpeak, wolves-of-greywood), `lint.ts`, `index.ts`
  - test: `test/lint.test.ts`
- **packages/engine/src:**
  - `rng.ts`, `hash.ts`, `events.ts`, `rules.ts`, `capacity.ts`, `state.ts`, `stats.ts`, `skills.ts`, `classes.ts`, `maintenance.ts`
  - `quests/{types,history,planner,materialize,index}.ts`
  - `narrative/{grammar,story,index}.ts`
  - `battle/{battle,index}.ts`
  - tests: `test/{engine,quests,battle,classes}.test.ts`
- **apps/sim/src:** `play.ts`, `plan.ts`, `balance.ts`, `report.ts`.
- **apps/mobile:**
  - config: `app.json`, `metro.config.js`, `package.json`, `tsconfig.json`, `AGENTS.md` (Expo template's agent guide: always check the versioned Expo docs)
  - routes, in `src/app/`:
    - `_layout.tsx`, `index.tsx`, `onboarding.tsx`, `log.tsx`, `start.tsx`, `battle/[id].tsx`
    - `(tabs)/{_layout,quests,hero,chronicle,camp}.tsx`
  - game: `src/game/{store,announce,selectors,storage,storage.web,storage.types,game.test}.ts`
  - UI and assets: `src/ui/{theme.ts,components.tsx,GameAsset.tsx}`, `src/assets/manifest.ts`
  - E2E: `.maestro/*.yaml`
  - unused template files: `App.tsx`, `index.ts` (deletable)
  - template-created `.claude/settings.json`
- **outputs/** (generated):
  - `balance/*` (report.html, checks.json, CSVs)
  - `saves/*.json` (test saves: scripttest.json is incompatible with current rules; demo-phase4, demo-classes)
  - `mobile-web/` (web export) and `mobile-web-probe/` (deletable)
