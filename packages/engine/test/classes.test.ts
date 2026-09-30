import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { DEFAULT_CONTENT, type ClassId } from "@me-rpg/content";
import { DEFAULT_PARAMS as P } from "@me-rpg/fitness-model";
import {
  BATTLE,
  DEFAULT_CONTEXT as CTX,
  availableActions,
  classLevel,
  primaryClass,
  reduce,
  replay,
  type BattleState,
  type GameState,
} from "@me-rpg/engine";

const START = 20_700;
const CLASSES = Object.keys(DEFAULT_CONTENT.classes) as ClassId[];
const STYLE: Record<ClassId, string> = { ranger: "run", berserker: "resistance_training", warrior: "circuit_training" };

function hero(): GameState {
  return replay([{ type: "CharacterCreated", seq: 1, day: START - 900, userId: "u1", name: "Aldric", baseline: { aerobic: 34, muscular_strength: 26, muscular_endurance: 26, mobility: 20 } }]);
}

function train(s: GameState, sessions: string[], minutes = 45): GameState {
  let day = s.day;
  for (const type of sessions) {
    day += 2;
    s = reduce(s, { type: "ActivityLogged", seq: s.seq + 1, day, activityId: `t${s.seq}`, source: "manual", activity: { type, durationMin: minutes } });
  }
  return s;
}

function completeAll(s: GameState): GameState {
  let x = s;
  for (let i = 0; i < 100 && x.questlines[0]!.active; i++) {
    const q = x.questlines[0]!.active!;
    x = reduce(x, { type: "QuestOptionCompleted", seq: x.seq + 1, day: Math.max(x.day, q.availableFromDay), questlineId: "q", optionId: q.options[0]!.id });
  }
  return reduce(x, { type: "BattleStarted", seq: x.seq + 1, day: x.day, questlineId: "q" });
}

function fight(s: GameState, pick: (turn: number, n: number) => number, eachTurn: (b: BattleState) => void = () => {}): GameState {
  let x = completeAll(s);
  for (let t = 0; t < 40 && !x.questlines[0]!.battle!.outcome; t++) {
    const b = x.questlines[0]!.battle!;
    eachTurn(b);
    const acts = availableActions(b, CTX);
    x = reduce(x, { type: "BattleActionTaken", seq: x.seq + 1, day: x.day, questlineId: "q", action: acts[pick(t, acts.length)]! });
  }
  return x;
}

const startLine = (s: GameState, templateId = "wolves_of_greywood") =>
  reduce(s, { type: "QuestlineStarted", seq: s.seq + 1, day: s.day, questlineId: "q", templateId, length: "short" });

describe("classes", () => {
  it("each style feeds its class; mixed activities feed several; mobility feeds none", () => {
    for (const c of CLASSES) {
      const s = train(hero(), Array(10).fill(STYLE[c]));
      expect(primaryClass(s.classXp)).toBe(c);
      expect(s.classXp[c]).toBeGreaterThan(0);
    }
  });

  it("class XP is mostly time: an hour's walk earns at least half an hour's hard run", () => {
    const walk = train(hero(), ["walk"], 60).classXp.ranger;
    const run = train(hero(), ["run"], 60).classXp.ranger;
    expect(walk / run).toBeGreaterThan(0.5);
    const mixed = train(hero(), ["hike_loaded"], 60).classXp;
    expect(mixed.ranger).toBeGreaterThan(0);
    expect(mixed.warrior).toBeGreaterThan(0);
    expect(Object.values(train(hero(), ["yoga"], 60).classXp).every((x) => x === 0)).toBe(true);
  });

  it("a specialist climbs one class faster; an all-rounder climbs all of them more slowly", () => {
    const n = 90;
    const specialist = train(hero(), Array(n).fill("resistance_training"));
    const allRounder = train(hero(), Array.from({ length: n }, (_, i) => STYLE[CLASSES[i % 3]!]));
    const lv = (s: GameState) => CLASSES.map((c) => classLevel(s.classXp[c]));
    expect(Math.max(...lv(specialist))).toBeGreaterThan(Math.max(...lv(allRounder)));
    expect(Math.min(...lv(allRounder))).toBeGreaterThan(Math.min(...lv(specialist)));
    for (const c of CLASSES) {
      const tree = DEFAULT_CONTENT.classes[c].tree.map((node) => node.abilityId);
      expect(tree.some((id) => allRounder.skills[id])).toBe(true);
    }
  });

  it("tree skills unlock in order at their class level", () => {
    const s = train(hero(), Array(120).fill("resistance_training"));
    const level = classLevel(s.classXp.berserker);
    for (const node of DEFAULT_CONTENT.classes.berserker.tree) {
      expect(Boolean(s.skills[node.abilityId])).toBe(node.level <= level);
    }
  });

  it("passives never appear as battle actions", () => {
    const passives = Object.values(DEFAULT_CONTENT.abilities).filter((a) => a.kind === "passive").map((a) => a.id);
    const s = startLine(train(hero(), Array.from({ length: 300 }, (_, i) => STYLE[CLASSES[i % 3]!])));
    const done = fight(s, () => 0, (b) => {
      for (const p of passives) expect(availableActions(b, CTX)).not.toContain(p);
    });
    expect(done.questlines[0]!.status).toBe("victorious");
  });

  it("class passives change the fight (Endure adds health, Fleet Foot adds stamina)", () => {
    const plain = completeAll(startLine(hero())).questlines[0]!.battle!;
    const trained = completeAll(startLine(train(hero(), [...Array(150).fill("circuit_training"), ...Array(150).fill("run")]))).questlines[0]!.battle!;
    expect(trained.skills.endure).toBeDefined();
    expect(trained.skills.fleet_foot).toBeDefined();
    expect(trained.staminaMax).toBeGreaterThan(plain.staminaMax);
  });

  it("with every tree unlocked, the hero still always wins and never drops below 1 HP", () => {
    const veteran = startLine(train(hero(), Array.from({ length: 400 }, (_, i) => STYLE[CLASSES[i % 3]!]), 50), "dragon_of_ashpeak");
    fc.assert(
      fc.property(fc.array(fc.nat(), { minLength: 1, maxLength: 20 }), (picks) => {
        const done = fight(veteran, (t, n) => picks[t % picks.length]! % n, (b) => expect(b.heroHp).toBeGreaterThanOrEqual(BATTLE.hpFloor));
        expect(done.questlines[0]!.status).toBe("victorious");
      }),
      { numRuns: 60 },
    );
  });

  it("a class focus leans the plan toward that style, within the same caps", () => {
    const base = train(hero(), Array(12).fill("walk"), 40);
    const plan = (focus?: ClassId) =>
      reduce(base, { type: "QuestlineStarted", seq: base.seq + 1, day: base.day + 1, questlineId: "q", templateId: "dragon_of_ashpeak", length: "average", ...(focus ? { focus } : {}) }).questlines[0]!.plan;
    const count = (p: ReturnType<typeof plan>, pred: (id: string, role: string) => boolean) => p.slots.filter((x) => pred(x.archetypeId, x.role)).length;
    const none = plan();
    expect(count(plan("berserker"), (_, r) => r === "strength")).toBeGreaterThan(count(none, (_, r) => r === "strength"));
    expect(count(plan("warrior"), (id) => id === "conditioning_session")).toBeGreaterThan(0);
    for (const f of [undefined, ...CLASSES]) {
      const p = plan(f);
      expect(p.focus).toBe(f ?? null);
      const boss = p.slots.find((x) => x.isBoss)!;
      const longs = p.slots.filter((x) => x.role === "long" && !x.isBoss && x.dayOffset >= boss.dayOffset - 30);
      expect(boss.plannedMinutes).toBeLessThanOrEqual(Math.ceil(Math.max(...longs.map((l) => l.plannedMinutes)) * P.progression.bossTaper.bossMaxVsLongestFrac) + 1);
      for (let w = 0; w < p.weekKinds.length; w++) {
        const days = new Set(p.slots.filter((x) => x.week === w && x.role !== "mobility").map((x) => x.dayOffset));
        expect(7 - days.size).toBeGreaterThanOrEqual(P.progression.minRestDaysPerWeek[p.level]);
      }
    }
    expect(() => reduce(base, { type: "QuestlineStarted", seq: base.seq + 1, day: base.day + 1, questlineId: "q", templateId: "dragon_of_ashpeak", length: "short", focus: "wizard" as ClassId })).toThrow();
  });
});
