import type { ActivityRecord } from "./quests/history.js";
import type { EngineContext } from "./rules.js";
import type { EpochDay } from "./events.js";

/**
 * Character skills (battle abilities) persist across questlines. A quest
 * unlocks a skill; afterwards every matching session trains it further.
 * Rank never goes down (earned progress is never deleted, R8 G1), but a skill
 * left untrained goes gently dull, which the twice-weekly maintenance bounties prevent.
 */
export interface SkillState {
  xp: number;
  rank: number;
  lastTrainedDay: EpochDay;
}

/** XP needed for ranks 1..5 (design). */
export const SKILL_RANK_XP = [0, 10, 25, 50, 90] as const;
export const SKILL_QUEST_XP = 3;
export const SKILL_SESSION_XP = 1;
/** Days a skill stays fully sharp without training, then how fast it dulls. */
export const SKILL_SHARP_GRACE_DAYS = 7;
export const SKILL_DULL_PER_WEEK = 0.1;
export const SKILL_MIN_SHARPNESS = 0.5;

export function rankForXp(xp: number): number {
  let rank = 1;
  for (let r = 0; r < SKILL_RANK_XP.length; r++) if (xp >= SKILL_RANK_XP[r]!) rank = r + 1;
  return rank;
}

export function sharpness(skill: SkillState, day: EpochDay): number {
  const idle = day - skill.lastTrainedDay - SKILL_SHARP_GRACE_DAYS;
  if (idle <= 0) return 1;
  return Math.max(SKILL_MIN_SHARPNESS, 1 - (SKILL_DULL_PER_WEEK * idle) / 7);
}

/** Battle multiplier: +10% per rank above 1, scaled down to 90% at the dullest. */
export function potency(skill: SkillState, day: EpochDay): number {
  return (1 + 0.1 * (skill.rank - 1)) * (0.8 + 0.2 * sharpness(skill, day));
}

function withXp(prev: SkillState | undefined, xp: number, day: EpochDay): SkillState {
  const total = (prev?.xp ?? 0) + xp;
  return { xp: total, rank: rankForXp(total), lastTrainedDay: day };
}

/** A completed quest unlocks (or trains) the skills its archetype grants. */
export function grantSkills(skills: Record<string, SkillState>, ids: readonly string[], day: EpochDay): Record<string, SkillState> {
  const out = { ...skills };
  for (const id of ids) out[id] = withXp(out[id], SKILL_QUEST_XP, day);
  return out;
}

/** Any session that matches an unlocked skill's training trains it and keeps it sharp. */
export function trainSkills(skills: Record<string, SkillState>, session: ActivityRecord, ctx: EngineContext): Record<string, SkillState> {
  let out = skills;
  for (const [id, skill] of Object.entries(skills)) {
    const t = ctx.content.abilities[id]?.trainedBy;
    if (!t || !t.families.includes(session.family) || session.durationMin < t.minMinutes) continue;
    if (t.minClimbM !== undefined && (session.elevGainM ?? 0) < t.minClimbM) continue;
    if (out === skills) out = { ...skills };
    out[id] = withXp(skill, SKILL_SESSION_XP, session.day);
  }
  return out;
}
