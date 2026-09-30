import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { DEFAULT_CONTENT } from "@me-rpg/content";
import { DEFAULT_PARAMS as P } from "@me-rpg/fitness-model";
import {
  OPTION_LOAD_TOLERANCE,
  QUESTLINE_LENGTH_WEEKS,
  hashState,
  reduce,
  replay,
  spikeCap,
  DEFAULT_CONTEXT as CTX,
  type GameEvent,
  type GameState,
  type QuestlineLength,
  type QuestlineState,
} from "@me-rpg/engine";

const START = 20_700;
const TEMPLATES = Object.keys(DEFAULT_CONTENT.questlines);
const LENGTHS: QuestlineLength[] = ["short", "average", "long"];
const CASES = TEMPLATES.flatMap((t) => LENGTHS.map((l) => [t, l] as const));

function created(day = START - 60): GameEvent {
  return {
    type: "CharacterCreated",
    seq: 1,
    day,
    userId: "u1",
    name: "Aldric",
    baseline: { aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 },
  };
}

/** Optional prior history: `weeks` of walks and lifts ending just before START. */
function history(weeks: number, walkMin: number, fromSeq: number): GameEvent[] {
  const out: GameEvent[] = [];
  let seq = fromSeq;
  for (let w = 0; w < weeks; w++) {
    const base = START - weeks * 7 + w * 7;
    out.push({ type: "ActivityLogged", seq: seq++, day: base, activityId: `h${seq}`, source: "manual", activity: { type: "walk", durationMin: walkMin } });
    out.push({ type: "ActivityLogged", seq: seq++, day: base + 2, activityId: `h${seq}`, source: "manual", activity: { type: "resistance_training", durationMin: 40 } });
    out.push({ type: "ActivityLogged", seq: seq++, day: base + 4, activityId: `h${seq}`, source: "manual", activity: { type: "walk", durationMin: walkMin } });
  }
  return out;
}

function start(templateId: string, length: QuestlineLength = "average", weeks = 0, walkMin = 30): GameState {
  const pre = [created(), ...history(weeks, walkMin, 2)];
  return reduce(replay(pre), { type: "QuestlineStarted", seq: pre.length + 1, day: START, questlineId: "ql1", templateId, length });
}

function startSingle(archetypeId: string, weeks = 0, walkMin = 30): GameState {
  const pre = [created(), ...history(weeks, walkMin, 2)];
  return reduce(replay(pre), { type: "SingleQuestStarted", seq: pre.length + 1, day: START, questId: "b1", archetypeId });
}

/** A diligent player: every quest done with its first option on the day it opens. */
function playThrough(s0: GameState, pick: (i: number, n: number) => number = () => 0): { final: GameState; states: GameState[] } {
  let s = s0;
  let seq = s.seq;
  const states = [s];
  for (let guard = 0; guard < 200 && s.questlines[0]!.active; guard++) {
    const q = s.questlines[0]!.active!;
    const opt = q.options[pick(guard, q.options.length)]!;
    const activity = { type: opt.activity, durationMin: opt.targetMinutes, ...(opt.targetElevGainM ? { elevGainM: opt.targetElevGainM } : {}) };
    s = reduce(s, { type: "ActivityLogged", seq: ++seq, day: Math.max(s.day, q.availableFromDay), activityId: `p${seq}`, source: "manual", activity });
    states.push(s);
  }
  return { final: s, states };
}

const ql = (s: GameState): QuestlineState => s.questlines[0]!;

describe("quest plan", () => {
  it.each(CASES)("%s (%s): plan follows the R3 progression rules", (templateId, length) => {
    for (const [weeks, walk] of [[0, 30], [4, 45], [5, 90]] as const) {
      const { plan } = ql(start(templateId, length, weeks, walk));
      const template = DEFAULT_CONTENT.questlines[templateId]!;
      expect(plan.kind).toBe("questline");
      expect(plan.length).toBe(length);
      expect(plan.weekKinds).toHaveLength(QUESTLINE_LENGTH_WEEKS[length]);

      const longs = plan.slots.filter((s) => s.role === "long");
      const boss = longs.find((s) => s.isBoss)!;
      expect(longs.filter((s) => s.isBoss)).toHaveLength(1);
      expect(plan.slots[plan.slots.length - 1]!.isBoss).toBe(true);

      // Build-week long sessions grow at most the fastest weekly rate (walking, 15%).
      const builds = longs.filter((s) => s.weekKind === "B");
      for (let i = 1; i < builds.length; i++) {
        expect(builds[i]!.plannedMinutes).toBeLessThanOrEqual(Math.ceil(builds[i - 1]!.plannedMinutes * (1 + P.progression.weeklyIncreaseFrac.foot_walk)) + 1);
      }
      // Boss ≤ 1.1 × longest in the prior 30 days, and a ≥ 90% rehearsal happened in that window.
      const prior = longs.filter((s) => !s.isBoss && s.dayOffset >= boss.dayOffset - 30);
      const longestPrior = Math.max(...prior.map((s) => s.plannedMinutes));
      expect(boss.plannedMinutes).toBeLessThanOrEqual(Math.ceil(longestPrior * P.progression.bossTaper.bossMaxVsLongestFrac) + 1);
      expect(longestPrior).toBeGreaterThanOrEqual(Math.floor(boss.plannedMinutes * P.progression.bossTaper.rehearsalMinFracOfBoss));
      expect(boss.plannedMinutes).toBeLessThanOrEqual(template.bossDemand.minutes);

      // No hard sessions on consecutive days; none in the taper; at least the minimum rest days each week.
      const hard = plan.slots.filter((s) => s.role === "hard");
      for (const h of hard) expect(h.weekKind).toBe("B");
      for (let i = 1; i < hard.length; i++) expect(hard[i]!.dayOffset - hard[i - 1]!.dayOffset).toBeGreaterThan(1);
      for (let w = 0; w < plan.weekKinds.length; w++) {
        const trainingDays = new Set(plan.slots.filter((s) => s.week === w && s.role !== "mobility").map((s) => s.dayOffset));
        expect(7 - trainingDays.size).toBeGreaterThanOrEqual(P.progression.minRestDaysPerWeek[plan.level]);
      }
    }
  });

  it("short/average/long give 2/6/12 weeks, and longer lines reach a bigger boss", () => {
    const bosses = LENGTHS.map((l) => ql(start("dragon_of_ashpeak", l)).plan);
    expect(bosses.map((p) => p.weekKinds.length)).toEqual([2, 6, 12]);
    expect(bosses[0]!.bossMinutes).toBeLessThan(bosses[1]!.bossMinutes);
    expect(bosses[1]!.bossMinutes).toBeLessThan(bosses[2]!.bossMinutes);
  });

  it("scales the boss down for a beginner and plans the full target for a strong walker", () => {
    const beginner = ql(start("wolves_of_greywood")).plan;
    expect(beginner.bossScaled).toBe(true);
    const strong = ql(start("wolves_of_greywood", "average", 5, 90)).plan;
    expect(strong.bossScaled).toBe(false);
    expect(strong.bossMinutes).toBe(DEFAULT_CONTENT.questlines.wolves_of_greywood!.bossDemand.minutes);
  });

  it("is deterministic and depends on the questline seed", () => {
    expect(hashState(start("dragon_of_ashpeak", "long", 4, 45))).toBe(hashState(start("dragon_of_ashpeak", "long", 4, 45)));
  });
});

describe("materialized quests", () => {
  it.each(CASES)("%s (%s): every quest offers 2-4 equivalent options within the spike cap", (templateId, length) => {
    for (const [weeks, walk] of [[0, 30], [4, 45]] as const) {
      const { states } = playThrough(start(templateId, length, weeks, walk));
      for (const s of states) {
        const q = ql(s).active;
        if (!q) continue;
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.options.length).toBeLessThanOrEqual(4);
        const target = q.options[0]!.targetMetMinutes;
        for (const o of q.options) {
          expect(Math.abs(o.targetMetMinutes - target)).toBeLessThanOrEqual(OPTION_LOAD_TOLERANCE * target + 0.1);
          const cap = spikeCap(s.recent, DEFAULT_CONTENT.familyOf(o.activity), s.day, CTX);
          if (cap !== null) expect(o.targetMinutes).toBeLessThanOrEqual(Math.ceil(cap));
        }
      }
    }
  });

  it("strength options carry a scaled routine", () => {
    const q = ql(start("dragon_of_ashpeak")).active!;
    expect(q.archetypeId).toBe("strength_session");
    expect(q.options.every((o) => o.routine && o.routine.exercises.length > 0)).toBe(true);
  });
});

describe("questline progression", () => {
  it.each(CASES)("%s (%s): a diligent player always reaches the boss with its mechanics trained", (templateId, length) => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 5 }), fc.integer({ min: 20, max: 90 }), fc.array(fc.nat(), { minLength: 1, maxLength: 50 }), (weeks, walk, picks) => {
        const { final } = playThrough(start(templateId, length, weeks, walk), (i, n) => picks[i % picks.length]! % n);
        const q = ql(final);
        expect(q.status).toBe("boss_ready");
        expect(q.completed).toHaveLength(q.plan.slots.length);
        for (const m of DEFAULT_CONTENT.questlines[templateId]!.bossMechanics) expect(q.abilities).toContain(m);
      }),
      { numRuns: 25 },
    );
  });

  it("a lapsed quest re-rolls instead of failing, and Sanctuary pauses the window", () => {
    const s0 = start("dragon_of_ashpeak");
    const first = ql(s0).active!;
    const later = reduce(s0, { type: "DayTicked", seq: s0.seq + 1, day: first.dueDay + 30 });
    expect(ql(later).status).toBe("active");
    expect(ql(later).active!.slotIndex).toBe(first.slotIndex);
    expect(ql(later).active!.roll).toBe(first.roll + 1);
    expect(ql(later).active!.dueDay).toBeGreaterThan(later.day);

    const inn = reduce(s0, { type: "SanctuaryEntered", seq: s0.seq + 1, day: START + 1, reason: "illness" });
    const stay = reduce(inn, { type: "DayTicked", seq: inn.seq + 1, day: first.dueDay + 20 });
    expect(ql(stay).active!.roll).toBe(first.roll);
    const back = reduce(stay, { type: "SanctuaryExited", seq: stay.seq + 1, day: stay.day + 1 });
    expect(ql(back).active!.availableFromDay).toBe(back.day);
    expect(ql(back).active!.dueDay).toBeGreaterThan(back.day);
  });

  it("marking an option complete logs its nominal activity and advances", () => {
    const s0 = start("dragon_of_ashpeak");
    const q = ql(s0).active!;
    const s1 = reduce(s0, { type: "QuestOptionCompleted", seq: s0.seq + 1, day: START, questlineId: "ql1", optionId: q.options[0]!.id });
    expect(ql(s1).completed).toHaveLength(1);
    expect(ql(s1).active!.slotIndex).toBe(q.slotIndex + 1);
    expect(s1.totals.sessions).toBe(s0.totals.sessions + 1);
    expect(() => reduce(s1, { type: "QuestOptionCompleted", seq: s1.seq + 1, day: s1.day, questlineId: "ql1", optionId: "nope" })).toThrow();
  });

  it("a session that falls short does not complete the quest", () => {
    const s0 = start("dragon_of_ashpeak");
    const opt = ql(s0).active!.options[0]!;
    const s1 = reduce(s0, {
      type: "ActivityLogged", seq: s0.seq + 1, day: START, activityId: "short", source: "manual",
      activity: { type: opt.activity, durationMin: Math.floor(opt.targetMinutes * 0.5) },
    });
    expect(ql(s1).completed).toHaveLength(0);
    expect(s1.totals.sessions).toBe(s0.totals.sessions + 1); // still counts for stats
  });
});

describe("single quests", () => {
  const TYPES = Object.keys(DEFAULT_CONTENT.archetypes);

  it.each(TYPES)("%s: a single quest is one sized quest that completes without a boss", (archetypeId) => {
    for (const [weeks, walk] of [[0, 30], [4, 60]] as const) {
      const s0 = startSingle(archetypeId, weeks, walk);
      const q = ql(s0);
      expect(q.plan.kind).toBe("single");
      expect(q.plan.slots).toHaveLength(1);
      expect(q.plan.slots[0]!.isBoss).toBe(false);
      const active = q.active!;
      expect(active.options.length).toBeGreaterThanOrEqual(2);
      for (const o of active.options) {
        const cap = spikeCap(s0.recent, DEFAULT_CONTENT.familyOf(o.activity), s0.day, CTX);
        if (cap !== null) expect(o.targetMinutes).toBeLessThanOrEqual(Math.ceil(cap));
      }
      const { final } = playThrough(s0);
      expect(ql(final).status).toBe("complete");
      expect(ql(final).active).toBeNull();
      expect(ql(final).completed).toHaveLength(1);
    }
  });

  it("a single quest can run alongside a questline without stealing its completion", () => {
    const s0 = start("dragon_of_ashpeak", "short");
    const s1 = reduce(s0, { type: "SingleQuestStarted", seq: s0.seq + 1, day: START, questId: "b1", archetypeId: "mobility_session" });
    expect(s1.questlines).toHaveLength(2);
    // The questline opens with a strength quest; a yoga session should complete the bounty instead.
    const yoga = s1.questlines[1]!.active!.options[0]!;
    const s2 = reduce(s1, { type: "ActivityLogged", seq: s1.seq + 1, day: START, activityId: "y1", source: "manual", activity: { type: yoga.activity, durationMin: yoga.targetMinutes } });
    expect(s2.questlines[0]!.completed).toHaveLength(0);
    expect(s2.questlines[1]!.status).toBe("complete");
    expect(() => reduce(s2, { type: "SingleQuestStarted", seq: s2.seq + 1, day: START, questId: "b1", archetypeId: "long_walk" })).toThrow();
    expect(() => reduce(s2, { type: "SingleQuestStarted", seq: s2.seq + 1, day: START, questId: "b2", archetypeId: "nope" })).toThrow();
  });
});
