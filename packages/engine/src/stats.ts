import { displayValue } from "./capacity.js";
import { DEFAULT_CONTEXT, type EngineContext } from "./rules.js";
import type { GameState } from "./state.js";

/** The RPG-facing character sheet, derived from hidden capacities. */
export interface CharacterStats {
  STR: number;
  END: number;
  AGI: number;
  VIT: number;
  WAN: number;
  level: number;
  wellRested: boolean;
  inSanctuary: boolean;
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function characterStats(s: GameState, ctx: EngineContext = DEFAULT_CONTEXT): CharacterStats {
  const cap = s.capacities;
  const weeks = ctx.rules.vitWindowWeeks;
  let engagedWeeks = 0;
  for (let w = 0; w < weeks; w++) {
    const end = s.day - w * 7;
    const start = end - 6;
    if (s.sanctuary !== null || s.engagedDays.some((d) => d >= start && d <= end)) engagedWeeks++;
  }
  return {
    STR: Math.round(displayValue(cap.muscular_strength)),
    END: Math.round(0.7 * displayValue(cap.aerobic) + 0.3 * displayValue(cap.muscular_endurance)),
    AGI: Math.round(displayValue(cap.mobility)),
    VIT: 10 + Math.round((40 * engagedWeeks) / weeks),
    WAN: Math.floor(s.totals.distanceM / 1000 + s.totals.elevGainM / 100),
    level: levelForXp(s.totals.xp),
    wellRested: s.wellRestedUntil !== null && s.wellRestedUntil >= s.day,
    inSanctuary: s.sanctuary !== null,
  };
}
