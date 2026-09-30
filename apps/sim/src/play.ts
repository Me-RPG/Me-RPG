// HealthRPG text prototype. Everything the game does goes through the engine's
// event log; the save file IS that log, replayed on load.
//
// Usage:  npm run play                 (save: outputs/saves/hero.json)
//         npm run play -- --save aldric
//         Get-Content script.txt | npm run play -- --save test   (scripted input)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONTEXT as CTX,
  availableActions,
  characterStats,
  epilogue,
  incomingWarning,
  classLevel,
  maintenanceWeek,
  questStory,
  reduce,
  replay,
  sharpness,
  STATE_VERSION,
  xpForClassLevel,
  type GameEvent,
  type GameState,
  type QuestlineLength,
  type QuestlineState,
} from "@healthrpg/engine";
import { baselineFromOnboarding, type AgeBand, type OnboardingAnswers, type SexForNorms } from "@healthrpg/fitness-model";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const saveName = (() => {
  const i = process.argv.indexOf("--save");
  return (i >= 0 ? process.argv[i + 1] : undefined) ?? "hero";
})().replace(/[^a-z0-9_-]/gi, "_");
const SAVE_DIR = join(ROOT, "outputs", "saves");
const SAVE_PATH = join(SAVE_DIR, `${saveName}.json`);
const scripted = !process.stdin.isTTY;

// ---------------------------------------------------------------- input
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: !scripted });
const lines = rl[Symbol.asyncIterator]();
async function ask(prompt: string): Promise<string | null> {
  process.stdout.write(prompt);
  const next = await lines.next();
  if (next.done) return null;
  if (scripted) process.stdout.write(`${next.value}\n`);
  return next.value.trim();
}

// ---------------------------------------------------------------- display
const W = 72;
function wrap(text: string, indent = "  "): string {
  const out: string[] = [];
  let line = indent;
  for (const word of text.split(/\s+/)) {
    if (line.length + word.length + 1 > W) {
      out.push(line.trimEnd());
      line = indent;
    }
    line += word + " ";
  }
  out.push(line.trimEnd());
  return out.join("\n");
}
function banner(title: string) {
  console.log(`\n╔${"═".repeat(W - 2)}╗\n║ ${title.padEnd(W - 4)} ║\n╚${"═".repeat(W - 2)}╝`);
}
const bar = (v: number, max: number, width = 20) => "█".repeat(Math.round((Math.max(0, v) / max) * width)).padEnd(width, "░");

// ---------------------------------------------------------------- state & saving
let events: GameEvent[] = [];
let state: GameState;

/** Saves record the rules they were made under; a save from different rules may not replay. */
const RULES_VERSION = `${CTX.params.version}+content-${CTX.content.version}+state-${STATE_VERSION}`;

function load(): boolean {
  if (!existsSync(SAVE_PATH)) return false;
  const file = JSON.parse(readFileSync(SAVE_PATH, "utf8")) as { rules?: string; events: GameEvent[] };
  events = file.events;
  try {
    state = replay(events, CTX);
  } catch (e) {
    console.log(`\n  This save (${SAVE_PATH}) was made under rules "${file.rules ?? "unknown"}" and can't be replayed`);
    console.log(`  with the current rules "${RULES_VERSION}": ${(e as Error).message}`);
    console.log("  The file is untouched. Start a new save with: npm run play -- --save <new-name>");
    process.exit(1);
  }
  return true;
}
function save() {
  mkdirSync(SAVE_DIR, { recursive: true });
  writeFileSync(SAVE_PATH, JSON.stringify({ version: 1, rules: RULES_VERSION, events }, null, 1));
}
const realToday = () => Math.floor(Date.now() / 86_400_000);
const today = () => Math.max(realToday(), state?.day ?? 0);

/** Apply one event; on engine errors, show the message and keep the game running. */
function apply(partial: Record<string, unknown> & { type: GameEvent["type"] }, day = today()): boolean {
  const ev = { ...partial, seq: (state?.seq ?? 0) + 1, day } as GameEvent;
  try {
    const before = state;
    state = reduce(state, ev, CTX);
    events.push(ev);
    save();
    announce(before, state);
    return true;
  } catch (e) {
    console.log(`  ✗ ${(e as Error).message}`);
    return false;
  }
}

/** Print stories for newly completed quests and questline milestones. */
function announce(before: GameState, after: GameState) {
  after.questlines.forEach((q, i) => {
    const prev = before.questlines[i];
    for (let c = prev?.completed.length ?? 0; c < q.completed.length; c++) {
      console.log(`\n  ✦ Quest complete: ${q.plan.slots[q.completed[c]!.slotIndex]!.archetypeId.replace(/_/g, " ")}`);
      console.log(wrap(questStory(after, q, c, CTX)));
    }
    if (prev && prev.status !== q.status) {
      if (q.status === "boss_ready") console.log(`\n  ⚔  All trials complete. ${bossName(q)} awaits. Type "fight" when ready.`);
      if (q.status === "complete") console.log("\n  ✦ Bounty complete.");
    }
  });
}

const bossName = (q: QuestlineState) => CTX.content.bosses[q.plan.templateId]?.name ?? "The boss";
const title = (q: QuestlineState) =>
  q.plan.kind === "single" ? `Bounty: ${CTX.content.archetypes[q.plan.templateId]?.name}` : CTX.content.questlines[q.plan.templateId]?.title ?? q.plan.templateId;

// ---------------------------------------------------------------- screens
function sheet() {
  const s = characterStats(state, CTX);
  banner(`${state.character!.name}  ·  Level ${s.level}`);
  const row = (k: string, v: number, note: string) => console.log(`  ${k}  ${String(v).padStart(3)}  ${bar(v, 70)}  ${note}`);
  row("STR", s.STR, "strength");
  row("END", s.END, "endurance");
  row("AGI", s.AGI, "mobility");
  row("VIT", s.VIT, "consistency");
  row("WAN", s.WAN, "wanderlust (km + climb, never fades)");
  const flags = [s.wellRested && "Well-Rested", s.inSanctuary && "In Sanctuary"].filter(Boolean);
  if (flags.length) console.log(`  ${flags.join(" · ")}`);
  console.log(`  Sessions: ${state.totals.sessions}  ·  XP: ${state.totals.xp}  ·  Day ${today() - state.character!.createdDay + 1}`);
  console.log("\n  Classes (grow in whatever you train; mix freely):");
  for (const c of Object.values(CTX.content.classes)) {
    const xp = state.classXp[c.id];
    const lvl = classLevel(xp);
    const next = c.tree.find((n) => n.level > lvl);
    const toNext = Math.max(0, Math.ceil(xpForClassLevel(lvl + 1) - xp));
    const nextNote = next ? `next skill: ${CTX.content.abilities[next.abilityId]?.name} at level ${next.level}` : "tree complete";
    console.log(`    ${c.name.padEnd(10)} level ${String(lvl).padEnd(2)} ${bar(xp - xpForClassLevel(lvl), Math.max(1, xpForClassLevel(lvl + 1) - xpForClassLevel(lvl)), 12)}  ${toNext} xp to next · ${nextNote}`);
  }
  const skills = Object.entries(state.skills);
  if (skills.length) {
    console.log("\n  Skills (kept across questlines; train to rank up, maintain to stay sharp):");
    for (const [id, sk] of skills) {
      const sharp = Math.round(sharpness(sk, today()) * 100);
      console.log(`    ${(CTX.content.abilities[id]?.name ?? id).padEnd(18)} rank ${sk.rank}  ${"★".repeat(sk.rank).padEnd(5, "☆")}  ${sharp < 100 ? `dulling (${sharp}% sharp)` : "sharp"}`);
    }
  }
}

function maintenanceBoard() {
  const week = maintenanceWeek(state.character!.createdDay, today());
  const done = state.maintenance.week === week ? state.maintenance.done : [];
  console.log("\n  This week's maintenance bounties (keep stats and skills from fading):");
  for (const b of CTX.content.maintenance) console.log(`    ${done.includes(b.id) ? "✓" : "○"} ${b.title}: ${b.description}`);
}

function board() {
  maintenanceBoard();
  const open = state.questlines.filter((q) => q.status !== "victorious" && q.status !== "complete");
  if (open.length === 0) {
    console.log('  No quests. Try: start dragon_of_ashpeak average   or   bounty long_walk   (see "list")');
    return;
  }
  for (const q of open) {
    banner(title(q));
    if (q.status === "boss_ready") {
      console.log(`  ⚔  ${bossName(q)} awaits. Type "fight".`);
      continue;
    }
    const a = q.active!;
    const total = q.plan.slots.length;
    console.log(`  ${a.isBoss ? "FINAL TRIAL" : `Trial ${q.completed.length + 1} of ${total}`}  ·  ${a.title}  ·  ${a.act}`);
    const opensIn = a.availableFromDay - today();
    console.log(`  ${opensIn > 0 ? `Opens in ${opensIn} day(s) (rest first)` : "Open now"}  ·  due in ${Math.max(0, a.dueDay - today())} day(s)  ·  no penalty if late`);
    a.options.forEach((o, i) => {
      const climb = o.targetElevGainM ? `, ${o.targetElevGainM} m climb` : "";
      console.log(`\n   [${i + 1}] ${o.title}`);
      console.log(`       ${o.targetMinutes} min${climb} · effort ~${o.targetRpe}/10 · accepts: ${o.accepts.slice(0, 4).join(", ")}${o.accepts.length > 4 ? ", ..." : ""}`);
      if (o.routine) for (const e of o.routine.exercises) console.log(`         · ${e.name}: ${e.sets} × ${e.reps ? `${e.reps} reps` : `${e.seconds}s`}`);
    });
    console.log(`\n  Log the workout ("log walk ${a.options[0]!.targetMinutes}") or mark an option done ("done 1").`);
  }
}

function chronicle() {
  for (const q of state.questlines) {
    banner(`Chronicle: ${title(q)}`);
    if (q.completed.length === 0) console.log("  Nothing written yet.");
    q.completed.forEach((_, i) => console.log(`\n${wrap(questStory(state, q, i, CTX))}`));
    if (q.battle?.outcome) console.log(`\n${wrap(epilogue(state, q, q.battle.outcome.grade, CTX))}`);
  }
}

function list() {
  console.log("\n  Questlines (start <id> <short|average|long> [focus]):");
  for (const t of Object.values(CTX.content.questlines)) console.log(`    ${t.id.padEnd(22)} ${t.title}: vs ${t.antagonist}`);
  console.log("\n  Classes (not exclusive: every session feeds the styles it belongs to):");
  for (const c of Object.values(CTX.content.classes)) {
    console.log(`    ${c.id.padEnd(10)} ${c.name}, ${c.style}`);
    console.log(`               tree: ${c.tree.map((n) => `${CTX.content.abilities[n.abilityId]?.name} (L${n.level})`).join(" → ")}`);
  }
  console.log("\n  Bounty types (bounty <id>):");
  for (const a of Object.values(CTX.content.archetypes)) console.log(`    ${a.id.padEnd(22)} ${a.name}`);
  console.log(`\n  Activities (log <activity> <minutes> [climb=<m>] [rpe=<1-10>]):\n${wrap(Object.keys(CTX.params.activities).join(", "), "    ")}`);
}

function help() {
  console.log(`
  sheet                     character sheet          board        current quests
  start <id> <length> [focus]   begin a questline; optional focus: ranger, berserker, warrior
  bounty <id>               take a single quest
  log <activity> <min> [climb=m] [rpe=n]             record a workout
  done <n> [minutes]        mark option n complete (e.g. an untracked strength routine)
  rest                      declare a rest day (rest is never punished)
  wait [days]               let time pass            chronicle    read your story
  sanctuary / leave         pause for illness or injury, and return
  fight                     face the boss            list         questlines, bounties, activities
  help · quit`);
}

// ---------------------------------------------------------------- battle
async function fight(q: QuestlineState) {
  if (!q.battle && !apply({ type: "BattleStarted", questlineId: q.plan.questlineId })) return;
  const qid = q.plan.questlineId;
  const cur = () => state.questlines.find((x) => x.plan.questlineId === qid)!;
  banner(`${bossName(cur())}`);
  console.log(wrap(cur().battle!.intro));
  while (!cur().battle!.outcome) {
    const b = cur().battle!;
    console.log(`\n  ${state.character!.name.padEnd(12)} HP ${bar(b.heroHp, b.heroMaxHp)} ${b.heroHp}/${b.heroMaxHp}   Stamina ${b.stamina}/${b.staminaMax}`);
    console.log(`  ${bossName(cur()).slice(0, 12).padEnd(12)} HP ${bar(b.bossHp, b.bossMaxHp)} ${b.bossHp}/${b.bossMaxHp}`);
    const warn = incomingWarning(b, cur(), CTX);
    if (warn) console.log(`  ⚠ ${warn}`);
    const actions = availableActions(b, CTX);
    actions.forEach((a, i) => {
      const ab = CTX.content.abilities[a];
      console.log(`   [${i + 1}] ${ab ? `${ab.name} (${ab.staminaCost} stamina): ${ab.description}` : a === "strike" ? "Strike" : "Guard (halve the next blow, recover stamina)"}`);
    });
    const input = await ask("\n  action> ");
    if (input === null) return;
    const n = Number(input);
    const action = Number.isInteger(n) && n >= 1 && n <= actions.length ? actions[n - 1]! : input;
    if (!apply({ type: "BattleActionTaken", questlineId: qid, action })) continue;
    for (const line of cur().battle!.log.at(-1)!) console.log(wrap(line));
  }
  const out = cur().battle!.outcome!;
  banner(`VICTORY: ${out.grade.toUpperCase()}  ·  ${out.turns} turns`);
  console.log(wrap(epilogue(state, cur(), out.grade, CTX)));
  console.log(`\n  Reward: ${out.loot}`);
}

// ---------------------------------------------------------------- onboarding
async function onboarding(): Promise<boolean> {
  banner("A new hero arrives in the realm");
  console.log(wrap("Nothing here is medical advice. If you have a heart, lung, or other medical condition, are pregnant, or feel unwell during exercise, talk to a health professional and go gently."));
  const name = (await ask("\n  Your hero's name: ")) || "Aldric";
  const bands: AgeBand[] = ["18-29", "30-39", "40-49", "50-59", "60-69", "70+"];
  const band = bands[Number(await ask(`  Age band ${bands.map((b, i) => `[${i + 1}] ${b}`).join(" ")}: `)) - 1] ?? "30-39";
  const sexes: SexForNorms[] = ["female", "male", "unspecified"];
  const sex = sexes[Number(await ask("  For comparison tables only: [1] female [2] male [3] prefer not to say: ")) - 1] ?? "unspecified";
  console.log(`  Activity level in a usual week:
   0 avoid walking or exertion   1 light activity only       2 10-60 min moderate
   3 over 1 h moderate           4 under 30 min vigorous     5 30-60 min vigorous
   6 1-3 h vigorous              7 over 3 h vigorous`);
  const rating = Math.min(7, Math.max(0, Number(await ask("  Level (0-7): ")) || 0));
  const strength = Math.min(3, Math.max(0, Number(await ask("  Strength-training days per week (0-3+): ")) || 0)) as 0 | 1 | 2 | 3;
  const toes = /^y/i.test((await ask("  Can you touch your toes? (y/n): ")) ?? "");
  const floor = /^y/i.test((await ask("  Can you get up from the floor without using your hands? (y/n): ")) ?? "");
  const answers: OnboardingAnswers = { ageBand: band, sex, activityRating: rating, strengthDaysPerWeek: strength, canTouchToes: toes, canRiseFromFloorWithoutHands: floor };
  state = replay([], CTX);
  return apply({ type: "CharacterCreated", userId: saveName, name, baseline: baselineFromOnboarding(answers) }, realToday());
}

// ---------------------------------------------------------------- main loop
function parseLog(args: string[]): Record<string, unknown> | null {
  const [type, min, ...rest] = args;
  const durationMin = Number(min);
  if (!type || !(durationMin > 0)) return null;
  const activity: Record<string, unknown> = { type, durationMin };
  for (const r of rest) {
    const [k, v] = r.split("=");
    if (k === "climb") activity.elevGainM = Number(v);
    if (k === "rpe") activity.rpe = Number(v);
    if (k === "km") activity.distanceM = Number(v) * 1000;
  }
  return activity;
}

async function main() {
  if (load()) console.log(`  Loaded ${SAVE_PATH}`);
  else if (!(await onboarding())) return;
  sheet();
  board();
  if (!scripted) help();

  for (;;) {
    const input = await ask("\n> ");
    if (input === null) break;
    const [cmd, ...args] = input.split(/\s+/);
    const open = state.questlines.find((q) => q.status === "active" && q.active);
    switch (cmd?.toLowerCase()) {
      case "":
        break;
      case "help": help(); break;
      case "sheet": sheet(); break;
      case "board": board(); break;
      case "list": list(); break;
      case "chronicle": chronicle(); break;
      case "start": {
        const [templateId, len = "average", focus] = args;
        if (!["short", "average", "long"].includes(len)) { console.log("  Length must be short, average or long."); break; }
        if (focus && !(focus in CTX.content.classes)) { console.log(`  Focus must be one of: ${Object.keys(CTX.content.classes).join(", ")} (or leave it off).`); break; }
        const id = `ql${state.questlines.length + 1}`;
        if (apply({ type: "QuestlineStarted", questlineId: id, templateId, length: len as QuestlineLength, ...(focus ? { focus } : {}) })) board();
        break;
      }
      case "bounty":
        if (apply({ type: "SingleQuestStarted", questId: `b${state.questlines.length + 1}`, archetypeId: args[0] })) board();
        break;
      case "log": {
        const activity = parseLog(args);
        if (!activity) { console.log('  Usage: log <activity> <minutes> [climb=m] [rpe=n]   e.g. "log hike 60 climb=250"'); break; }
        if (!(String(activity.type) in CTX.params.activities)) { console.log(`  Unknown activity "${String(activity.type)}". Type "list".`); break; }
        if (apply({ type: "ActivityLogged", activityId: `m${state.seq + 1}`, source: "manual", activity })) console.log("  ✓ Logged.");
        break;
      }
      case "done": {
        if (!open) { console.log("  No open quest."); break; }
        const opt = open.active!.options[Number(args[0]) - 1];
        if (!opt) { console.log("  Which option? e.g. done 1"); break; }
        const minutes = Number(args[1]);
        apply({ type: "QuestOptionCompleted", questlineId: open.plan.questlineId, optionId: opt.id, ...(minutes > 0 ? { durationMin: minutes } : {}) });
        break;
      }
      case "rest":
        if (apply({ type: "RestDeclared" })) console.log(`  You rest at the inn.${characterStats(state, CTX).wellRested ? " You wake Well-Rested." : ""}`);
        apply({ type: "DayTicked" }, today() + 1);
        break;
      case "wait": {
        const days = Math.max(1, Number(args[0]) || 1);
        apply({ type: "DayTicked" }, today() + days);
        console.log(`  ${days} day(s) pass.`);
        break;
      }
      case "sanctuary": if (apply({ type: "SanctuaryEntered", reason: "other" })) console.log("  You withdraw to the Sanctuary. Stats and quest deadlines are paused."); break;
      case "leave": if (apply({ type: "SanctuaryExited" })) console.log("  You leave the Sanctuary. Your quests are waiting, re-sized to where you are now."); break;
      case "fight": {
        const q = state.questlines.find((x) => x.status === "boss_ready");
        if (!q) { console.log("  No boss is ready. Finish every trial of a questline first."); break; }
        await fight(q);
        break;
      }
      case "quit": case "exit":
        rl.close();
        return;
      default:
        console.log('  Unknown command. Type "help".');
    }
  }
  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
