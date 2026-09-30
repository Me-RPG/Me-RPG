# HealthRPG: Handoff (state as of 2026-09-29)

Read this first in a new session. The original plan is in [ENGINEERING_PLAN.md](ENGINEERING_PLAN.md). This file records what was actually built, what was decided along the way, and what is next.

**Location:** `%USERPROFILE%\OneDrive\Documents\Projects\HealthRPG` (not Desktop\HealthRPG, which is an empty launch folder).
**Git:** branch `main`, remote `origin` = public repo https://github.com/Me-RPG/Me-RPG (no license: all rights reserved). The org belongs to the `cdchandev` GitHub account, not `cameronablaze`. The author is set in the repo config (Cameron). Commit and push only when the user asks.
**Health:** 82 tests pass (`npm test`); `npm run typecheck` and `npm run lint` are clean; `expo-doctor` passes 21/21.

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
| **6 Accounts + sync (Supabase)** | **In progress.** App side built; migration written but **not yet applied**. See section 7 | `supabase/`, `apps/mobile/src/sync` |
| 7 Health Connect (HealthKit postponed with iOS) | Not started. Needs an Android development build (see section 4) | — |
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
- **Platforms (2026-09-29): ship Android and Web first. iOS is postponed**, along with HealthKit, Sign in with Apple and the Apple Developer account. Keep code cross-platform, but don't build or test for iOS yet.
- **Name (2026-09-29): the project is renamed "Me RPG"** to fit the planned shift beyond fitness to personal improvement in general (see Future). The code, packages and docs still say HealthRPG until a rename pass is done.
- **User communications are postponed (2026-09-29):** no custom SMTP, branded emails or other player messaging yet. Sign-in keeps the email one-time code, sent through Supabase's built-in mailer, for development only.
- **v1 scope:**
  - **No onboarding safety screen** (a v2 feature).
  - High-stakes battles; only long-term players should suspect they can't lose.
  - Classes by fitness style, non-exclusive.
- **Integration order** (from R7): Health Connect (HealthKit later, with iOS) → OSM trails → Mapy → Garmin → Google Health API → Strava (last; owner-only display, no AI use, 7-day cache).
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
  - native Android not yet run (iOS postponed);
  - Maestro flows (`apps/mobile/.maestro/`) not yet run;
  - placeholder Android package `com.healthrpg.app`;
  - the "Prototype tools" in the Camp tab (time skip, reset) must be removed before release.
- **Android builds:** Health Connect needs a development build, not Expo Go. This machine has no Android SDK, Android Studio or Java (checked 2026-09-29). There are two routes:
  - install Android Studio, which provides the SDK, JDK and an emulator (Health Connect is built into Android 14+ images);
  - use EAS Build in the cloud, which needs an Expo account and a phone or emulator to install the APK on.
- **Web is now a shipping platform, not only a preview:**
  - `storage.web.ts` keeps the log in localStorage, which browsers can evict (Safari clears script storage after 7 days without a visit). Signing in keeps the save safe; consider IndexedDB plus `navigator.storage.persist()`.
  - Web has no health platform, so web players log workouts manually.
  - Hosting is not chosen yet (`app.json` web output is `single`).

## 5. Gotchas
- **Metro and `.js` suffixes:** the shared packages use Node-style `.js` import suffixes. `apps/mobile/metro.config.js` maps them to `.ts`.
- **OneDrive:** Metro's file watcher can miss edits in this folder. Restart with `npx expo start --clear`.
- **Env vars:** `EXPO_PUBLIC_*` values are inlined when Metro starts; restart the dev server after changing `.env.local`.
- **Preview server:** `.claude/launch.json` defines `mobile-web` for the browser pane.
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
- **Project:** `https://gebeanamnzbomxjrlvwh.supabase.co` (ref `gebeanamnzbomxjrlvwh`). The publishable key is in `apps/mobile/.env.local` (gitignored; template in `.env.example`). **Never** take the service_role/secret key or the DB password in chat.
- **Project auth settings (read 2026-09-29):** email sign-in on, signups open, email confirmation required; Apple, Google and anonymous sign-in off.
- **Built:**
  - `supabase/migrations/20260929000000_accounts_and_sync.sql` defines these tables:
    - `profiles` (auto-created by a signup trigger);
    - `characters` (one row per hero/save, with a device-generated uuid);
    - `events` (append-only, keyed `(character_id, seq)`).
  - RLS is read-own-rows only; clients cannot write tables directly.
  - `push_events()` is security definer. It checks ownership, accepts retried pushes, returns 409 (`PT409`) for a changed event and rejects gaps.
  - `delete_account()` deletes the auth user, which cascades to everything they own.
  - The migration was tested against PGlite with stub `auth` schema and roles: 23 checks covering two-user isolation, append-only rules and the deletion cascade. It has **not** run on the real project yet.
  - `apps/mobile/src/sync/`:
    - `supabase.ts`: the client; its session lives in expo-sqlite localStorage.
    - `plan.ts`: pure sync planning, tested. It handles push, pull, and rebasing local-only events after the server's when two devices diverged; events the engine refuses are dropped and reported.
    - `remote.ts`: the server calls.
    - `account.ts`: a zustand store with debounced single-flight sync, triggered on each new event, on sign-in and on app foreground.
    - `exportFile(.web).ts`: data export (native share sheet; download on web).
  - `src/app/account.tsx`: email one-time-code sign-in, sync status, heroes on the account (with "Play this hero" to restore on a new device), export and delete. It's linked from Camp and from onboarding ("Already have a hero?").
  - Each save records which account owns it and is never pushed into another account. "Start over" unlinks the save, and the next hero becomes a new server hero.
- **Needs the user:**
  1. Apply the migration: `npx supabase login`, `npx supabase link --project-ref gebeanamnzbomxjrlvwh` (prompts for the DB password in their terminal), `npx supabase db push`. Alternatively, paste the SQL file into the dashboard SQL editor.
  2. Email templates (Authentication → Emails): add `{{ .Token }}` to **Magic Link** and **Confirm signup**. The app signs in with the code, not the link.
  3. *Postponed (user communications):* custom SMTP. Built-in email only delivers to the project's team members and is rate-limited, which is fine for development but not for beta.
  4. Still open: Google sign-in (needs an OAuth client; optional), the project region (EU eases GDPR). Sign in with Apple is postponed with iOS; Apple only requires it on iOS apps that offer other social logins. Redirect URLs are only needed once magic links or OAuth are added.
- **Not done yet:**
  - `supabase/functions/replay-validate` (engine in Deno, recomputing the state hash) and `content_versions`, which it needs;
  - `connections` (provider tokens in Vault), to be added with the first integration;
  - verifying `delete_account()` on the real project. If the `postgres` role can't delete from `auth.users` there, switch to an edge function using the admin API;
  - a two-device sync test on real hardware.

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
- **supabase/migrations:** `20260929000000_accounts_and_sync.sql` (schema, RLS, `push_events`, `delete_account`).
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
  - config: `app.json`, `metro.config.js`, `package.json`, `tsconfig.json`, `.env.example` (`.env.local` holds the real values, gitignored), `AGENTS.md` (Expo template's agent guide: always check the versioned Expo docs)
  - routes, in `src/app/`:
    - `_layout.tsx`, `index.tsx`, `onboarding.tsx`, `log.tsx`, `start.tsx`, `account.tsx`, `battle/[id].tsx`
    - `(tabs)/{_layout,quests,hero,chronicle,camp}.tsx`
  - game: `src/game/{store,announce,selectors,storage,storage.web,storage.types,game.test}.ts`
  - sync: `src/sync/{supabase,plan,plan.test,remote,account,exportFile,exportFile.web}.ts`
  - UI and assets: `src/ui/{theme.ts,components.tsx,GameAsset.tsx}`, `src/assets/manifest.ts`
  - E2E: `.maestro/*.yaml`
  - unused template files: `App.tsx`, `index.ts` (deletable)
  - template-created `.claude/settings.json`
- **outputs/** (generated):
  - `balance/*` (report.html, checks.json, CSVs)
  - `saves/*.json` (test saves: scripttest.json is incompatible with current rules; demo-phase4, demo-classes)
  - `mobile-web/` (web export) and `mobile-web-probe/` (deletable)
