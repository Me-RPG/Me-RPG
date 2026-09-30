// Phase 4 balance simulator. Deterministic: same code, same numbers.
//   npm run balance            -> outputs/balance/{personas,atrophy,battle}.csv, checks.json, report.html
//
// 1. Personas: synthetic players live for 52 weeks through the real engine.
// 2. Atrophy: train 12 weeks, stop, and compare the engine's decay to R1's curve.
// 3. Battles: a Monte Carlo of boss fights by play style.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ClassId } from "@healthrpg/content";
import { CAPACITIES, DEFAULT_PARAMS as P, type Capacity } from "@healthrpg/fitness-model";
import {
  BATTLE,
  DEFAULT_CONTEXT as CTX,
  Rng,
  availableActions,
  characterStats,
  classLevel,
  reduce,
  replay,
  spikeCap,
  type GameEvent,
  type GameState,
  type QuestlineLength,
  type QuestlineState,
} from "@healthrpg/engine";
import { renderReport } from "./report.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OUT = join(ROOT, "outputs", "balance");
const START = 20_000;
const WEEKS = 52;

// ------------------------------------------------------------------ engine driver
class Sim {
  s: GameState;
  events = 0;
  constructor(name: string, baseline: Record<Capacity, number>) {
    this.s = replay([{ type: "CharacterCreated", seq: 1, day: START, userId: name, name, baseline }], CTX);
  }
  apply(e: Record<string, unknown> & { type: GameEvent["type"] }, day = this.s.day): boolean {
    try {
      this.s = reduce(this.s, { ...e, seq: this.s.seq + 1, day } as GameEvent, CTX);
      return true;
    } catch {
      return false;
    }
  }
  log(day: number, type: string, durationMin: number, elevGainM?: number) {
    this.apply({ type: "ActivityLogged", activityId: `a${this.s.seq + 1}`, source: "manual", activity: { type, durationMin, ...(elevGainM ? { elevGainM } : {}) } }, day);
  }
  get open(): QuestlineState | undefined {
    return this.s.questlines.find((q) => q.status === "active" && q.active);
  }
}

/**
 * careless: always strike. random: any available action (stress test).
 * casual: mostly attacks, reacts to the telegraph half the time, heals when low.
 * smart: counters every special, heals low, uses its best attack.
 */
type Strategy = "careless" | "random" | "casual" | "smart";
const STRATEGIES: Strategy[] = ["careless", "random", "casual", "smart"];

function chooseAction(strategy: Strategy, q: QuestlineState, rng: Rng): string {
  const b = q.battle!;
  const acts = availableActions(b, CTX);
  if (strategy === "careless") return "strike";
  if (strategy === "random") return rng.pick(acts);
  const first = (...ids: string[]) => ids.find((id) => acts.includes(id));
  const incoming = CTX.content.bosses[q.plan.templateId]!.attacks.find((a) => a.id === b.nextAttackId)!;
  const counter = incoming.counteredBy.find((c) => acts.includes(c));
  if (strategy === "casual") {
    if (incoming.special && counter && rng.chance(0.5)) return counter;
    if (b.heroHp < b.heroMaxHp * 0.3) {
      const heal = first("second_wind", "rally");
      if (heal) return heal;
    }
    return rng.chance(0.5) ? (first("crushing_blow", "heavy_strike", "rage", "hunters_mark", "stamina_surge") ?? "strike") : "strike";
  }
  if (incoming.special && counter) return counter;
  if (b.heroHp < b.heroMaxHp * 0.4) {
    const heal = first("second_wind", "rally");
    if (heal) return heal;
  }
  if (b.rageTurns === 0 && b.heroHp < b.heroMaxHp * 0.6 && acts.includes("rage")) return "rage";
  if (b.markedStrikes === 0 && acts.includes("hunters_mark")) return "hunters_mark";
  const attack = first("crushing_blow", "heavy_strike", "stamina_surge");
  if (attack) return attack;
  if (!incoming.special && counter && b.heroHp < b.heroMaxHp * 0.6) return counter;
  return "strike";
}

interface BattleRecord {
  persona: string;
  boss: string;
  strategy: Strategy;
  grade: string;
  turns: number;
  minHpFrac: number;
  luck: number;
  crits: number;
  nickOfTime: boolean;
}

function fightBoss(sim: Sim, q: QuestlineState, strategy: Strategy, persona: string, rng: Rng): BattleRecord {
  sim.apply({ type: "BattleStarted", questlineId: q.plan.questlineId });
  const cur = () => sim.s.questlines.find((x) => x.plan.questlineId === q.plan.questlineId)!;
  for (let t = 0; t < 30 && !cur().battle!.outcome; t++) {
    sim.apply({ type: "BattleActionTaken", questlineId: q.plan.questlineId, action: chooseAction(strategy, cur(), rng.fork(`t${t}`)) });
  }
  const b = cur().battle!;
  return {
    persona, boss: q.plan.templateId, strategy, grade: b.outcome!.grade, turns: b.outcome!.turns,
    minHpFrac: b.heroMinHp / b.heroMaxHp, luck: b.luck, crits: b.crits, nickOfTime: b.nickOfTime,
  };
}

// ------------------------------------------------------------------ personas
interface Persona {
  id: string;
  label: string;
  baseline: Record<Capacity, number>;
  /** Questline length the persona picks (null = never starts questlines). */
  length: QuestlineLength | null;
  strategy: Strategy;
  /** Called once per day; does whatever this kind of player does. */
  day(sim: Sim, day: number, week: number, rng: Rng): void;
}

const BASE = (a: number, s: number, e: number, m: number): Record<Capacity, number> => ({ aerobic: a, muscular_strength: s, muscular_endurance: e, mobility: m });

/** Do the open quest today if it is open, with probability p, using a chosen option. */
function doQuest(sim: Sim, day: number, p: number, rng: Rng, filter?: (family: string) => boolean): boolean {
  const q = sim.open?.active;
  if (!q || day < q.availableFromDay || !rng.chance(p)) return false;
  if (filter && !filter(q.family)) return false;
  const o = q.options[rng.int(0, q.options.length - 1)]!;
  sim.log(day, o.activity, o.targetMinutes, o.targetElevGainM);
  return true;
}

const dow = (day: number) => (day - START) % 7; // 0 = the character's first day

const PERSONAS: Persona[] = [
  {
    id: "diligent", label: "Diligent (reference)", baseline: BASE(34, 26, 26, 26), length: "average", strategy: "smart",
    day: (sim, day, _w, rng) => void doQuest(sim, day, 1, rng),
  },
  {
    id: "beginner", label: "Sedentary beginner", baseline: BASE(24, 18, 18, 18), length: "long", strategy: "random",
    day: (sim, day, _w, rng) => void doQuest(sim, day, 0.7, rng),
  },
  {
    id: "weekend_hiker", label: "Weekend hiker", baseline: BASE(36, 18, 26, 18), length: "average", strategy: "smart",
    day: (sim, day, _w, rng) => {
      if (dow(day) < 5) return;
      if (!doQuest(sim, day, 1, rng) && dow(day) === 5) sim.log(day, "hike", 120, 300);
    },
  },
  {
    id: "lifter", label: "Lifter who skips cardio", baseline: BASE(32, 34, 26, 18), length: "average", strategy: "careless",
    day: (sim, day, _w, rng) => {
      if (doQuest(sim, day, 1, rng, (f) => f === "strength" || f === "mobility")) return;
      if ([0, 2, 4].includes(dow(day))) sim.log(day, "resistance_training", 50);
    },
  },
  {
    id: "injured", label: "Injured mid-year (Sanctuary)", baseline: BASE(34, 26, 26, 26), length: "average", strategy: "smart",
    day: (sim, day, week, rng) => {
      if (week === 10 && dow(day) === 0) sim.apply({ type: "SanctuaryEntered", reason: "injury" }, day);
      if (week === 16 && dow(day) === 0) sim.apply({ type: "SanctuaryExited" }, day);
      if (week >= 10 && week < 16) return;
      doQuest(sim, day, 1, rng);
    },
  },
  {
    id: "inconsistent", label: "Inconsistent (2 on, 2 off)", baseline: BASE(30, 22, 22, 22), length: "short", strategy: "random",
    day: (sim, day, week, rng) => void (week % 4 < 2 && doQuest(sim, day, 1, rng)),
  },
  {
    id: "overtrainer", label: "Overtrainer (quests + daily runs)", baseline: BASE(40, 26, 30, 18), length: "long", strategy: "smart",
    day: (sim, day, _w, rng) => {
      doQuest(sim, day, 1, rng);
      sim.log(day, "run", 60);
    },
  },
  {
    id: "maintainer", label: "Maintainer (bounties only)", baseline: BASE(36, 30, 30, 26), length: null, strategy: "smart",
    day: (sim, day) => {
      if (dow(day) === 1) sim.log(day, "walk", 30);
      if (dow(day) === 4) sim.log(day, "resistance_training", 30);
    },
  },
];

interface DayRow {
  persona: string;
  day: number;
  STR: number; END: number; AGI: number; VIT: number; level: number;
  realAerobic: number; realStrength: number;
  skillRanks: number;
  questsDone: number;
  maintenanceDone: number;
}

interface Checks {
  spikeCapViolations: number;
  restPenaltyDays: number;
  decayWhileMaintainingDays: number;
  questsOffered: number;
}

export const DEBUG: Record<string, number> = {};
function runPersona(p: Persona, rows: DayRow[], battles: BattleRecord[], checks: Checks) {
  const sim = new Sim(p.id, p.baseline);
  const rng = Rng.from("balance", p.id);
  const templates = Object.keys(CTX.content.questlines);
  let started = 0;
  let prev = sim.s;
  const seenQuests = new Set<string>();
  for (let d = 0; d < WEEKS * 7; d++) {
    const day = START + d;
    const week = Math.floor(d / 7);
    if (day > sim.s.day) sim.apply({ type: "DayTicked" }, day);

    // Questline management: fight a ready boss, start the next line when free.
    const ready = sim.s.questlines.find((q) => q.status === "boss_ready");
    if (ready) battles.push(fightBoss(sim, ready, p.strategy, p.id, rng.fork(`battle${started}`)));
    if (p.length && !sim.s.questlines.some((q) => q.status === "active")) {
      sim.apply({ type: "QuestlineStarted", questlineId: `ql${++started}`, templateId: templates[started % templates.length], length: p.length }, day);
    }

    p.day(sim, day, week, rng.fork(`d${d}`));

    // Check: every quest option offered respects the 30-day spike cap.
    for (const q of sim.s.questlines) {
      const a = q.active;
      if (!a) continue;
      const key = `${q.plan.questlineId}:${a.slotIndex}:${a.roll}`;
      if (seenQuests.has(key)) continue;
      seenQuests.add(key);
      checks.questsOffered++;
      for (const o of a.options) {
        const cap = spikeCap(sim.s.recent, CTX.content.familyOf(o.activity), sim.s.day, CTX);
        if (cap !== null && o.targetMinutes > Math.ceil(cap)) checks.spikeCapViolations++;
      }
    }

    // Check: a displayed stat never falls inside its grace window (normal rest is free).
    for (const c of CAPACITIES) {
      const before = prev.capacities[c];
      const after = sim.s.capacities[c];
      const dropped = after.baseline + after.displayFitness < before.baseline + before.displayFitness - 1e-9;
      // Grace is judged from the state before today's session could reset it.
      if (dropped && sim.s.day - before.displayLastStimulusDay <= P.capacities[c].graceDays) {
        checks.restPenaltyDays++;
        const k = `${p.id}/${c}/${before.displayFitness > before.fitness + 1e-9 ? "sanctuary-fade" : "other"}`;
        DEBUG[k] = (DEBUG[k] ?? 0) + 1;
      }
      if (dropped && sim.s.maintenance.done.length >= 2) {
        checks.decayWhileMaintainingDays++;
        const k = `maint:${p.id}/${c}`;
        DEBUG[k] = (DEBUG[k] ?? 0) + 1;
      }
    }
    prev = sim.s;

    const st = characterStats(sim.s, CTX);
    rows.push({
      persona: p.id, day: d, STR: st.STR, END: st.END, AGI: st.AGI, VIT: st.VIT, level: st.level,
      realAerobic: round(sim.s.capacities.aerobic.baseline + sim.s.capacities.aerobic.fitness),
      realStrength: round(sim.s.capacities.muscular_strength.baseline + sim.s.capacities.muscular_strength.fitness),
      skillRanks: Object.values(sim.s.skills).reduce((a, s) => a + s.rank, 0),
      questsDone: sim.s.questlines.reduce((a, q) => a + q.completed.length, 0),
      maintenanceDone: sim.s.maintenance.done.length,
    });
  }
}

// ------------------------------------------------------------------ atrophy vs R1
interface AtrophyRow { capacity: Capacity; week: number; engineLossPct: number; r1Low: number; r1Mid: number; r1High: number }

function atrophyCheck(): AtrophyRow[] {
  const r1 = JSON.parse(readFileSync(join(ROOT, "research", "r1-detraining", "params.json"), "utf8"));
  // 12 weeks of balanced training that hits every capacity, then stop completely.
  const sim = new Sim("atrophy", BASE(34, 26, 26, 26));
  for (let w = 0; w < 12; w++) {
    const d = START + w * 7;
    sim.log(d, "run", 40);
    sim.log(d + 1, "resistance_training", 45);
    sim.log(d + 2, "yoga", 30);
    sim.log(d + 3, "calisthenics", 30);
    sim.log(d + 4, "hike", 60, 200);
    sim.log(d + 5, "stretching_mobility", 20);
  }
  // R1's clock counts days since training stopped: start it the day after the last session.
  const stopDay = START + 11 * 7 + 6;
  sim.apply({ type: "DayTicked" }, stopDay);
  const gain0 = Object.fromEntries(CAPACITIES.map((c) => [c, sim.s.capacities[c].fitness])) as Record<Capacity, number>;
  const rows: AtrophyRow[] = [];
  for (const week of [0, 1, 2, 4, 8, 12]) {
    const s = week === 0 ? sim.s : reduce(sim.s, { type: "DayTicked", seq: sim.s.seq + 1, day: stopDay + week * 7 }, CTX);
    for (const c of CAPACITIES) {
      const ref = r1.capacities[c].pct_loss_by_week[String(week)];
      rows.push({
        capacity: c, week,
        engineLossPct: round(100 * (1 - s.capacities[c].fitness / gain0[c])),
        r1Low: ref?.low ?? 0, r1Mid: ref?.mid ?? 0, r1High: ref?.high ?? 0,
      });
    }
  }
  return rows;
}

// ------------------------------------------------------------------ battle Monte Carlo
function battleMonteCarlo(perCell: number): BattleRecord[] {
  const out: BattleRecord[] = [];
  const rng = Rng.from("balance", "battles");
  const templates = Object.keys(CTX.content.questlines);
  for (const boss of templates) {
    for (const strategy of STRATEGIES) {
      for (let i = 0; i < perCell; i++) {
        const r = rng.fork(`${boss}${strategy}${i}`);
        const sim = new Sim(`mc${i}`, BASE(r.int(22, 50), r.int(15, 45), r.int(15, 45), r.int(12, 40)));
        sim.apply({ type: "QuestlineStarted", questlineId: "q", templateId: boss, length: r.pick(["short", "average", "long"] as const) }, START);
        for (let k = 0; k < 200 && sim.open; k++) {
          const q = sim.open.active!;
          const o = q.options[r.int(0, q.options.length - 1)]!;
          sim.log(Math.max(sim.s.day, q.availableFromDay), o.activity, o.targetMinutes, o.targetElevGainM);
        }
        out.push(fightBoss(sim, sim.s.questlines[0]!, strategy, "monte_carlo", r.fork("fight")));
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ class parity
const CLASS_STYLE: Record<ClassId, string[]> = {
  ranger: ["run", "walk", "hike", "cycle_road"],
  berserker: ["resistance_training"],
  warrior: ["circuit_training", "calisthenics", "rowing"],
};

interface ParityRecord extends BattleRecord { cls: ClassId; classLevel: number; treeSkills: number }

/** Specialists of each class train only their style for `weeks`, then fight. Outcomes should be comparable. */
function classParity(perCell: number, weeks: number): ParityRecord[] {
  const out: ParityRecord[] = [];
  const rng = Rng.from("balance", "parity");
  for (const cls of Object.keys(CLASS_STYLE) as ClassId[]) {
    for (const strategy of ["casual", "smart"] as Strategy[]) {
      for (let i = 0; i < perCell; i++) {
        const r = rng.fork(`${cls}${strategy}${i}`);
        const sim = new Sim(`p${cls}${i}`, BASE(r.int(28, 42), r.int(18, 34), r.int(18, 34), r.int(15, 30)));
        for (let d = 0; d < weeks * 7; d++) {
          if ([0, 2, 4, 6].includes(d % 7)) sim.log(START + d, r.pick(CLASS_STYLE[cls]), r.int(30, 60));
        }
        sim.apply({ type: "QuestlineStarted", questlineId: "q", templateId: r.pick(Object.keys(CTX.content.questlines)), length: "short" }, sim.s.day + 1);
        for (let k = 0; k < 100 && sim.open; k++) {
          const q = sim.open.active!;
          sim.apply({ type: "QuestOptionCompleted", questlineId: "q", optionId: q.options[0]!.id }, Math.max(sim.s.day, q.availableFromDay));
        }
        const tree = CTX.content.classes[cls].tree;
        const rec = fightBoss(sim, sim.s.questlines[0]!, strategy, "parity", r.fork("fight"));
        out.push({ ...rec, cls, classLevel: classLevel(sim.s.classXp[cls]), treeSkills: tree.filter((n) => sim.s.skills[n.abilityId]).length });
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ main
const round =(v: number, dp = 1) => Math.round(v * 10 ** dp) / 10 ** dp;
function csv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!) as (keyof T)[];
  return [keys.join(","), ...rows.map((r) => keys.map((k) => String(r[k])).join(","))].join("\n") + "\n";
}

function main() {
  const t0 = Date.now();
  mkdirSync(OUT, { recursive: true });
  const rows: DayRow[] = [];
  const personaBattles: BattleRecord[] = [];
  const checks: Checks = { spikeCapViolations: 0, restPenaltyDays: 0, decayWhileMaintainingDays: 0, questsOffered: 0 };
  for (const p of PERSONAS) runPersona(p, rows, personaBattles, checks);
  const atrophy = atrophyCheck();
  const perCell = Number(process.env.BATTLES ?? 300);
  const battles = battleMonteCarlo(perCell);
  const parity = classParity(Math.max(50, Math.round(perCell / 2)), 26);

  writeFileSync(join(OUT, "personas.csv"), csv(rows));
  writeFileSync(join(OUT, "atrophy.csv"), csv(atrophy));
  writeFileSync(join(OUT, "battle.csv"), csv([...battles, ...personaBattles]));
  writeFileSync(join(OUT, "class_parity.csv"), csv(parity));

  const summary = summarize(rows, battles, personaBattles, atrophy, checks, parity);
  writeFileSync(join(OUT, "checks.json"), JSON.stringify(summary, null, 2) + "\n");
  writeFileSync(join(OUT, "report.html"), renderReport({ personas: PERSONAS.map((p) => ({ id: p.id, label: p.label })), rows, atrophy, battles, personaBattles, summary, params: { version: P.version, battle: BATTLE } }));

  if (process.env.DEBUG) console.log(DEBUG);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nwrote ${OUT}\\{personas.csv, atrophy.csv, battle.csv, checks.json, report.html} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

export interface Summary {
  checks: Checks & { pass: boolean };
  atrophyMaxDeviationFromR1Mid: number;
  atrophyOutsideR1Band: number;
  personas: Record<string, { finalSTR: number; finalEND: number; finalAGI: number; finalVIT: number; questsDone: number; bossesWon: number; skillRanks: number }>;
  battle: Record<string, BattleSummary>;
  /** Keyed "class/strategy". */
  classParity: Record<string, BattleSummary & { meanClassLevel: number; meanTreeSkills: number }>;
  /** Largest gap between classes in legendary % for the same strategy (lower is fairer). */
  classParityMaxGapLegendaryPts: number;
}

export interface BattleSummary {
  n: number; legendary: number; valiant: number; narrow: number; medianMinHpPct: number;
  minHpAtOrBelow10Pct: number; reached1Hp: number; nickOfTime: number; turnCap: number; meanTurns: number;
}

function summarizeBattles(bs: BattleRecord[]): BattleSummary {
  const pct = (f: (b: BattleRecord) => boolean) => round((100 * bs.filter(f).length) / bs.length);
  const mins = bs.map((b) => b.minHpFrac).sort((a, b) => a - b);
  return {
    n: bs.length,
    legendary: pct((b) => b.grade === "legendary"),
    valiant: pct((b) => b.grade === "valiant"),
    narrow: pct((b) => b.grade === "narrow"),
    medianMinHpPct: round(100 * mins[Math.floor(mins.length / 2)]!),
    minHpAtOrBelow10Pct: pct((b) => b.minHpFrac <= 0.1),
    reached1Hp: pct((b) => b.minHpFrac * 1000 < 10 && b.luck > (b.nickOfTime ? 1 : 0)),
    nickOfTime: pct((b) => b.nickOfTime),
    turnCap: pct((b) => b.turns >= BATTLE.turnCap),
    meanTurns: round(bs.reduce((a, b) => a + b.turns, 0) / bs.length),
  };
}

function summarize(rows: DayRow[], battles: BattleRecord[], personaBattles: BattleRecord[], atrophy: AtrophyRow[], checks: Checks, parity: ParityRecord[]): Summary {
  const personas: Summary["personas"] = {};
  for (const p of PERSONAS) {
    const last = rows.filter((r) => r.persona === p.id).at(-1)!;
    personas[p.id] = {
      finalSTR: last.STR, finalEND: last.END, finalAGI: last.AGI, finalVIT: last.VIT, questsDone: last.questsDone,
      bossesWon: personaBattles.filter((b) => b.persona === p.id).length, skillRanks: last.skillRanks,
    };
  }
  const battle: Summary["battle"] = {};
  for (const strategy of STRATEGIES) battle[strategy] = summarizeBattles(battles.filter((b) => b.strategy === strategy));
  const classParitySummary: Summary["classParity"] = {};
  for (const cls of Object.keys(CLASS_STYLE) as ClassId[]) {
    for (const strategy of ["casual", "smart"]) {
      const ps = parity.filter((p) => p.cls === cls && p.strategy === strategy);
      classParitySummary[`${cls}/${strategy}`] = {
        ...summarizeBattles(ps),
        meanClassLevel: round(ps.reduce((a, p) => a + p.classLevel, 0) / ps.length),
        meanTreeSkills: round(ps.reduce((a, p) => a + p.treeSkills, 0) / ps.length),
      };
    }
  }
  const gaps = ["casual", "smart"].map((st) => {
    const leg = (Object.keys(CLASS_STYLE) as ClassId[]).map((c) => classParitySummary[`${c}/${st}`]!.legendary);
    return Math.max(...leg) - Math.min(...leg);
  });
  const withRef = atrophy.filter((a) => a.week > 0);
  return {
    checks: { ...checks, pass: checks.spikeCapViolations === 0 && checks.restPenaltyDays === 0 },
    atrophyMaxDeviationFromR1Mid: round(Math.max(...withRef.map((a) => Math.abs(a.engineLossPct - a.r1Mid)))),
    atrophyOutsideR1Band: withRef.filter((a) => a.engineLossPct < a.r1Low - 1 || a.engineLossPct > a.r1High + 1).length,
    personas,
    battle,
    classParity: classParitySummary,
    classParityMaxGapLegendaryPts: round(Math.max(...gaps)),
  };
}

main();
