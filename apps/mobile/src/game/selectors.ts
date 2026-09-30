import {
  DEFAULT_CONTEXT as CTX,
  characterStats,
  classLevel,
  maintenanceWeek,
  sharpness,
  xpForClassLevel,
  type GameState,
  type QuestlineState,
} from "@me-rpg/engine";

/** View models for screens. Pure functions of engine state, tested with vitest. */

export function titleOf(q: QuestlineState): string {
  if (q.plan.kind === "single") return `Bounty: ${CTX.content.archetypes[q.plan.templateId]?.name ?? q.plan.templateId}`;
  return CTX.content.questlines[q.plan.templateId]?.title ?? q.plan.templateId;
}

export function openQuestlines(s: GameState): QuestlineState[] {
  return s.questlines.filter((q) => q.status === "active" || q.status === "boss_ready" || (q.battle !== null && !q.battle.outcome));
}

export function finishedQuestlines(s: GameState): QuestlineState[] {
  return s.questlines.filter((q) => q.status === "victorious" || q.status === "complete");
}

export function maintenanceBoard(s: GameState, day: number) {
  if (!s.character) return [];
  const week = maintenanceWeek(s.character.createdDay, day);
  const done = s.maintenance.week === week ? s.maintenance.done : [];
  return CTX.content.maintenance.map((b) => ({ ...b, done: done.includes(b.id) }));
}

export function classRows(s: GameState) {
  return Object.values(CTX.content.classes).map((c) => {
    const xp = s.classXp[c.id];
    const level = classLevel(xp);
    const floor = level <= 1 ? 0 : xpForClassLevel(level);
    const ceil = xpForClassLevel(level + 1);
    return {
      ...c,
      xp,
      level,
      progress: Math.max(0, Math.min(1, (xp - floor) / Math.max(1, ceil - floor))),
      tree: c.tree.map((n) => ({ ...n, ability: CTX.content.abilities[n.abilityId]!, unlocked: Boolean(s.skills[n.abilityId]) })),
    };
  });
}

export function skillRows(s: GameState, day: number) {
  return Object.entries(s.skills)
    .map(([id, sk]) => ({ id, ability: CTX.content.abilities[id], rank: sk.rank, sharp: sharpness(sk, day) }))
    .filter((r) => r.ability)
    .sort((a, b) => b.rank - a.rank || a.ability!.name.localeCompare(b.ability!.name));
}

export function heroSheet(s: GameState) {
  return characterStats(s, CTX);
}

/** Activities offered in the quick log form, grouped by family, most common first. */
export const QUICK_ACTIVITIES: { id: string; label: string }[] = [
  { id: "walk", label: "Walk" },
  { id: "hike", label: "Hike" },
  { id: "run", label: "Run" },
  { id: "cycle_road", label: "Ride" },
  { id: "swim", label: "Swim" },
  { id: "resistance_training", label: "Lift" },
  { id: "calisthenics", label: "Bodyweight" },
  { id: "circuit_training", label: "Circuit" },
  { id: "rowing", label: "Row" },
  { id: "hiit", label: "HIIT" },
  { id: "yoga", label: "Yoga" },
  { id: "stretching_mobility", label: "Stretch" },
];
