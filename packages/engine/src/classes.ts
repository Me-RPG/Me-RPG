import { CLASS_XP_SCALE, classAffinity, type ClassId } from "@me-rpg/content";
import { intensity, type ActivityInput } from "@me-rpg/fitness-model";
import type { EpochDay } from "./events.js";
import type { EngineContext } from "./rules.js";
import type { SkillState } from "./skills.js";

/**
 * Class progress. A session feeds the classes its style belongs to. XP is
 * mostly time spent (minutes x (0.5 + intensity)), so an hour's walk counts
 * about 60% as much as an hour's hard run rather than a tenth. Nothing is
 * exclusive and nothing is lost: a player grows in whatever style they train.
 */
export type ClassXp = Record<ClassId, number>;

export const EMPTY_CLASS_XP: ClassXp = { ranger: 0, berserker: 0, warrior: 0 };

/** 0 until the class has any XP; then 1 + floor(sqrt(xp / scale)). */
export function classLevel(xp: number): number {
  return xp <= 0 ? 0 : 1 + Math.floor(Math.sqrt(xp / CLASS_XP_SCALE));
}

/** XP needed to reach a class level (inverse of classLevel). */
export function xpForClassLevel(level: number): number {
  return level <= 1 ? 1 : CLASS_XP_SCALE * (level - 1) ** 2;
}

export function sessionClassXp(activity: ActivityInput, ctx: EngineContext): Partial<ClassXp> {
  const minutes = Math.min(ctx.params.load.maxDurationMin, Math.max(0, activity.durationMin));
  if (minutes < ctx.params.load.minDurationMin) return {};
  const base = minutes * (0.5 + intensity(activity, ctx.params));
  const out: Partial<ClassXp> = {};
  for (const [id, w] of Object.entries(classAffinity(activity.type, ctx.content.familyOf(activity.type)))) {
    out[id as ClassId] = Math.round(base * (w ?? 0) * 10) / 10;
  }
  return out;
}

export function addClassXp(xp: ClassXp, activity: ActivityInput, ctx: EngineContext): ClassXp {
  const out = { ...xp };
  for (const [id, v] of Object.entries(sessionClassXp(activity, ctx))) out[id as ClassId] += v ?? 0;
  return out;
}

/** The class with the most XP: a description of the player's style, never a requirement. */
export function primaryClass(xp: ClassXp): ClassId | null {
  const best = (Object.entries(xp) as [ClassId, number][]).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : null;
}

/** Unlock tree skills whose class level has been reached (each node needs the one before it). */
export function unlockTreeSkills(skills: Record<string, SkillState>, xp: ClassXp, day: EpochDay, ctx: EngineContext): Record<string, SkillState> {
  let out = skills;
  for (const c of Object.values(ctx.content.classes)) {
    const level = classLevel(xp[c.id]);
    for (const node of c.tree) {
      if (node.level > level) break;
      if (!out[node.abilityId]) {
        if (out === skills) out = { ...skills };
        out[node.abilityId] = { xp: 0, rank: 1, lastTrainedDay: day };
      }
    }
  }
  return out;
}
