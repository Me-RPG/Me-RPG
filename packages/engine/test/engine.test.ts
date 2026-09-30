import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { CAPACITIES, DEFAULT_PARAMS, type ActivityType } from "@me-rpg/fitness-model";

const ACTIVITY_TYPES = Object.keys(DEFAULT_PARAMS.activities);
import {
  Rng,
  characterStats,
  hashState,
  realValue,
  reduce,
  replay,
  type GameEvent,
} from "@me-rpg/engine";

const START = 20_000;
const baseline = { aerobic: 32, muscular_strength: 15, muscular_endurance: 18, mobility: 12 };

function created(): GameEvent {
  return { type: "CharacterCreated", seq: 1, day: START, userId: "u1", name: "Aldric", baseline };
}

function activity(seq: number, day: number, type: ActivityType, durationMin: number, extra: object = {}): GameEvent {
  return { type: "ActivityLogged", seq, day, activityId: `a${seq}`, source: "manual", activity: { type, durationMin, ...extra } };
}

/** Arbitrary well-formed event log: creation, then activities/rest/sanctuary on increasing days. */
const eventLog = fc
  .array(
    fc.record({
      gap: fc.integer({ min: 0, max: 20 }),
      kind: fc.constantFrom("activity", "rest", "sanctuaryIn", "sanctuaryOut", "tick"),
      type: fc.constantFrom(...ACTIVITY_TYPES),
      minutes: fc.integer({ min: 5, max: 240 }),
      rpe: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
      elev: fc.option(fc.integer({ min: 0, max: 1500 }), { nil: undefined }),
    }),
    { maxLength: 60 },
  )
  .map((steps) => {
    const events: GameEvent[] = [created()];
    let day = START;
    steps.forEach((st, i) => {
      day += st.gap;
      const seq = i + 2;
      switch (st.kind) {
        case "activity": {
          const extra: Record<string, number> = {};
          if (st.rpe !== undefined) extra.rpe = st.rpe;
          if (st.elev !== undefined) extra.elevGainM = st.elev;
          events.push(activity(seq, day, st.type, st.minutes, extra));
          break;
        }
        case "rest": events.push({ type: "RestDeclared", seq, day }); break;
        case "sanctuaryIn": events.push({ type: "SanctuaryEntered", seq, day, reason: "illness" }); break;
        case "sanctuaryOut": events.push({ type: "SanctuaryExited", seq, day }); break;
        case "tick": events.push({ type: "DayTicked", seq, day }); break;
      }
    });
    return events;
  });

describe("rng", () => {
  it("is reproducible for the same seed and independent across forks", () => {
    const a = Rng.from("u1", "ql1", 3);
    const b = Rng.from("u1", "ql1", 3);
    const seqA = Array.from({ length: 5 }, () => a.nextU32());
    const seqB = Array.from({ length: 5 }, () => b.nextU32());
    expect(seqA).toEqual(seqB);
    expect(Rng.from("x").fork("battle").next()).not.toEqual(Rng.from("x").fork("story").next());
  });

  it("int stays in range", () => {
    fc.assert(fc.property(fc.string(), fc.integer({ min: -50, max: 50 }), fc.integer({ min: 0, max: 50 }), (seed, min, span) => {
      const v = new Rng(seed).int(min, min + span);
      return v >= min && v <= min + span;
    }));
  });
});

describe("engine determinism", () => {
  it("replaying the same log yields the same state hash", () => {
    fc.assert(fc.property(eventLog, (events) => hashState(replay(events)) === hashState(replay(events))), { numRuns: 200 });
  });

  it("ignores duplicate activity imports", () => {
    const once = replay([created(), activity(2, START + 1, "run", 30)]);
    const dup = replay([created(), activity(2, START + 1, "run", 30), { ...activity(3, START + 1, "run", 30), activityId: "a2" } as GameEvent]);
    expect(dup.capacities).toEqual(once.capacities);
    expect(dup.totals).toEqual(once.totals);
  });

  it("rejects out-of-order events", () => {
    const s = replay([created(), activity(2, START + 5, "walk", 30)]);
    expect(() => reduce(s, activity(3, START + 4, "walk", 30))).toThrow();
    expect(() => reduce(s, activity(2, START + 6, "walk", 30))).toThrow();
  });
});

describe("atrophy", () => {
  // A balanced routine that meets the maintenance dose for every capacity.
  const rotation: ActivityType[] = ["run", "resistance_training", "yoga"];
  const trained = [
    created(),
    ...Array.from({ length: 20 }, (_, i) => activity(i + 2, START + i * 2, rotation[i % 3]!, 45)),
  ];
  const lastDay = START + 38;

  it("normal rest inside every grace window never lowers any stat", () => {
    const minGrace = Math.min(...CAPACITIES.map((c) => DEFAULT_PARAMS.capacities[c].graceDays));
    fc.assert(fc.property(fc.integer({ min: 1, max: minGrace }), (restDays) => {
      const before = replay(trained);
      const after = reduce(before, { type: "DayTicked", seq: 999, day: lastDay + restDays });
      return CAPACITIES.every((c) => realValue(after.capacities[c]) >= realValue(before.capacities[c]) - 1e-9);
    }));
  });

  it("long inactivity decays, but never below baseline or the retained floor", () => {
    const before = replay(trained);
    const after = reduce(before, { type: "DayTicked", seq: 999, day: lastDay + 365 });
    for (const c of CAPACITIES) {
      const b = before.capacities[c];
      const a = after.capacities[c];
      if (b.fitness > 0) expect(a.fitness).toBeLessThan(b.fitness);
      expect(a.fitness).toBeGreaterThanOrEqual(DEFAULT_PARAMS.capacities[c].retainedFloorFrac * b.peak - 1e-9);
      expect(realValue(a)).toBeGreaterThanOrEqual(a.baseline);
    }
  });

  it("Sanctuary shields displayed stats while real capacity keeps modeling reality", () => {
    const before = replay(trained);
    const inn = reduce(before, { type: "SanctuaryEntered", seq: 100, day: lastDay + 1, reason: "injury" });
    const later = reduce(inn, { type: "DayTicked", seq: 101, day: lastDay + 60 });
    const statsBefore = characterStats(before);
    const statsLater = characterStats(later);
    expect(statsLater.STR).toBe(statsBefore.STR);
    expect(statsLater.END).toBe(statsBefore.END);
    expect(later.capacities.aerobic.fitness).toBeLessThan(before.capacities.aerobic.fitness);
  });

  it("retraining regains lost fitness faster than it was first built", () => {
    const fresh = replay([created(), activity(2, START + 1, "resistance_training", 60)]);
    const firstGain = fresh.capacities.muscular_strength.fitness;

    const detrained = reduce(replay(trained), { type: "DayTicked", seq: 999, day: lastDay + 200 });
    const regained = reduce(detrained, activity(1000, lastDay + 201, "resistance_training", 60));
    const retrainGain = regained.capacities.muscular_strength.fitness - detrained.capacities.muscular_strength.fitness;
    // Diminishing returns act against retraining at higher fitness, so compare to the multiplier-adjusted expectation.
    expect(retrainGain).toBeGreaterThan(firstGain);
  });

  it("stats are always finite and non-negative", () => {
    fc.assert(fc.property(eventLog, (events) => {
      const st = characterStats(replay(events));
      return Object.values(st).every((v) => typeof v === "boolean" || (Number.isFinite(v) && v >= 0));
    }), { numRuns: 200 });
  });
});

describe("rest rewards", () => {
  it("resting after hard training grants Well-Rested", () => {
    const hard = replay([created(), activity(2, START + 1, "hiit", 60, { rpe: 9 }), activity(3, START + 2, "run", 90, { rpe: 8 })]);
    const rested = reduce(hard, { type: "RestDeclared", seq: 4, day: START + 3 });
    expect(characterStats(rested).wellRested).toBe(true);
  });
});
