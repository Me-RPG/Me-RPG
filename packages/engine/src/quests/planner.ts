import type { ActDef, ActName, ArchetypeDef, ClassDef, ClassId, QuestlineTemplate, SlotRole } from "@me-rpg/content";
import type { PlanWeekKind } from "@me-rpg/fitness-model";
import type { EpochDay } from "../events.js";
import { Rng } from "../rng.js";
import type { EngineContext } from "../rules.js";
import { longestInFamily, playerLevel, type ActivityRecord } from "./history.js";
import type { PlayerLevel, QuestlineLength, QuestlinePlan, QuestSlot } from "./types.js";

/** Weeks per player-chosen questline length (design). Each must exist in progression.planTemplates. */
export const QUESTLINE_LENGTH_WEEKS: Record<QuestlineLength, number> = { short: 2, average: 6, long: 12 };

/** Main (non-mobility) sessions per week. Mobility rides on rest days as light recovery (R2). */
const SESSIONS_PER_WEEK: Record<PlayerLevel, number> = { novice: 3, trained: 4 };
/** Suggested day offsets within a week for N main sessions; the long session takes the last. */
const DAY_PATTERN: Record<number, number[]> = { 3: [0, 2, 5], 4: [0, 2, 4, 6] };
/** Novices stay light-moderate for the first weeks before any vigorous session (R3 Q5). */
const NOVICE_FIRST_HARD_WEEK = 4;

export interface PlanInput {
  userId: string;
  questlineId: string;
  template: QuestlineTemplate;
  length: QuestlineLength;
  /** Optional class focus: the plan leans toward that fitness style. */
  focus?: ClassId | null;
  startDay: EpochDay;
  recent: readonly ActivityRecord[];
  ctx: EngineContext;
}

function archetype(ctx: EngineContext, id: string): ArchetypeDef {
  const a = ctx.content.archetypes[id];
  if (!a) throw new Error(`unknown archetype ${id}`);
  return a;
}

/** Weekly growth rate for an archetype's family and effort (R3 weekly_volume_increase_frac). */
function growthRate(a: ArchetypeDef, ctx: EngineContext): number {
  const r = ctx.params.progression.weeklyIncreaseFrac;
  if (a.family === "foot") return a.intensity === "easy" ? r.foot_walk : r.hike_distance;
  if (a.family === "strength") return r.resistance_sets;
  return r.foot_run;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Split weeks into acts: taper weeks are the confrontation; the rest divide training/journey. */
function assignActs(kinds: PlanWeekKind[]): ActName[] {
  const taper = kinds.filter((k) => k === "T").length;
  const rest = kinds.length - taper;
  const training = Math.ceil(rest / 2);
  return kinds.map((_, w) => (w < training ? "training" : w < rest ? "journey" : "confrontation"));
}

interface LongCurve {
  length: number;
  kinds: PlanWeekKind[];
  acts: ActName[];
  longs: number[];
  boss: number;
}

function simulateLongs(template: QuestlineTemplate, start: number, length: number, ctx: EngineContext): LongCurve {
  const prog = ctx.params.progression;
  const kinds = prog.planTemplates[String(length)]!;
  const acts = assignActs(kinds);
  const target = template.bossDemand.minutes;
  const ceiling = target / prog.bossTaper.bossMaxVsLongestFrac;
  const longs: number[] = [];
  let lastBuild: number | null = null;
  for (let w = 0; w < kinds.length; w++) {
    const act = template.acts.find((a) => a.name === acts[w])!;
    const a = archetype(ctx, act.longArchetype);
    const kind = kinds[w]!;
    if (kind === "B") {
      lastBuild = lastBuild === null ? Math.min(start, ceiling) : Math.min(lastBuild * (1 + growthRate(a, ctx)), ceiling);
      longs.push(lastBuild);
    } else if (kind === "D") {
      longs.push((lastBuild ?? start) * prog.deload.volumeFrac);
    } else {
      longs.push((lastBuild ?? start) * prog.bossTaper.volumeFrac);
    }
  }
  // Boss is capped by the single-session spike rule relative to the last build week (R3).
  const boss = Math.min(target, (lastBuild ?? start) * prog.bossTaper.bossMaxVsLongestFrac);
  return { length, kinds, acts, longs, boss };
}

export function planQuestline(input: PlanInput): QuestlinePlan {
  const { template, ctx, startDay, recent } = input;
  const prog = ctx.params.progression;
  const level = playerLevel(recent, startDay, ctx.params);
  const firstLong = archetype(ctx, template.acts[0].longArchetype);
  const longest = longestInFamily(recent, firstLong.family, startDay, prog.spikeLookbackDays);
  const start = clamp(longest ?? firstLong.defaultMinutes[level], firstLong.minMinutes, firstLong.maxMinutes);

  const weeks = QUESTLINE_LENGTH_WEEKS[input.length];
  if (!prog.planTemplates[String(weeks)]) throw new Error(`no plan template for ${weeks} weeks`);
  // The boss is whatever the player can safely reach in the chosen length, up to the template's demand.
  const curve = simulateLongs(template, start, weeks, ctx);

  const rng = Rng.from(input.userId, input.questlineId, "plan");
  const slots: Omit<QuestSlot, "index">[] = [];
  let buildWeeks = 0;
  for (let w = 0; w < curve.length; w++) {
    const kind = curve.kinds[w]!;
    const actName = curve.acts[w]!;
    const act = template.acts.find((a) => a.name === actName)!;
    const isFinal = w === curve.length - 1;
    const volume = kind === "D" ? prog.deload.volumeFrac : kind === "T" ? prog.bossTaper.volumeFrac : 1;
    const growth = curve.longs[w]! / (start * volume);
    if (kind === "B" && w > 0) buildWeeks++;

    const sized = (id: string, role: SlotRole): Omit<QuestSlot, "index" | "dayOffset"> => {
      const a = archetype(ctx, id);
      const base = a.defaultMinutes[level];
      let minutes: number;
      if (role === "long") minutes = curve.longs[w]!;
      else if (role === "strength") minutes = base * (1 + prog.weeklyIncreaseFrac.resistance_sets) ** buildWeeks * volume;
      else if (role === "mobility") minutes = base;
      else minutes = base * Math.max(1, growth) * volume;
      return {
        week: w,
        weekKind: kind,
        act: actName,
        archetypeId: id,
        role,
        plannedMinutes: Math.round(clamp(minutes, a.minMinutes, a.maxMinutes)),
        isBoss: false,
      };
    };

    const focus = input.focus ? ctx.content.classes[input.focus] : undefined;
    const main = weekMainSessions(act, kind, isFinal, w, level, template, rng.fork(`week${w}`), ctx, focus);
    const days = DAY_PATTERN[main.length] ?? main.map((_, i) => Math.round((i * 6) / Math.max(1, main.length - 1)));
    main.forEach((role, i) => {
      const id = role === "long" || role === "boss" ? act.longArchetype : role.archetypeId;
      const r: SlotRole = role === "long" || role === "boss" ? "long" : role.role;
      const slot = { ...sized(id, r), dayOffset: w * 7 + days[i]! };
      if (role === "boss") {
        slot.plannedMinutes = Math.round(curve.boss);
        slot.isBoss = true;
      }
      slots.push(slot);
    });

    if (w % template.mobilityEveryWeeks === 0 || isFinal) {
      const free = [3, 1, 4].find((d) => !days.includes(d)) ?? 3;
      slots.push({ ...sized(act.mobilityArchetype, "mobility"), dayOffset: w * 7 + free });
    }
  }

  slots.sort((a, b) => a.dayOffset - b.dayOffset);
  return {
    questlineId: input.questlineId,
    kind: "questline",
    length: input.length,
    focus: input.focus ?? null,
    templateId: template.id,
    startDay,
    level,
    weekKinds: curve.kinds,
    slots: slots.map((s, index) => ({ ...s, index })),
    bossMinutes: Math.round(curve.boss),
    bossScaled: curve.boss < template.bossDemand.minutes,
  };
}

type MainSession = "long" | "boss" | { archetypeId: string; role: SlotRole };

/** Ordered main sessions for a week: strength first, the long (or boss) session last. */
function weekMainSessions(
  act: ActDef,
  kind: PlanWeekKind,
  isFinal: boolean,
  week: number,
  level: PlayerLevel,
  template: QuestlineTemplate,
  rng: Rng,
  ctx: EngineContext,
  focus?: ClassDef,
): MainSession[] {
  const budget = SESSIONS_PER_WEEK[level];
  const strength: MainSession = { archetypeId: act.strengthArchetype, role: "strength" };
  // With a focus, the first steady session each week follows that class's style.
  const steady = (i: number): MainSession => ({
    archetypeId: focus && i === 0 ? focus.focus.steadyArchetype : rng.fork(`steady${i}`).weighted(act.steadyPool),
    role: "steady",
  });

  if (kind === "T") {
    // Taper: fewer, easier sessions and no hard efforts in the final days (R3 boss_taper).
    const pre: MainSession[] = level === "trained" ? [strength, steady(0)] : [steady(0)];
    return [...pre, isFinal ? "boss" : "long"];
  }

  const out: MainSession[] = [];
  const strengthCount = Math.max(1, Math.min(template.strengthPerWeek[level] + (focus?.focus.extraStrength ?? 0), budget - 1));
  for (let i = 0; i < strengthCount; i++) out.push(strength);

  const prog = ctx.params.progression;
  const hardCap = level === "trained" ? prog.hardSessionsPerWeek.trained : prog.hardSessionsPerWeek.novice;
  const hardAllowed = kind === "B" && act.hardArchetype !== undefined && (level === "trained" || week >= NOVICE_FIRST_HARD_WEEK);
  const fillers = budget - 1 - strengthCount;
  // At most one hard session, and only when an easy session still accompanies it (R3 easy fraction).
  const hard = hardAllowed && fillers >= 2 ? Math.min(1, hardCap) : 0;
  for (let i = 0; i < fillers - hard; i++) out.push(steady(i));
  for (let i = 0; i < hard; i++) out.push({ archetypeId: act.hardArchetype!, role: "hard" });
  out.push("long");
  return out;
}

export interface SingleQuestInput {
  questId: string;
  archetypeId: string;
  startDay: EpochDay;
  recent: readonly ActivityRecord[];
  ctx: EngineContext;
}

/**
 * A standalone bounty: one quest of the chosen archetype, sized to what the
 * player does now (their recent longest for long quests, the default otherwise).
 * The spike cap is applied again when it is materialized.
 */
export function planSingleQuest(input: SingleQuestInput): QuestlinePlan {
  const { ctx, startDay, recent } = input;
  const a = archetype(ctx, input.archetypeId);
  const level = playerLevel(recent, startDay, ctx.params);
  const longest = longestInFamily(recent, a.family, startDay, ctx.params.progression.spikeLookbackDays);
  const base = a.defaultMinutes[level];
  const minutes = a.role === "long" && longest !== null ? Math.max(base, longest) : base;
  return {
    questlineId: input.questId,
    kind: "single",
    length: null,
    focus: null,
    templateId: a.id,
    startDay,
    level,
    weekKinds: ["B"],
    slots: [
      {
        index: 0,
        week: 0,
        weekKind: "B",
        act: "bounty",
        archetypeId: a.id,
        role: a.role,
        dayOffset: 0,
        plannedMinutes: Math.round(clamp(minutes, a.minMinutes, a.maxMinutes)),
        isBoss: false,
      },
    ],
    bossMinutes: 0,
    bossScaled: false,
  };
}
