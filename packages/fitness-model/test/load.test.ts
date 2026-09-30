import { describe, expect, it } from "vitest";
import { CAPACITIES, DEFAULT_PARAMS as P, activityLoad, capacitySplit, durationForLoad, durationForMetMinutes, metMinutes } from "@me-rpg/fitness-model";

describe("R4 load pipeline", () => {
  it("reproduces the R4 worked examples", () => {
    // research/r4: 60 min hike ≈ 46 TL; 60 min run at 9.3 MET ≈ 208 TL; 60 min lift at RPE 5 ≈ 103 TL.
    expect(activityLoad({ type: "hike", durationMin: 60 }, P)).toBeCloseTo(46, -0.5);
    expect(activityLoad({ type: "run", durationMin: 60 }, P)).toBeCloseTo(208, -1);
    expect(activityLoad({ type: "resistance_training", durationMin: 60 }, P)).toBeCloseTo(103, -0.5);
  });

  it("climbing raises load and shifts load toward muscular endurance", () => {
    const flat = { type: "hike", durationMin: 120, distanceM: 8000 };
    const hilly = { ...flat, elevGainM: 500 };
    expect(activityLoad(hilly, P)).toBeGreaterThan(activityLoad(flat, P));
    expect(capacitySplit(hilly, P).muscular_endurance).toBeGreaterThan(capacitySplit(flat, P).muscular_endurance);
  });

  it("splits always sum to 1 and loads respect the session cap", () => {
    for (const type of Object.keys(P.activities)) {
      const s = capacitySplit({ type, durationMin: 400, rpe: 10 }, P);
      expect(CAPACITIES.reduce((a, c) => a + s[c], 0)).toBeCloseTo(1, 9);
      expect(activityLoad({ type, durationMin: 400, rpe: 10 }, P)).toBeLessThanOrEqual(P.load.maxLoadPerSession);
    }
  });

  it("durationForLoad inverts activityLoad", () => {
    const d = durationForLoad(80, { type: "hike", rpe: 4 }, P);
    expect(activityLoad({ type: "hike", rpe: 4, durationMin: d }, P)).toBeCloseTo(80, 3);
    const withClimb = durationForLoad(80, { type: "hike" }, P, 4);
    expect(activityLoad({ type: "hike", durationMin: withClimb, elevGainM: 4 * withClimb }, P)).toBeCloseTo(80, 1);
  });

  it("durationForMetMinutes inverts metMinutes, including a fixed climb", () => {
    const d = durationForMetMinutes(300, { type: "hike", elevGainM: 200 }, P);
    expect(metMinutes({ type: "hike", durationMin: d, elevGainM: 200 }, P)).toBeCloseTo(300, 6);
    expect(durationForMetMinutes(300, { type: "walk" }, P)).toBeCloseTo(300 / P.activities.walk!.met, 6);
  });
});
