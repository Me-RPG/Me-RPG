import { CAPACITIES, type ActivityParams, type ActivityType, type Capacity, type FitnessParams } from "./types.js";

export interface ActivityInput {
  type: ActivityType;
  durationMin: number;
  distanceM?: number;
  elevGainM?: number;
  /** Session RPE on the CR-10 scale, if the player or provider supplied one. */
  rpe?: number;
}

const FALLBACK_TYPE = "other_workout";

export function activityParams(type: ActivityType, p: FitnessParams): ActivityParams {
  const a = p.activities[type] ?? p.activities[FALLBACK_TYPE];
  if (!a) throw new Error(`unknown activity type ${type} and no ${FALLBACK_TYPE} fallback`);
  return a;
}

export function clampDuration(minutes: number, p: FitnessParams): number {
  return Math.min(p.load.maxDurationMin, Math.max(0, minutes));
}

/** Effective MET including the ACSM vertical term for climbing (R4 grade_adjustment). */
export function effectiveMet(a: ActivityInput, act: ActivityParams, p: FitnessParams): number {
  let met = act.met;
  if (act.grade !== "none" && a.elevGainM && a.durationMin > 0) {
    const km = (a.distanceM ?? 0) / 1000;
    const belowNoise = km > 0 && a.elevGainM / km < p.load.gradeNoiseFloorMPerKm;
    if (!belowNoise) met += (p.load.gradeK[act.grade] * a.elevGainM) / a.durationMin;
  }
  return met;
}

/** Intensity fraction x in [minIntensity, 1] (≈ %HRR), per R4 intensity priority minus HR. */
export function intensity(a: ActivityInput, p: FitnessParams): number {
  const act = activityParams(a.type, p);
  const L = p.load;
  const fromRpe = (rpe: number) => Math.min(1, L.rpeIntensityBase + L.rpeIntensityPerPoint * rpe);
  if (a.rpe !== undefined) return Math.max(L.minIntensity, fromRpe(a.rpe));
  if (act.basis === "rpe_default" && act.defaultRpe !== undefined) return fromRpe(act.defaultRpe);
  const x = (effectiveMet(a, act, p) - 1) / (L.metMax - 1);
  return Math.min(1, Math.max(L.minIntensity, x));
}

/** Banister-TRIMP-equivalent training load: TL = D · x · a · e^(b·x), capped per R4 anti-abuse. */
export function activityLoad(a: ActivityInput, p: FitnessParams): number {
  const d = clampDuration(a.durationMin, p);
  if (d < p.load.minDurationMin) return 0;
  const x = intensity(a, p);
  return Math.min(p.load.maxLoadPerSession, d * x * p.load.trimpA * Math.exp(p.load.trimpB * x));
}

/** Base split plus the R4 capacity modifiers (grade, resistance RPE, long duration), renormalized. */
export function capacitySplit(a: ActivityInput, p: FitnessParams): Record<Capacity, number> {
  const act = activityParams(a.type, p);
  const s = { ...act.split };
  const move = (from: Capacity, to: Capacity, amount: number) => {
    const m = Math.min(amount, s[from]);
    s[from] -= m;
    s[to] += m;
  };
  if (act.grade === "walk" || act.grade === "walk_loaded" || act.grade === "run") {
    if (a.elevGainM && a.distanceM && a.distanceM > 0) {
      move("aerobic", "muscular_endurance", Math.min(0.15, (1.5 * a.elevGainM) / a.distanceM));
    }
  }
  if (a.type === "resistance_training" && a.rpe !== undefined) {
    if (a.rpe >= 8) move("muscular_endurance", "muscular_strength", 0.05);
    else if (a.rpe <= 4) move("muscular_strength", "muscular_endurance", 0.1);
  }
  if (a.durationMin > 90) move("muscular_strength", "muscular_endurance", 0.05);

  const total = CAPACITIES.reduce((sum, c) => sum + s[c], 0);
  if (total > 0) for (const c of CAPACITIES) s[c] /= total;
  return s;
}

export function loadByCapacity(a: ActivityInput, p: FitnessParams): Record<Capacity, number> {
  const total = activityLoad(a, p);
  const split = capacitySplit(a, p);
  const out = {} as Record<Capacity, number>;
  for (const c of CAPACITIES) out[c] = total * split[c];
  return out;
}

/**
 * Gross MET-minutes (effective MET × minutes). This is the energy-equivalence
 * measure physical-activity guidelines use (WHO: 150 moderate min ≈ 75 vigorous),
 * so it is the yardstick for "equivalent" quest options. Stat gains use TRIMP load.
 */
export function metMinutes(a: ActivityInput, p: FitnessParams): number {
  const act = activityParams(a.type, p);
  return effectiveMet(a, act, p) * clampDuration(a.durationMin, p);
}

/** Minutes of `base.type` (with its fixed climb, if any) giving `targetMetMin` MET-minutes. */
export function durationForMetMinutes(targetMetMin: number, base: Omit<ActivityInput, "durationMin">, p: FitnessParams): number {
  const act = activityParams(base.type, p);
  const climb = act.grade !== "none" && base.elevGainM ? p.load.gradeK[act.grade] * base.elevGainM : 0;
  return Math.max(0, (targetMetMin - climb) / act.met);
}

/**
 * Minutes of `base.type` that produce `targetLoad`. Elevation scales with
 * duration (fixed metres per minute), so the solve iterates.
 */
export function durationForLoad(
  targetLoad: number,
  base: Omit<ActivityInput, "durationMin">,
  p: FitnessParams,
  elevPerMin = 0,
): number {
  let d = 30;
  for (let i = 0; i < 30; i++) {
    const trial: ActivityInput = { ...base, durationMin: d };
    if (elevPerMin > 0) trial.elevGainM = elevPerMin * d;
    const perMin = activityLoad(trial, p) / d;
    if (perMin <= 0) return p.load.maxDurationMin;
    const next = Math.min(p.load.maxDurationMin, Math.max(p.load.minDurationMin, targetLoad / perMin));
    if (Math.abs(next - d) < 0.01) return next;
    d = next;
  }
  return d;
}
