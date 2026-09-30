export const CAPACITIES = ["aerobic", "muscular_strength", "muscular_endurance", "mobility"] as const;
export type Capacity = (typeof CAPACITIES)[number];

/** Canonical activity id (see research/r4 canonical_activity_types), e.g. "walk", "resistance_training". */
export type ActivityType = string;

export type CapacitySplit = Record<Capacity, number>;

export interface CapacityParams {
  /** Consecutive days below maintenance before any decay begins. */
  graceDays: number;
  /** Exponential time constant for fitness decay once past the grace window. */
  tauFitnessDays: number;
  /** Exponential time constant for short-term fatigue. */
  tauFatigueDays: number;
  /** Fraction of peak gained fitness that is never lost. */
  retainedFloorFrac: number;
  /** Gain multiplier while regaining fitness below a previous peak. */
  retrainingMultiplier: number;
  gainPerLoad: number;
  fatiguePerLoad: number;
  /** Rolling ~weekly load (per capacity) that counts as a maintaining dose. */
  minStimulusLoad: number;
  /** Gains approach this many units above baseline asymptotically. */
  diminishingCeiling: number;
}

export type IntensityBasis = "met" | "rpe_default";
export type GradeMode = "walk" | "walk_loaded" | "run" | "cycle" | "none";

export interface ActivityParams {
  met: number;
  split: CapacitySplit;
  basis: IntensityBasis;
  defaultRpe?: number;
  grade: GradeMode;
}

export interface LoadParams {
  trimpA: number;
  trimpB: number;
  metMax: number;
  minIntensity: number;
  rpeIntensityBase: number;
  rpeIntensityPerPoint: number;
  gradeK: Record<Exclude<GradeMode, "none">, number>;
  gradeNoiseFloorMPerKm: number;
  minDurationMin: number;
  maxDurationMin: number;
  maxLoadPerSession: number;
}

export type PlanWeekKind = "B" | "D" | "T";

export interface ProgressionParams {
  weeklyIncreaseFrac: {
    foot_run: number;
    foot_walk: number;
    hike_distance: number;
    hike_elevation: number;
    resistance_sets: number;
  };
  minStepMin: number;
  spikeCapFrac: number;
  spikeLookbackDays: number;
  maxConsecutiveHardDays: number;
  hardSessionsPerWeek: { noviceEarly: number; novice: number; trained: number };
  minRestDaysPerWeek: { novice: number; trained: number };
  minHoursBetweenHardSameMuscle: number;
  easyFractionEndurance: number;
  deload: { volumeFrac: number; optionalForNovicesIfPlanWeeksLe: number };
  planTemplates: Record<string, PlanWeekKind[]>;
  bossTaper: {
    volumeFrac: number;
    lastHardDaysBeforeBoss: number;
    bossMaxVsLongestFrac: number;
    rehearsalMinFracOfBoss: number;
  };
  intensityRpe: { easy: number; moderate: number; hard: number };
  trainedMinSessions28d: number;
}

export interface FitnessParams {
  version: string;
  capacities: Record<Capacity, CapacityParams>;
  activities: Record<ActivityType, ActivityParams>;
  load: LoadParams;
  progression: ProgressionParams;
}
