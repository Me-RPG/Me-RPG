import type { Capacity } from "./types.js";

/**
 * Starting capacities from a low-intrusion onboarding (research/r5 §7).
 * No weight, height or waist is collected: the Jackson 1990 non-exercise
 * VO2max model is run with the FRIEND 2015 mean BMI for the player's age band
 * and sex, and the prescribed value is shaded down by half its error so that
 * players start slightly easy rather than slightly hard.
 * Non-aerobic tiers are design mappings (R5 low confidence) pending calibration.
 */

export type AgeBand = "18-29" | "30-39" | "40-49" | "50-59" | "60-69" | "70+";
export type SexForNorms = "female" | "male" | "unspecified";

export interface OnboardingAnswers {
  ageBand: AgeBand;
  sex: SexForNorms;
  /** NASA/JSC physical activity rating, 0 (avoids exertion) to 7 (vigorous > 3 h/week). */
  activityRating: number;
  strengthDaysPerWeek: 0 | 1 | 2 | 3;
  /** Functional check items the player said they can do. */
  canTouchToes: boolean;
  canRiseFromFloorWithoutHands: boolean;
}

const AGE_MID: Record<AgeBand, number> = { "18-29": 24, "30-39": 35, "40-49": 45, "50-59": 55, "60-69": 65, "70+": 74 };
// FRIEND 2015 mean BMI by decade (R5 §3, workaround A).
const FRIEND_BMI: Record<"male" | "female", Record<AgeBand, number>> = {
  male: { "18-29": 25.6, "30-39": 25.8, "40-49": 27.0, "50-59": 27.8, "60-69": 27.7, "70+": 27.2 },
  female: { "18-29": 24.0, "30-39": 26.1, "40-49": 27.4, "50-59": 28.8, "60-69": 29.2, "70+": 28.5 },
};
// Standard error with imputed BMI (R5 §3): men ~6.9, women ~7.4, unknown ~7.2.
const SE: Record<SexForNorms, number> = { male: 6.9, female: 7.4, unspecified: 7.2 };

/** Jackson et al. 1990 (BMI form), ml/kg/min. */
export function estimateVo2max(a: Pick<OnboardingAnswers, "ageBand" | "sex" | "activityRating">): { estimate: number; se: number } {
  const age = AGE_MID[a.ageBand];
  const sex = a.sex === "male" ? 1 : a.sex === "female" ? 0 : 0.5;
  const bmi = a.sex === "unspecified" ? (FRIEND_BMI.male[a.ageBand] + FRIEND_BMI.female[a.ageBand]) / 2 : FRIEND_BMI[a.sex][a.ageBand];
  const par = Math.min(7, Math.max(0, a.activityRating));
  const est = 56.363 + 1.921 * par - 0.381 * age - 0.754 * bmi + 10.987 * sex;
  return { estimate: Math.min(70, Math.max(12, est)), se: SE[a.sex] };
}

/** Baseline capacities for CharacterCreated. Aerobic is in VO2max units; the rest are 0-100 points. */
export function baselineFromOnboarding(a: OnboardingAnswers): Record<Capacity, number> {
  const { estimate, se } = estimateVo2max(a);
  const strengthTier = 1 + a.strengthDaysPerWeek; // 1..4
  const enduranceTier = 1 + Math.floor(Math.min(7, Math.max(0, a.activityRating)) / 2); // 1..4
  const mobilityTier = 1 + (a.canTouchToes ? 1 : 0) + (a.canRiseFromFloorWithoutHands ? 1 : 0); // 1..3
  const points = (tier: number) => 10 + 8 * tier;
  return {
    aerobic: Math.round((estimate - 0.5 * se) * 10) / 10,
    muscular_strength: points(strengthTier),
    muscular_endurance: points(enduranceTier),
    mobility: points(mobilityTier),
  };
}
