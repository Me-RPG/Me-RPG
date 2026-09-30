import { scaledRoutine, type ArchetypeDef, type Family, type OptionTemplate } from "@healthrpg/content";
import { activityLoad, durationForMetMinutes, metMinutes, type ActivityInput } from "@healthrpg/fitness-model";
import type { EpochDay } from "../events.js";
import { Rng } from "../rng.js";
import type { EngineContext } from "../rules.js";
import { longestInFamily, maxElevInFamily, playerLevel, type ActivityRecord } from "./history.js";
import type { ActiveQuest, QuestlinePlan, QuestOption } from "./types.js";

/** Days a quest stays open before it re-rolls (design). The boss gets longer. */
export const QUEST_WINDOW_DAYS = 4;
export const BOSS_WINDOW_DAYS = 7;
/** Options in one quest must be within this fraction of the target MET-minutes. */
export const OPTION_LOAD_TOLERANCE = 0.1;
/**
 * An equivalent option must also take a comparable time (at most half or
 * double, the WHO moderate:vigorous ratio). Options outside the band are dropped.
 */
export const OPTION_DURATION_BAND = { min: 0.5, max: 2 } as const;
/** Extra options beyond the primary (so 2-4 total with the generic fallback). */
const MAX_EXTRA_OPTIONS = 2;
/** Elevation step allowed when the player has no recent climbing, and the minimum step otherwise (design). */
const FIRST_CLIMB_CAP_M = 100;
const MIN_ELEV_STEP_M = 50;

export interface MaterializeInput {
  userId: string;
  plan: QuestlinePlan;
  slotIndex: number;
  roll: number;
  day: EpochDay;
  availableFromDay: EpochDay;
  recent: readonly ActivityRecord[];
  ctx: EngineContext;
}

const round = (v: number, step: number) => Math.round(v / step) * step;

/** R3 single-session spike cap: at most +10% (or the minimum step) over the 30-day longest. */
export function spikeCap(recent: readonly ActivityRecord[], family: Family, day: EpochDay, ctx: EngineContext): number | null {
  const prog = ctx.params.progression;
  const longest = longestInFamily(recent, family, day, prog.spikeLookbackDays);
  if (longest === null) return null;
  return Math.max(longest * (1 + prog.spikeCapFrac), longest + prog.minStepMin);
}

function elevationCap(recent: readonly ActivityRecord[], family: Family, day: EpochDay, ctx: EngineContext): number {
  const best = maxElevInFamily(recent, family, day, ctx.params.progression.spikeLookbackDays);
  if (best === null || best <= 0) return FIRST_CLIMB_CAP_M;
  return Math.max(best * (1 + ctx.params.progression.spikeCapFrac), best + MIN_ELEV_STEP_M);
}

export function materializeQuest(input: MaterializeInput): ActiveQuest {
  const { plan, ctx, recent, day } = input;
  const slot = plan.slots[input.slotIndex];
  if (!slot) throw new Error(`slot ${input.slotIndex} out of range`);
  const a = ctx.content.archetypes[slot.archetypeId];
  if (!a) throw new Error(`unknown archetype ${slot.archetypeId}`);
  const level = playerLevel(recent, day, ctx.params);
  const rpe = ctx.params.progression.intensityRpe[a.intensity];

  // Target minutes: the plan, limited by what the player has actually done lately.
  let minutes = slot.plannedMinutes;
  const cap = spikeCap(recent, a.family, day, ctx);
  if (cap !== null) minutes = Math.min(minutes, cap);
  minutes = Math.min(a.maxMinutes, Math.max(a.minMinutes, Math.round(minutes)));

  const elevCap = elevationCap(recent, a.family, day, ctx);
  const elevFor = (o: OptionTemplate) => (o.elevPerMin ? round(Math.min(o.elevPerMin * minutes, elevCap), 10) : undefined);

  const eligible = a.options.filter((o) => !o.requiresTrained || level === "trained");
  const primaryTpl = eligible[0]!;
  const primary = sizeOption(primaryTpl, minutes, elevFor(primaryTpl), rpe, ctx);
  const target = primary.targetMetMinutes;

  // Other options: same MET-minutes, solved for their own activity; dropped if that breaks a cap.
  const rng = Rng.from(input.userId, plan.questlineId, `slot${slot.index}`, `roll${input.roll}`);
  const extras: QuestOption[] = [];
  for (const tpl of shuffled(eligible.slice(1), rng)) {
    if (extras.length >= MAX_EXTRA_OPTIONS) break;
    const elev = elevFor(tpl);
    const base: Omit<ActivityInput, "durationMin"> = { type: tpl.activity };
    if (elev !== undefined) base.elevGainM = elev;
    const d = Math.round(durationForMetMinutes(target, base, ctx.params));
    const optCap = spikeCap(recent, ctx.content.familyOf(tpl.activity), day, ctx);
    if (d < a.minMinutes || d > a.maxMinutes || (optCap !== null && d > optCap)) continue;
    if (d < minutes * OPTION_DURATION_BAND.min || d > minutes * OPTION_DURATION_BAND.max) continue;
    const opt = sizeOption(tpl, d, elev, rpe, ctx);
    if (Math.abs(opt.targetMetMinutes - target) > OPTION_LOAD_TOLERANCE * target) continue;
    extras.push(opt);
  }

  const options = [primary, ...extras];
  if (options.length < 2) options.push(genericOption(a, primary, ctx));

  const suggested = Math.max(input.availableFromDay, plan.startDay + slot.dayOffset);
  return {
    slotIndex: slot.index,
    roll: input.roll,
    archetypeId: a.id,
    title: slot.isBoss ? `${a.name}: the final trial` : a.name,
    act: slot.act,
    family: a.family,
    isBoss: slot.isBoss,
    availableFromDay: input.availableFromDay,
    dueDay: suggested + (slot.isBoss ? BOSS_WINDOW_DAYS : QUEST_WINDOW_DAYS),
    options,
  };
}

function sizeOption(tpl: OptionTemplate, minutes: number, elev: number | undefined, rpe: number, ctx: EngineContext): QuestOption {
  // Sized on the activity's typical intensity (MET or default RPE) so options differ sensibly;
  // targetRpe is guidance shown to the player.
  const input: ActivityInput = { type: tpl.activity, durationMin: minutes };
  if (elev !== undefined) input.elevGainM = elev;
  const opt: QuestOption = {
    id: tpl.id,
    title: tpl.title,
    activity: tpl.activity,
    accepts: tpl.accepts,
    targetMinutes: minutes,
    targetRpe: rpe,
    targetMetMinutes: Math.round(metMinutes(input, ctx.params) * 10) / 10,
    targetLoad: Math.round(activityLoad(input, ctx.params) * 100) / 100,
    tags: tpl.tags,
  };
  if (elev !== undefined) opt.targetElevGainM = elev;
  if (tpl.routineId) {
    const routine = ctx.content.routines[tpl.routineId];
    if (routine) opt.routine = scaledRoutine(routine, minutes);
  }
  return opt;
}

/** Fallback so every quest offers a choice: any activity in the archetype's family, same target. */
function genericOption(a: ArchetypeDef, primary: QuestOption, ctx: EngineContext): QuestOption {
  const accepts = Object.keys(ctx.params.activities).filter((t) => ctx.content.familyOf(t) === a.family);
  return {
    ...primary,
    id: `${a.id}_any`,
    title: `Any ${a.family} session of your choosing`,
    accepts: accepts.length > 0 ? accepts : primary.accepts,
    tags: [...a.tags],
  };
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Does a logged activity complete this option? Duration within 10%; climb within 20% when both are known. */
export function activityCompletesOption(activity: ActivityInput, option: QuestOption): boolean {
  if (!option.accepts.includes(activity.type)) return false;
  if (activity.durationMin < option.targetMinutes * 0.9) return false;
  if (option.targetElevGainM !== undefined && activity.elevGainM !== undefined) {
    if (activity.elevGainM < option.targetElevGainM * 0.8) return false;
  }
  return true;
}
