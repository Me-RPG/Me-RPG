import type { ActDef, Grammar } from "@me-rpg/content";
import { Rng } from "../rng.js";
import type { EngineContext } from "../rules.js";
import type { GameState } from "../state.js";
import type { QuestlineState } from "../quests/types.js";
import { expand, sentences } from "./grammar.js";

function grammarFor(q: QuestlineState, ctx: EngineContext): Grammar {
  return { ...ctx.content.sharedGrammar, ...(ctx.content.questlineGrammar[q.plan.templateId] ?? {}) };
}

function baseSlots(state: GameState, q: QuestlineState, ctx: EngineContext): Record<string, string> {
  const template = ctx.content.questlines[q.plan.templateId];
  return {
    hero: state.character?.name ?? "The hero",
    antagonist: template?.antagonist ?? "the foe",
    setting: template?.setting ?? "the village",
  };
}

/**
 * The short story told when the `completedIndex`-th quest of a questline (or a
 * single quest) is finished. Pure: the same state always tells the same story.
 */
export function questStory(state: GameState, q: QuestlineState, completedIndex: number, ctx: EngineContext): string {
  const done = q.completed[completedIndex];
  if (!done) throw new Error(`no completed quest ${completedIndex}`);
  const slot = q.plan.slots[done.slotIndex]!;
  const archetype = ctx.content.archetypes[slot.archetypeId]!;
  const option = archetype.options.find((o) => o.id === done.optionId);
  const grammar = grammarFor(q, ctx);
  const rng = Rng.from(state.character?.userId ?? "", q.plan.questlineId, "story", done.slotIndex);

  const routineId = option?.routineId;
  const remaining = q.plan.slots.length - (completedIndex + 1);
  const slots: Record<string, string> = {
    ...baseSlots(state, q, ctx),
    minutes: String(done.minutes),
    climbPhrase: done.elevGainM && done.elevGainM >= 20 ? `climbing ${Math.round(done.elevGainM)} metres` : "over gentle ground",
    routine: (routineId ? (ctx.content.routines[routineId]?.name ?? "the drill") : "the drill").replace(/^The /, "the "),
    option: (option?.title ?? archetype.name).replace(/^./, (c) => c.toLowerCase()),
    remainingTrials: remaining === 1 ? "1 trial" : `${remaining} trials`,
  };

  if (q.plan.kind === "single") {
    return sentences([
      expand("#bounty.opening#", grammar, slots, rng.fork("open")),
      expand(`#deed.${archetype.id}#`, grammar, slots, rng.fork("deed")),
      expand("#color#", grammar, slots, rng.fork("color")),
      expand("#bounty.closing#", grammar, slots, rng.fork("close")),
    ]);
  }

  const template = ctx.content.questlines[q.plan.templateId]!;
  const act = template.acts.find((a) => a.name === slot.act) ?? template.acts[0];
  slots.actTitle = act.title;
  const g: Grammar = { ...grammar, beat: grammar[`beat.${currentBeat(q, done.slotIndex, act)}`] ?? [""] };
  const progress = (completedIndex + 1) / q.plan.slots.length;
  const closing = remaining === 0 ? "final" : progress < 0.34 ? "early" : progress < 0.75 ? "mid" : "late";

  return sentences([
    expand(`#opening.${act.name}#`, g, slots, rng.fork("open")),
    expand(`#deed.${archetype.id}#`, g, slots, rng.fork("deed")),
    expand("#color#", g, slots, rng.fork("color")),
    expand(`#closing.${closing}#`, g, slots, rng.fork("close")),
  ]);
}

/** Narrative beats advance through an act as its quests are completed. */
function currentBeat(q: QuestlineState, slotIndex: number, act: ActDef): string {
  const inAct = q.plan.slots.filter((s) => s.act === act.name);
  const pos = inAct.findIndex((s) => s.index === slotIndex);
  const frac = inAct.length <= 1 ? 0 : Math.max(0, pos) / (inAct.length - 1);
  const i = Math.min(act.narrativeBeats.length - 1, Math.floor(frac * act.narrativeBeats.length));
  return act.narrativeBeats[i] ?? "";
}

/** The closing story after a boss battle, by victory grade. */
export function epilogue(state: GameState, q: QuestlineState, grade: "narrow" | "valiant" | "legendary", ctx: EngineContext): string {
  const rng = Rng.from(state.character?.userId ?? "", q.plan.questlineId, "epilogue");
  return sentences([expand(`#epilogue.${grade}#`, grammarFor(q, ctx), baseSlots(state, q, ctx), rng)]);
}
