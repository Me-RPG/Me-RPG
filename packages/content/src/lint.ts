import type { FitnessParams } from "@me-rpg/fitness-model";
import type { ContentRegistry, QuestlineTemplate } from "./types.js";

/**
 * Build-time cohesion checks. Returns human-readable problems; empty means OK.
 * A questline must reference real archetypes/routines/activities, train every
 * mechanic its boss uses, and keep its options on-theme.
 */
export function lintContent(content: ContentRegistry, params: FitnessParams): string[] {
  const problems: string[] = [];
  const knownActivity = (id: string) => id in params.activities;

  for (const a of Object.values(content.archetypes)) {
    if (a.options.length < 2) problems.push(`archetype ${a.id}: needs at least 2 options`);
    if (a.minMinutes > a.maxMinutes) problems.push(`archetype ${a.id}: minMinutes > maxMinutes`);
    for (const o of a.options) {
      if (!knownActivity(o.activity)) problems.push(`option ${a.id}/${o.id}: unknown activity ${o.activity}`);
      for (const acc of o.accepts) if (!knownActivity(acc)) problems.push(`option ${a.id}/${o.id}: unknown accepted activity ${acc}`);
      if (!o.accepts.includes(o.activity)) problems.push(`option ${a.id}/${o.id}: accepts must include its own activity`);
      if (o.routineId && !content.routines[o.routineId]) problems.push(`option ${a.id}/${o.id}: unknown routine ${o.routineId}`);
    }
    if (a.options.every((o) => o.requiresTrained)) problems.push(`archetype ${a.id}: every option requires a trained player`);
  }

  for (const q of Object.values(content.questlines)) problems.push(...lintQuestline(q, content));
  problems.push(...lintNarrative(content));
  problems.push(...lintClasses(content));
  return problems;
}

/** Trees reference real abilities, climb in level, and every tree offers a comparable mix of actives and passives. */
function lintClasses(content: ContentRegistry): string[] {
  const problems: string[] = [];
  const shapes = new Set<string>();
  for (const c of Object.values(content.classes)) {
    let last = 0;
    for (const node of c.tree) {
      if (!content.abilities[node.abilityId]) problems.push(`class ${c.id}: unknown ability ${node.abilityId}`);
      if (node.level < last) problems.push(`class ${c.id}: tree levels must not decrease`);
      last = node.level;
    }
    if (!content.archetypes[c.focus.steadyArchetype]) problems.push(`class ${c.id}: unknown focus archetype ${c.focus.steadyArchetype}`);
    shapes.add(`${c.tree.length}:${c.tree.filter((n) => content.abilities[n.abilityId]?.kind === "passive").length}`);
  }
  if (shapes.size > 1) problems.push(`classes: skill trees differ in size or active/passive mix (${[...shapes].join(", ")}); keep classes comparable`);
  const owners = new Map<string, string>();
  for (const c of Object.values(content.classes)) for (const n of c.tree) {
    if (owners.has(n.abilityId)) problems.push(`ability ${n.abilityId} is in both ${owners.get(n.abilityId)} and ${c.id} trees`);
    owners.set(n.abilityId, c.id);
  }
  return problems;
}

const SYMBOL = /#([a-z_.]+)#/g;

/** Every grammar reference resolves; every archetype, act, beat, boss and ability has its text. */
function lintNarrative(content: ContentRegistry): string[] {
  const problems: string[] = [];
  for (const a of Object.values(content.archetypes)) {
    for (const id of a.grantsAbilities) if (!content.abilities[id]) problems.push(`archetype ${a.id}: unknown ability ${id}`);
    if (!content.sharedGrammar[`deed.${a.id}`]) problems.push(`narrative: no deed.${a.id}`);
  }
  for (const q of Object.values(content.questlines)) {
    const g = { ...content.sharedGrammar, ...(content.questlineGrammar[q.id] ?? {}) };
    if (!content.questlineGrammar[q.id]) problems.push(`${q.id}: no questline grammar`);
    for (const act of q.acts) {
      if (!g[`opening.${act.name}`]) problems.push(`${q.id}: no opening.${act.name}`);
      for (const beat of act.narrativeBeats) if (!g[`beat.${beat}`]) problems.push(`${q.id}: no beat.${beat}`);
    }
    for (const [sym, lines] of Object.entries(g)) {
      for (const line of lines) {
        for (const m of line.matchAll(SYMBOL)) {
          if (m[1] !== "beat" && !g[m[1]!]) problems.push(`${q.id}: ${sym} references missing #${m[1]}#`);
        }
      }
    }
    const boss = content.bosses[q.id];
    if (!boss) problems.push(`${q.id}: no boss definition`);
    else {
      for (const atk of boss.attacks) for (const c of atk.counteredBy) if (!content.abilities[c]) problems.push(`${q.id}: boss attack ${atk.id} countered by unknown ability ${c}`);
      if (!boss.attacks.some((a) => a.special)) problems.push(`${q.id}: boss needs a special attack`);
      if (boss.luckBeats.length === 0) problems.push(`${q.id}: boss needs luck beats`);
      if (boss.fatedBlows.length === 0) problems.push(`${q.id}: boss needs nick-of-time lines`);
    }
  }
  return problems;
}

function lintQuestline(q: QuestlineTemplate, content: ContentRegistry): string[] {
  const problems: string[] = [];
  const at = (id: string) => content.archetypes[id];
  const referenced = new Set<string>([q.bossDemand.archetype]);

  for (const act of q.acts) {
    const ids = [act.longArchetype, act.strengthArchetype, act.mobilityArchetype, ...act.steadyPool.map(([id]) => id)];
    if (act.hardArchetype) ids.push(act.hardArchetype);
    for (const id of ids) {
      referenced.add(id);
      if (!at(id)) problems.push(`${q.id}/${act.name}: unknown archetype ${id}`);
    }
    if (at(act.longArchetype) && at(act.longArchetype)!.role !== "long") {
      problems.push(`${q.id}/${act.name}: longArchetype ${act.longArchetype} is not a long archetype`);
    }
    if (act.hardArchetype && at(act.hardArchetype)?.role !== "hard") {
      problems.push(`${q.id}/${act.name}: hardArchetype ${act.hardArchetype} is not a hard archetype`);
    }
  }
  const boss = at(q.bossDemand.archetype);
  if (!boss) problems.push(`${q.id}: unknown boss archetype ${q.bossDemand.archetype}`);
  else if (boss.role !== "long") problems.push(`${q.id}: boss archetype must be a long archetype`);
  if (q.acts[2].longArchetype !== q.bossDemand.archetype) {
    problems.push(`${q.id}: confrontation long archetype should be the boss archetype`);
  }
  if (boss && q.bossDemand.minutes > boss.maxMinutes) problems.push(`${q.id}: boss minutes exceed archetype max`);

  // Every boss mechanic must be trained by something in the line.
  const granted = new Set([...referenced].flatMap((id) => at(id)?.grantsAbilities ?? []));
  for (const m of q.bossMechanics) if (!granted.has(m)) problems.push(`${q.id}: boss mechanic ${m} is never trained`);

  // Theme: each long archetype must share at least one tag with the questline theme.
  for (const act of q.acts) {
    const long = at(act.longArchetype);
    if (long && !long.options.some((o) => o.tags.some((t) => q.themeTags.includes(t)))) {
      problems.push(`${q.id}/${act.name}: long archetype ${long.id} has no on-theme option`);
    }
  }
  return problems;
}
