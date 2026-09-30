import type { MaintenanceBountyDef } from "@me-rpg/content";
import type { EpochDay } from "./events.js";
import type { ActivityRecord } from "./quests/history.js";
import type { EngineContext } from "./rules.js";

/** Which maintenance bounties are done in the character's current 7-day week. */
export interface MaintenanceWeek {
  week: number;
  done: string[];
}

export function maintenanceWeek(createdDay: EpochDay, day: EpochDay): number {
  return Math.floor((day - createdDay) / 7);
}

export function sessionMeetsBounty(session: ActivityRecord, b: MaintenanceBountyDef): boolean {
  return (b.families.includes(session.family) || b.alsoAccepts.includes(session.type)) && session.durationMin >= b.minMinutes;
}

/**
 * Update the week's record with a new session. Returns the updated record and
 * any bounties this session completed for the first time this week.
 */
export function recordMaintenance(
  current: MaintenanceWeek,
  createdDay: EpochDay,
  session: ActivityRecord,
  ctx: EngineContext,
): { week: MaintenanceWeek; newlyDone: MaintenanceBountyDef[] } {
  const week = maintenanceWeek(createdDay, session.day);
  const base = week === current.week ? current : { week, done: [] };
  const newlyDone = ctx.content.maintenance.filter((b) => !base.done.includes(b.id) && sessionMeetsBounty(session, b));
  if (newlyDone.length === 0) return { week: base, newlyDone };
  return { week: { week, done: [...base.done, ...newlyDone.map((b) => b.id)] }, newlyDone };
}
