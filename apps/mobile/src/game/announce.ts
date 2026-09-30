import { DEFAULT_CONTEXT as CTX, questStory, type GameState } from "@me-rpg/engine";

/** Something the player should see after an action: a story, a milestone, an unlock. */
export interface Notice {
  id: string;
  kind: "story" | "boss_ready" | "bounty_done" | "skill_unlocked" | "class_level" | "maintenance";
  title: string;
  text: string;
  art?: string;
}

/** Pure diff of two states into notices. Deterministic, so it is tested outside React. */
export function noticesBetween(before: GameState, after: GameState, classLevel: (xp: number) => number): Notice[] {
  const out: Notice[] = [];
  after.questlines.forEach((q, i) => {
    const prev = before.questlines[i];
    for (let c = prev?.completed.length ?? 0; c < q.completed.length; c++) {
      const slot = q.plan.slots[q.completed[c]!.slotIndex]!;
      const archetype = CTX.content.archetypes[slot.archetypeId];
      out.push({
        id: `story:${q.plan.questlineId}:${c}`,
        kind: "story",
        title: `Quest complete: ${archetype?.name ?? slot.archetypeId}`,
        text: questStory(after, q, c, CTX),
        art: `quest.${slot.archetypeId}`,
      });
    }
    if (prev && prev.status !== q.status && q.status === "boss_ready") {
      const boss = CTX.content.bosses[q.plan.templateId];
      out.push({ id: `boss:${q.plan.questlineId}`, kind: "boss_ready", title: "All trials complete", text: `${boss?.name ?? "The boss"} awaits.`, art: `boss.${q.plan.templateId}` });
    }
    if (prev && prev.status !== q.status && q.status === "complete") {
      out.push({ id: `bounty:${q.plan.questlineId}`, kind: "bounty_done", title: "Bounty complete", text: "The reward is yours." });
    }
  });
  for (const id of Object.keys(after.skills)) {
    if (!before.skills[id]) {
      const a = CTX.content.abilities[id];
      out.push({ id: `skill:${id}`, kind: "skill_unlocked", title: `New skill: ${a?.name ?? id}`, text: a?.description ?? "" });
    }
  }
  for (const c of Object.values(CTX.content.classes)) {
    const was = classLevel(before.classXp[c.id]);
    const now = classLevel(after.classXp[c.id]);
    if (now > was && now > 1) out.push({ id: `class:${c.id}:${now}`, kind: "class_level", title: `${c.name} level ${now}`, text: `Your ${c.style.split(":")[0]} training is paying off.`, art: `class.${c.id}` });
  }
  const newly = after.maintenance.done.filter((d) => before.maintenance.week !== after.maintenance.week || !before.maintenance.done.includes(d));
  for (const id of newly) {
    const b = CTX.content.maintenance.find((m) => m.id === id);
    if (b) out.push({ id: `maint:${after.maintenance.week}:${id}`, kind: "maintenance", title: `${b.title} done this week`, text: `+${b.bonusXp} XP. ${b.description}` });
  }
  return out;
}
