import type { Family } from "@healthrpg/content";
import type { ActivityType, FitnessParams } from "@healthrpg/fitness-model";
import type { EpochDay } from "../events.js";
import type { PlayerLevel } from "./types.js";

/** Summary of a logged session kept for progression caps. Raw streams are never stored. */
export interface ActivityRecord {
  day: EpochDay;
  activityId: string;
  type: ActivityType;
  family: Family;
  durationMin: number;
  elevGainM?: number;
  load: number;
}

/** Longest window any rule looks back over (30-day spike cap, 28-day level). */
export const HISTORY_DAYS = 42;

function inWindow(r: ActivityRecord, day: EpochDay, lookback: number): boolean {
  return r.day <= day && r.day > day - lookback;
}

export function longestInFamily(recent: readonly ActivityRecord[], family: Family, day: EpochDay, lookback: number): number | null {
  let best: number | null = null;
  for (const r of recent) if (r.family === family && inWindow(r, day, lookback)) best = Math.max(best ?? 0, r.durationMin);
  return best;
}

export function maxElevInFamily(recent: readonly ActivityRecord[], family: Family, day: EpochDay, lookback: number): number | null {
  let best: number | null = null;
  for (const r of recent) {
    if (r.family === family && r.elevGainM !== undefined && inWindow(r, day, lookback)) best = Math.max(best ?? 0, r.elevGainM);
  }
  return best;
}

export function playerLevel(recent: readonly ActivityRecord[], day: EpochDay, p: FitnessParams): PlayerLevel {
  const sessions = recent.filter((r) => inWindow(r, day, 28)).length;
  return sessions >= p.progression.trainedMinSessions28d ? "trained" : "novice";
}
