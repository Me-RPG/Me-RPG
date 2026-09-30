// Builds packages/fitness-model/data/params.v1.json from the research params
// (research/r*/params.json), taking the "mid" value of every range.
//
// Usage: node scripts/build-params.mjs
//
// Values fall in two groups:
//   - research: copied from a research file (path noted in `_provenance`).
//   - derived:  engine calibration constants computed here from research values
//               plus a documented reference session. Tune these in the balance sim.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (topic) => JSON.parse(readFileSync(join(root, "research", topic, "params.json"), "utf8"));
const mid = (v) => {
  if (v && typeof v === "object" && "mid" in v) return v.mid;
  throw new Error(`expected {mid} range, got ${JSON.stringify(v)}`);
};

const r1 = read("r1-detraining");
const r2 = read("r2-rest-recovery");
const r3 = read("r3-safe-progression");
const r4 = read("r4-activity-normalization");

// ---------------------------------------------------------------- load (R4)
const trimp = r4.load_formulas.trimp_core.coefficients.unspecified;
const load = {
  trimpA: trimp.a,
  trimpB: trimp.b,
  metMax: r4.load_formulas.intensity_from_met.defaults.MET_max,
  minIntensity: 0.05,
  rpeIntensityBase: 0.2, // x = min(1, 0.2 + 0.1 * RPE)
  rpeIntensityPerPoint: 0.1,
  gradeK: {
    walk: r4.load_formulas.grade_adjustment.walk.k,
    walk_loaded: r4.load_formulas.grade_adjustment.walk_loaded.k,
    run: r4.load_formulas.grade_adjustment.run.k,
    cycle: r4.load_formulas.grade_adjustment.cycle.k,
  },
  gradeNoiseFloorMPerKm: 10,
  minDurationMin: r4.load_formulas.duration_rules.min_minutes,
  maxDurationMin: r4.load_formulas.duration_rules.cap_minutes_per_session,
  maxLoadPerSession: r4.fallback_rules.anti_abuse.max_tl_per_session,
};

const activities = {};
for (const a of r4.canonical_activity_types) {
  activities[a.id] = {
    met: mid(a.met),
    split: a.capacity_split,
    basis: a.intensity_basis,
    ...(a.default_rpe_cr10 !== undefined ? { defaultRpe: a.default_rpe_cr10 } : {}),
    grade: a.grade_adjust,
  };
}

const intensityFromRpe = (rpe) => Math.min(1, load.rpeIntensityBase + load.rpeIntensityPerPoint * rpe);
const intensityFromMet = (met) => Math.max(load.minIntensity, Math.min(1, (met - 1) / (load.metMax - 1)));
const tl = (minutes, x) => minutes * x * load.trimpA * Math.exp(load.trimpB * x);

// ------------------------------------------------------ capacities (R1 + derived)
// Reference maintenance routines: the smallest weekly routine that maintains a capacity.
// minStimulusLoad = 90% of the rolling 7-day bank that routine produces (bank tau = 7 days),
// taking the least favourable session order.
const BANK_TAU = 7;
const bankAfter = (perSessionLoads) => {
  const gap = 7 / perSessionLoads.length;
  const orders = perSessionLoads.length === 2 ? [perSessionLoads, [...perSessionLoads].reverse()] : [perSessionLoads];
  return Math.min(...orders.map((loads) => loads.reduceRight((bank, load, i) => bank + load * Math.exp((-(loads.length - 1 - i) * gap) / BANK_TAU), 0)));
};
const md = r1.maintenance_dose;
const repeat = (session, n) => Array.from({ length: n }, () => session);
const reference = {
  aerobic: repeat({ activity: "walk", minutes: 30 }, mid(md.aerobic_sessions_per_week)),
  muscular_strength: repeat({ activity: "resistance_training", minutes: 30 }, mid(md.strength_sessions_per_week)),
  // Design override (R1 confidence low-medium): the two weekly maintenance bounties
  // (a 30-min walk and a 30-min strength session) maintain muscular endurance.
  muscular_endurance: [{ activity: "walk", minutes: 30 }, { activity: "resistance_training", minutes: 30 }],
  mobility: repeat({ activity: "yoga", minutes: 20 }, mid(md.mobility_sessions_per_week)),
};
const sessionLoad = (id, minutes) => {
  const a = activities[id];
  const x = a.basis === "rpe_default" ? intensityFromRpe(a.defaultRpe) : intensityFromMet(a.met);
  return tl(minutes, x);
};

// Gain calibration targets (derived; design): gain above baseline reached after
// 12 weeks of the "build" routine, and the ceiling gains approach asymptotically.
// Aerobic is in VO2max units (ml/kg/min); the others are 0-100 capacity points.
const build = {
  aerobic: { activity: "walk", minutes: 30, perWeek: 3, target12wk: 5, ceiling: 15 },
  muscular_strength: { activity: "resistance_training", minutes: 45, perWeek: 2, target12wk: 10, ceiling: 25 },
  muscular_endurance: { activity: "calisthenics", minutes: 30, perWeek: 3, target12wk: 8, ceiling: 25 },
  mobility: { activity: "yoga", minutes: 30, perWeek: 3, target12wk: 8, ceiling: 20 },
};

const capacities = {};
for (const [cap, c] of Object.entries(r1.capacities)) {
  const refLoads = reference[cap].map((r) => sessionLoad(r.activity, r.minutes) * activities[r.activity].split[cap]);
  const b = build[cap];
  const totalLoad = sessionLoad(b.activity, b.minutes) * activities[b.activity].split[cap] * b.perWeek * 12;
  // Diminishing returns: gain(L) = C * (1 - exp(-g * L / C))  =>  g = -C/L * ln(1 - target/C)
  const gainPerLoad = (-b.ceiling / totalLoad) * Math.log(1 - b.target12wk / b.ceiling);
  capacities[cap] = {
    graceDays: mid(c.grace_days),
    tauFitnessDays: mid(c.tau_days),
    tauFatigueDays: 7, // Banister fatigue default (R1 Q7)
    retainedFloorFrac: mid(c.retained_floor_frac),
    retrainingMultiplier: mid(c.retraining_multiplier),
    gainPerLoad: round(gainPerLoad, 5),
    fatiguePerLoad: 0.008,
    minStimulusLoad: round(0.9 * bankAfter(refLoads), 2),
    diminishingCeiling: b.ceiling,
  };
}

// ------------------------------------------------------ progression (R3) + rest (R2)
const progression = {
  weeklyIncreaseFrac: {
    foot_run: mid(r3.weekly_volume_increase_frac.running.novice),
    foot_walk: mid(r3.weekly_volume_increase_frac.walking.novice),
    hike_distance: mid(r3.weekly_volume_increase_frac.hiking_distance.novice),
    hike_elevation: mid(r3.weekly_volume_increase_frac.hiking_elevation_gain.novice),
    resistance_sets: mid(r3.weekly_volume_increase_frac.resistance_weekly_sets_per_muscle.novice),
  },
  minStepMin: mid(r3.aerobic_session_duration_step_min.value),
  spikeCapFrac: mid(r3.single_session_spike_cap_frac.running),
  spikeLookbackDays: mid(r3.single_session_spike_cap_frac.lookback_days),
  maxConsecutiveHardDays: mid(r3.max_consecutive_hard_days.novice),
  hardSessionsPerWeek: {
    noviceEarly: mid(r3.hard_sessions_per_week_max.novice_weeks_1_4),
    novice: mid(r3.hard_sessions_per_week_max.novice_after_week_4),
    trained: mid(r3.hard_sessions_per_week_max.trained),
  },
  minRestDaysPerWeek: {
    novice: mid(r3.min_rest_days_per_week.novice),
    trained: mid(r3.min_rest_days_per_week.trained),
  },
  minHoursBetweenHardSameMuscle: mid(r3.min_hours_between_hard_same_muscle_resistance),
  easyFractionEndurance: mid(r3.easy_fraction_of_endurance_sessions),
  deload: {
    volumeFrac: 1 - mid(r3.deload_placement.volume_reduction_frac),
    optionalForNovicesIfPlanWeeksLe: mid(r3.deload_placement.optional_for_novices_if_plan_weeks_le),
  },
  planTemplates: {
    // Design (not in R3): the "short" questline is one build week, then the boss week.
    "2": ["B", "T"],
    ...Object.fromEntries(
      Object.entries(r3.deload_placement.plan_templates)
        .filter(([k]) => /^\d+_weeks$/.test(k))
        .map(([k, v]) => [String(parseInt(k, 10)), v.replace(/\(.*?\)/g, "").trim().split(/\s+/)]),
    ),
  },
  bossTaper: {
    volumeFrac: 1 - mid(r3.boss_taper.volume_reduction_frac),
    lastHardDaysBeforeBoss: mid(r3.boss_taper.last_hard_session_days_before_boss),
    bossMaxVsLongestFrac: mid(r3.boss_taper.boss_max_vs_30d_longest_frac),
    rehearsalMinFracOfBoss: mid(r3.boss_taper.rehearsal_session_min_frac_of_boss),
  },
  intensityRpe: {
    easy: mid(r3.session_intensity_bands.aerobic.light.rpe_cr10),
    moderate: mid(r3.session_intensity_bands.aerobic.moderate.rpe_cr10),
    hard: mid(r3.session_intensity_bands.aerobic.vigorous.rpe_cr10),
  },
  // Novice = fewer than this many sessions in the last 28 days (design threshold).
  trainedMinSessions28d: 8,
};

const out = {
  version: "1.0.0-mid-unreviewed",
  _note: "Generated by scripts/build-params.mjs from research/*/params.json using mid values. Human review pending.",
  _provenance: {
    capacities: "research/r1-detraining (grace, tau, floor, retraining); gainPerLoad/minStimulusLoad/ceiling derived in build script",
    activities: "research/r4-activity-normalization canonical_activity_types (met.mid, capacity_split)",
    load: "research/r4-activity-normalization load_formulas",
    progression: "research/r3-safe-progression",
    rest: "research/r2-rest-recovery (maintenance cross-check; R1 grace chosen over R2 where they differ)",
  },
  _openReviewItems: [
    "Aerobic grace: R1 mid 7 d vs R2 recommendation 10 d. Using R1.",
    "Mobility tau 10 d rests on a single small study (R1 confidence low).",
    "Capacity split matrix is expert judgment (R4 confidence low).",
    "Gain calibration targets (build block) are design values, not research.",
    "planTemplates['2'] (short questline: B T) is a design addition; R3 covers 6-12 weeks only.",
    "muscular_endurance maintenance recalibrated to one 30-min walk + one 30-min strength session per week (the two maintenance bounties), overriding R1's 2 sessions/week (low-medium confidence).",
  ],
  capacities,
  activities,
  load,
  progression,
};

writeFileSync(join(root, "packages/fitness-model/data/params.v1.json"), JSON.stringify(out, null, 2) + "\n");
console.log("wrote packages/fitness-model/data/params.v1.json");
console.log(JSON.stringify(capacities, null, 2));

function round(v, dp) {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
