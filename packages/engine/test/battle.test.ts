import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { DEFAULT_CONTENT } from "@healthrpg/content";
import { estimateVo2max } from "@healthrpg/fitness-model";
import {
  BATTLE,
  DEFAULT_CONTEXT as CTX,
  availableActions,
  epilogue,
  questStory,
  reduce,
  replay,
  type GameEvent,
  type GameState,
  type QuestlineLength,
} from "@healthrpg/engine";

const START = 20_700;
const TEMPLATES = Object.keys(DEFAULT_CONTENT.questlines);
const LENGTHS: QuestlineLength[] = ["short", "average", "long"];

function heroAt(baseline: { aerobic: number; muscular_strength: number; muscular_endurance: number; mobility: number }): GameState {
  const ev: GameEvent = { type: "CharacterCreated", seq: 1, day: START - 10, userId: "u1", name: "Aldric", baseline };
  return replay([ev]);
}

/** Start a questline and complete every quest with the chosen option on the day it opens. */
function readyForBoss(templateId: string, length: QuestlineLength, s0: GameState, pick: (i: number, n: number) => number = () => 0): GameState {
  let s = reduce(s0, { type: "QuestlineStarted", seq: s0.seq + 1, day: START, questlineId: "ql1", templateId, length });
  for (let i = 0; i < 200 && s.questlines[0]!.active; i++) {
    const q = s.questlines[0]!.active!;
    const o = q.options[pick(i, q.options.length)]!;
    s = reduce(s, {
      type: "ActivityLogged", seq: s.seq + 1, day: Math.max(s.day, q.availableFromDay), activityId: `a${s.seq}`, source: "manual",
      activity: { type: o.activity, durationMin: o.targetMinutes, ...(o.targetElevGainM ? { elevGainM: o.targetElevGainM } : {}) },
    });
  }
  return s;
}

function fight(s0: GameState, choose: (turn: number, actions: string[]) => string): GameState {
  let s = reduce(s0, { type: "BattleStarted", seq: s0.seq + 1, day: s0.day, questlineId: "ql1" });
  for (let t = 0; t < BATTLE.turnCap + 5 && !s.questlines[0]!.battle!.outcome; t++) {
    const q = s.questlines[0]!;
    const actions = availableActions(q.battle!, CTX);
    s = reduce(s, { type: "BattleActionTaken", seq: s.seq + 1, day: s.day, questlineId: "ql1", action: choose(t, actions) });
    const b = s.questlines[0]!.battle!;
    expect(b.heroHp).toBeGreaterThanOrEqual(BATTLE.hpFloor);
  }
  return s;
}

const capacity = fc.record({
  aerobic: fc.integer({ min: 15, max: 60 }),
  muscular_strength: fc.integer({ min: 10, max: 50 }),
  muscular_endurance: fc.integer({ min: 10, max: 50 }),
  mobility: fc.integer({ min: 10, max: 40 }),
});

describe("boss battle", () => {
  it.each(TEMPLATES)("%s: the hero always wins, within the turn cap, whatever they choose", (templateId) => {
    fc.assert(
      fc.property(capacity, fc.constantFrom(...LENGTHS), fc.array(fc.nat(), { minLength: 1, maxLength: 30 }), (baseline, length, picks) => {
        const ready = readyForBoss(templateId, length, heroAt(baseline), (i, n) => picks[i % picks.length]! % n);
        expect(ready.questlines[0]!.status).toBe("boss_ready");
        const done = fight(ready, (t, actions) => actions[picks[t % picks.length]! % actions.length]!);
        const q = done.questlines[0]!;
        expect(q.status).toBe("victorious");
        expect(q.battle!.outcome!.turns).toBeLessThanOrEqual(BATTLE.turnCap);
        // Nick-of-time wins only happen late.
        if (q.battle!.nickOfTime) expect(q.battle!.outcome!.turns).toBeGreaterThanOrEqual(BATTLE.nickOfTimeFromTurn);
        expect(["narrow", "valiant", "legendary"]).toContain(q.battle!.outcome!.grade);
        expect(q.battle!.outcome!.loot.length).toBeGreaterThan(0);
      }),
      { numRuns: 150 },
    );
  });

  it("earned abilities are offered as actions; unearned ones are refused", () => {
    const ready = readyForBoss("dragon_of_ashpeak", "average", heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 }));
    const s = reduce(ready, { type: "BattleStarted", seq: ready.seq + 1, day: ready.day, questlineId: "ql1" });
    const q = s.questlines[0]!;
    const actions = availableActions(q.battle!, CTX);
    for (const m of DEFAULT_CONTENT.questlines.dragon_of_ashpeak!.bossMechanics) expect(actions).toContain(m);
    expect(() => reduce(s, { type: "BattleActionTaken", seq: s.seq + 1, day: s.day, questlineId: "ql1", action: "fireball" })).toThrow();
  });

  it("smart play earns a better grade than careless play", () => {
    const ready = readyForBoss("dragon_of_ashpeak", "long", heroAt({ aerobic: 35, muscular_strength: 30, muscular_endurance: 30, mobility: 20 }));
    // Careless: always strike. Smart: counter telegraphed specials, heal when low, heavy strike otherwise.
    const careless = fight(ready, () => "strike").questlines[0]!.battle!;
    let smartState = reduce(ready, { type: "BattleStarted", seq: ready.seq + 1, day: ready.day, questlineId: "ql1" });
    while (!smartState.questlines[0]!.battle!.outcome) {
      const q = smartState.questlines[0]!;
      const b = q.battle!;
      const acts = availableActions(b, CTX);
      const incoming = DEFAULT_CONTENT.bosses.dragon_of_ashpeak!.attacks.find((a) => a.id === b.nextAttackId)!;
      const counter = incoming.counteredBy.find((c) => acts.includes(c));
      const action = counter ?? (b.heroHp < b.heroMaxHp * 0.45 && acts.includes("second_wind") ? "second_wind" : acts.includes("heavy_strike") ? "heavy_strike" : "strike");
      smartState = reduce(smartState, { type: "BattleActionTaken", seq: smartState.seq + 1, day: smartState.day, questlineId: "ql1", action });
    }
    const smart = smartState.questlines[0]!.battle!;
    const rank = { narrow: 0, valiant: 1, legendary: 2 };
    expect(rank[smart.outcome!.grade]).toBeGreaterThanOrEqual(rank[careless.outcome!.grade]);
    expect(smart.luck).toBeLessThanOrEqual(careless.luck);
  });

  it("the battle is locked until every quest is done", () => {
    const s = heroAt({ aerobic: 30, muscular_strength: 20, muscular_endurance: 20, mobility: 15 });
    const started = reduce(s, { type: "QuestlineStarted", seq: 2, day: START, questlineId: "ql1", templateId: "dragon_of_ashpeak", length: "short" });
    expect(() => reduce(started, { type: "BattleStarted", seq: 3, day: START, questlineId: "ql1" })).toThrow();
  });
});

describe("narrative", () => {
  it.each(TEMPLATES)("%s: every quest has a 3-6 sentence story with no unfilled slots", (templateId) => {
    for (const length of LENGTHS) {
      const s = readyForBoss(templateId, length, heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 }), (i, n) => i % n);
      const q = s.questlines[0]!;
      q.completed.forEach((_, i) => {
        const story = questStory(s, q, i, CTX);
        expect(story).not.toMatch(/[{}#]/);
        const count = story.split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 1).length;
        expect(count).toBeGreaterThanOrEqual(3);
        expect(count).toBeLessThanOrEqual(6);
        expect(questStory(s, q, i, CTX)).toBe(story);
      });
      for (const grade of ["narrow", "valiant", "legendary"] as const) expect(epilogue(s, q, grade, CTX)).not.toMatch(/[{}#]/);
    }
  });

  it("stories use the real workout numbers", () => {
    const s = readyForBoss("dragon_of_ashpeak", "short", heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 }));
    const q = s.questlines[0]!;
    const i = q.completed.findIndex((c) => q.plan.slots[c.slotIndex]!.isBoss);
    expect(questStory(s, q, i, CTX)).toContain(String(q.completed[i]!.minutes));
  });

  it("single quests tell a bounty story", () => {
    let s = heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 });
    s = reduce(s, { type: "SingleQuestStarted", seq: 2, day: START, questId: "b1", archetypeId: "strength_session" });
    s = reduce(s, { type: "QuestOptionCompleted", seq: 3, day: START, questlineId: "b1", optionId: s.questlines[0]!.active!.options[0]!.id });
    const story = questStory(s, s.questlines[0]!, 0, CTX);
    expect(story).toMatch(/Squire|Blacksmith|Shieldbearer/);
    expect(story).not.toMatch(/[{}#]/);
  });
});

describe("onboarding estimate (R5)", () => {
  it("reproduces the R5 worked example", () => {
    // research/r5 §7.2: man, 30-39, PA-R 3 -> ~40.3 ml/kg/min.
    expect(estimateVo2max({ ageBand: "30-39", sex: "male", activityRating: 3 }).estimate).toBeCloseTo(40.3, 0);
  });
});

describe("persistent skills", () => {
  it("skills unlock from quests, carry into the next questline, and rank up with training", () => {
    let s = readyForBoss("wolves_of_greywood", "short", heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 }));
    const after1 = structuredClone(s.skills);
    expect(Object.keys(after1)).toEqual(expect.arrayContaining(["second_wind", "shield_wall", "evade"]));
    // A second questline starts from the skills already earned.
    s = reduce(s, { type: "QuestlineStarted", seq: s.seq + 1, day: s.day + 1, questlineId: "ql2", templateId: "dragon_of_ashpeak", length: "short" });
    expect(s.skills.second_wind!.xp).toBe(after1.second_wind!.xp);
    // Training outside any quest still ranks a skill up.
    for (let i = 0; i < 40; i++) {
      s = reduce(s, { type: "ActivityLogged", seq: s.seq + 1, day: s.day + 1, activityId: `x${i}`, source: "manual", activity: { type: "resistance_training", durationMin: 40 } });
    }
    expect(s.skills.shield_wall!.rank).toBeGreaterThan(after1.shield_wall!.rank);
    expect(s.skills.shield_wall!.rank).toBeLessThanOrEqual(5);
  });

  it("an untrained skill dulls gently but never loses rank; one session restores it", async () => {
    const { sharpness, SKILL_MIN_SHARPNESS } = await import("@healthrpg/engine");
    let s = readyForBoss("wolves_of_greywood", "short", heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 }));
    const rank = s.skills.shield_wall!.rank;
    s = reduce(s, { type: "DayTicked", seq: s.seq + 1, day: s.day + 60 });
    expect(sharpness(s.skills.shield_wall!, s.day)).toBeLessThan(1);
    expect(sharpness(s.skills.shield_wall!, s.day)).toBeGreaterThanOrEqual(SKILL_MIN_SHARPNESS);
    expect(s.skills.shield_wall!.rank).toBe(rank);
    s = reduce(s, { type: "ActivityLogged", seq: s.seq + 1, day: s.day, activityId: "keep", source: "manual", activity: { type: "resistance_training", durationMin: 30 } });
    expect(sharpness(s.skills.shield_wall!, s.day)).toBe(1);
  });
});

describe("maintenance bounties", () => {
  it("two short sessions a week complete both bounties and pay bonus XP once", () => {
    let s = heroAt({ aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 });
    const created = s.character!.createdDay;
    const log = (day: number, type: string, min: number) =>
      (s = reduce(s, { type: "ActivityLogged", seq: s.seq + 1, day, activityId: `m${s.seq}`, source: "manual", activity: { type, durationMin: min } }));
    const xp0 = s.totals.xp;
    log(created + 1, "walk", 30);
    log(created + 3, "resistance_training", 30);
    expect(s.maintenance.done).toEqual(["keep_the_road", "keep_the_blade"]);
    const xpAfter = s.totals.xp;
    log(created + 4, "walk", 30); // a second walk that week earns no extra bonus
    const walkLoad = s.recent.at(-1)!.load;
    expect(s.totals.xp - xpAfter).toBe(Math.round(walkLoad));
    expect(xpAfter - xp0).toBeGreaterThan(50);
    log(created + 8, "walk", 20); // new week, too short to count
    expect(s.maintenance.done).toEqual([]);
  });
});
