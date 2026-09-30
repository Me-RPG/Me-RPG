import { DEFAULT_CONTENT, type ContentRegistry } from "@healthrpg/content";
import { DEFAULT_PARAMS, type FitnessParams } from "@healthrpg/fitness-model";

/** Game-design knobs (not physiology). Physiology lives in FitnessParams. */
export interface GameRules {
  /** Total fatigue above which a declared rest day grants Well-Rested. */
  wellRestedFatigueThreshold: number;
  /** Rolling window used for VIT (consistency). */
  vitWindowWeeks: number;
  /** Days of engagement history kept for rolling stats (VIT). */
  historyDays: number;
}

export const DEFAULT_RULES: GameRules = {
  wellRestedFatigueThreshold: 1.5,
  vitWindowWeeks: 8,
  historyDays: 56,
};

export interface EngineContext {
  params: FitnessParams;
  rules: GameRules;
  content: ContentRegistry;
}

export const DEFAULT_CONTEXT: EngineContext = { params: DEFAULT_PARAMS, rules: DEFAULT_RULES, content: DEFAULT_CONTENT };
