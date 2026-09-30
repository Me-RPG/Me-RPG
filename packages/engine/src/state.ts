import { CAPACITIES, activityLoad, loadByCapacity, type ActivityInput, type Capacity } from "@me-rpg/fitness-model";
import { battleTurn, startBattle } from "./battle/battle.js";
import { initialCapacity, stimulateCapacity, tickCapacity, type CapacityState } from "./capacity.js";
import type { EpochDay, GameEvent } from "./events.js";
import { hashValue } from "./hash.js";
import { addClassXp, EMPTY_CLASS_XP, unlockTreeSkills, type ClassXp } from "./classes.js";
import { recordMaintenance, type MaintenanceWeek } from "./maintenance.js";
import { grantSkills, trainSkills, type SkillState } from "./skills.js";
import { HISTORY_DAYS, type ActivityRecord } from "./quests/history.js";
import { activityCompletesOption, materializeQuest } from "./quests/materialize.js";
import { planQuestline, planSingleQuest } from "./quests/planner.js";
import type { CompletedQuest, QuestlinePlan } from "./quests/types.js";
import type { QuestlineState } from "./quests/types.js";
import { DEFAULT_CONTEXT, type EngineContext } from "./rules.js";

export const STATE_VERSION = 4;

export interface GameState {
  version: number;
  seq: number;
  day: EpochDay;
  character: { userId: string; name: string; createdDay: EpochDay } | null;
  capacities: Record<Capacity, CapacityState>;
  sanctuary: { since: EpochDay } | null;
  /** Days (within the history window) with activity, planned rest, or Sanctuary. */
  engagedDays: EpochDay[];
  totals: { sessions: number; distanceM: number; elevGainM: number; xp: number };
  wellRestedUntil: EpochDay | null;
  seenActivityIds: string[];
  /** Session summaries for the last HISTORY_DAYS, used by progression caps. */
  recent: ActivityRecord[];
  questlines: QuestlineState[];
  /** Battle skills, kept across questlines. */
  skills: Record<string, SkillState>;
  /** Maintenance bounties done in the current 7-day week. */
  maintenance: MaintenanceWeek;
  /** Non-exclusive class progress (Ranger, Berserker, Warrior). */
  classXp: ClassXp;
}

export function initialState(): GameState {
  const capacities = {} as Record<Capacity, CapacityState>;
  for (const c of CAPACITIES) capacities[c] = initialCapacity(0, 0);
  return {
    version: STATE_VERSION,
    seq: 0,
    day: 0,
    character: null,
    capacities,
    sanctuary: null,
    engagedDays: [],
    totals: { sessions: 0, distanceM: 0, elevGainM: 0, xp: 0 },
    wellRestedUntil: null,
    seenActivityIds: [],
    recent: [],
    questlines: [],
    skills: {},
    maintenance: { week: 0, done: [] },
    classXp: { ...EMPTY_CLASS_XP },
  };
}

export class EngineError extends Error {}

/** Advance the world day by day up to `day`, then re-roll any quest whose window lapsed. */
export function advanceTo(state: GameState, day: EpochDay, ctx: EngineContext = DEFAULT_CONTEXT): GameState {
  if (state.character === null || day <= state.day) return state;
  const inSanctuary = state.sanctuary !== null;
  let capacities = state.capacities;
  for (let d = state.day + 1; d <= day; d++) {
    const next = {} as Record<Capacity, CapacityState>;
    for (const c of CAPACITIES) {
      next[c] = tickCapacity(capacities[c], d, ctx.params.capacities[c], inSanctuary);
    }
    capacities = next;
  }
  const s: GameState = {
    ...state,
    day,
    capacities,
    engagedDays: state.engagedDays.filter((d) => d > day - ctx.rules.historyDays),
    wellRestedUntil: state.wellRestedUntil !== null && state.wellRestedUntil < day ? null : state.wellRestedUntil,
    recent: state.recent.filter((r) => r.day > day - HISTORY_DAYS),
  };
  // Sanctuary pauses quest deadlines; otherwise a lapsed quest re-rolls with fresh targets. It never fails.
  if (inSanctuary) return s;
  return {
    ...s,
    questlines: s.questlines.map((q) =>
      q.active !== null && q.active.dueDay < day ? rematerialize(s, q, q.active.roll + 1, day, ctx) : q,
    ),
  };
}

function rematerialize(s: GameState, q: QuestlineState, roll: number, day: EpochDay, ctx: EngineContext): QuestlineState {
  if (q.active === null) return q;
  const active = materializeQuest({
    userId: s.character!.userId,
    plan: q.plan,
    slotIndex: q.active.slotIndex,
    roll,
    day,
    availableFromDay: day,
    recent: s.recent,
    ctx,
  });
  return { ...q, active };
}

function markEngaged(days: EpochDay[], day: EpochDay): EpochDay[] {
  return days.includes(day) ? days : [...days, day].sort((a, b) => a - b);
}

/** Apply a session to capacities, totals and history. Returns the state unchanged for duplicates. */
function applyActivity(
  s: GameState,
  activityId: string,
  activity: ActivityInput,
  day: EpochDay,
  ctx: EngineContext,
): GameState {
  if (s.seenActivityIds.includes(activityId)) return s;
  const loads = loadByCapacity(activity, ctx.params);
  const capacities = { ...s.capacities };
  for (const c of CAPACITIES) {
    capacities[c] = stimulateCapacity(capacities[c], loads[c], day, ctx.params.capacities[c]);
  }
  const record: ActivityRecord = {
    day,
    activityId,
    type: activity.type,
    family: ctx.content.familyOf(activity.type),
    durationMin: activity.durationMin,
    load: Math.round(activityLoad(activity, ctx.params) * 100) / 100,
  };
  if (activity.elevGainM !== undefined) record.elevGainM = activity.elevGainM;
  const maint = recordMaintenance(s.maintenance, s.character!.createdDay, record, ctx);
  const classXp = addClassXp(s.classXp, activity, ctx);
  const bonusXp = maint.newlyDone.reduce((sum, b) => sum + b.bonusXp, 0);
  return {
    ...s,
    capacities,
    engagedDays: markEngaged(s.engagedDays, day),
    totals: {
      sessions: s.totals.sessions + 1,
      distanceM: s.totals.distanceM + (activity.distanceM ?? 0),
      elevGainM: s.totals.elevGainM + (activity.elevGainM ?? 0),
      xp: s.totals.xp + Math.round(record.load) + bonusXp,
    },
    seenActivityIds: [...s.seenActivityIds, activityId],
    recent: [...s.recent, record],
    skills: unlockTreeSkills(trainSkills(s.skills, record, ctx), classXp, day, ctx),
    maintenance: maint.week,
    classXp,
  };
}

/** Mark the active quest done with `optionId` and queue the next slot (or the boss battle). */
function completeQuest(
  s: GameState,
  qIndex: number,
  optionId: string,
  activityId: string,
  activity: ActivityInput,
  day: EpochDay,
  ctx: EngineContext,
): GameState {
  const q = s.questlines[qIndex]!;
  const active = q.active!;
  const slot = q.plan.slots[active.slotIndex]!;
  const archetype = ctx.content.archetypes[active.archetypeId]!;
  const abilities = [...new Set([...q.abilities, ...archetype.grantsAbilities])].sort();
  const done: CompletedQuest = { slotIndex: active.slotIndex, optionId, activityId, day, activity: activity.type, minutes: Math.round(activity.durationMin) };
  if (activity.elevGainM !== undefined) done.elevGainM = activity.elevGainM;
  const completed = [...q.completed, done];

  let next: QuestlineState;
  if (q.plan.kind === "single") {
    next = { ...q, completed, abilities, active: null, status: "complete" };
  } else if (slot.isBoss || active.slotIndex + 1 >= q.plan.slots.length) {
    next = { ...q, completed, abilities, active: null, status: "boss_ready" };
  } else {
    const nextSlot = q.plan.slots[active.slotIndex + 1]!;
    // One quest per day; hard-after-hard or strength-after-strength waits 48 h (R3).
    const sameStress = (slot.role === "hard" && nextSlot.role === "hard") || (slot.role === "strength" && nextSlot.role === "strength");
    const gap = sameStress ? Math.ceil(ctx.params.progression.minHoursBetweenHardSameMuscle / 24) : 1;
    const nextActive = materializeQuest({
      userId: s.character!.userId,
      plan: q.plan,
      slotIndex: nextSlot.index,
      roll: 0,
      day,
      availableFromDay: day + gap,
      recent: s.recent,
      ctx,
    });
    next = { ...q, completed, abilities, active: nextActive };
  }
  const questlines = [...s.questlines];
  questlines[qIndex] = next;
  return { ...s, questlines, skills: grantSkills(s.skills, archetype.grantsAbilities, day) };
}

/** Let a logged session complete at most one open quest (earliest-started questline first). */
function matchQuests(s: GameState, activityId: string, activity: ActivityInput, day: EpochDay, ctx: EngineContext): GameState {
  for (let i = 0; i < s.questlines.length; i++) {
    const active = s.questlines[i]!.active;
    if (active === null || day < active.availableFromDay) continue;
    const option = active.options.find((o) => activityCompletesOption(activity, o));
    if (option) return completeQuest(s, i, option.id, activityId, activity, day, ctx);
  }
  return s;
}

/**
 * Typical speeds used to estimate distance when a foot quest is marked done by
 * hand instead of tracked (design values; tracked activities use real distance).
 */
const ESTIMATED_KMH: Record<string, number> = { walk: 5, hike: 4, hike_loaded: 3.5, snowshoe: 3, run: 9, trail_run: 8 };

function withQuestline(s: GameState, i: number, q: QuestlineState): GameState {
  const questlines = [...s.questlines];
  questlines[i] = q;
  return { ...s, questlines };
}

function assertNewQuestId(s: GameState, id: string): void {
  if (s.questlines.some((q) => q.plan.questlineId === id)) throw new EngineError(`quest ${id} already exists`);
}

function startPlan(s: GameState, plan: QuestlinePlan, day: EpochDay, ctx: EngineContext): GameState {
  const active = materializeQuest({
    userId: s.character!.userId,
    plan,
    slotIndex: 0,
    roll: 0,
    day,
    availableFromDay: day,
    recent: s.recent,
    ctx,
  });
  return { ...s, questlines: [...s.questlines, { plan, active, completed: [], abilities: [], status: "active", battle: null }] };
}

export function reduce(state: GameState, event: GameEvent, ctx: EngineContext = DEFAULT_CONTEXT): GameState {
  if (event.seq <= state.seq) throw new EngineError(`event seq ${event.seq} is not after ${state.seq}`);
  if (state.character === null && event.type !== "CharacterCreated") {
    throw new EngineError(`${event.type} before CharacterCreated`);
  }
  if (state.character !== null && event.day < state.day) {
    throw new EngineError(`event day ${event.day} is before current day ${state.day}`);
  }

  const s = { ...advanceTo(state, event.day, ctx), seq: event.seq };

  switch (event.type) {
    case "CharacterCreated": {
      if (state.character !== null) throw new EngineError("character already exists");
      const capacities = {} as Record<Capacity, CapacityState>;
      for (const c of CAPACITIES) capacities[c] = initialCapacity(event.baseline[c], event.day);
      return {
        ...s,
        day: event.day,
        character: { userId: event.userId, name: event.name, createdDay: event.day },
        capacities,
      };
    }

    case "ActivityLogged": {
      if (s.seenActivityIds.includes(event.activityId)) return s; // duplicate import
      const applied = applyActivity(s, event.activityId, event.activity, event.day, ctx);
      return matchQuests(applied, event.activityId, event.activity, event.day, ctx);
    }

    case "QuestOptionCompleted": {
      const qIndex = s.questlines.findIndex((q) => q.plan.questlineId === event.questlineId);
      const active = s.questlines[qIndex]?.active;
      if (!active) throw new EngineError(`questline ${event.questlineId} has no open quest`);
      if (event.day < active.availableFromDay) throw new EngineError(`quest opens on day ${active.availableFromDay}`);
      const option = active.options.find((o) => o.id === event.optionId);
      if (!option) throw new EngineError(`option ${event.optionId} is not offered`);
      const activity: ActivityInput = {
        type: option.activity,
        durationMin: event.durationMin ?? option.targetMinutes,
        rpe: event.rpe ?? option.targetRpe,
      };
      if (option.targetElevGainM !== undefined) activity.elevGainM = option.targetElevGainM;
      const kmh = ESTIMATED_KMH[option.activity];
      if (kmh) activity.distanceM = Math.round((kmh * activity.durationMin * 1000) / 60);
      const activityId = `quest:${event.questlineId}:${active.slotIndex}:${active.roll}`;
      const applied = applyActivity(s, activityId, activity, event.day, ctx);
      return completeQuest(applied, qIndex, option.id, activityId, activity, event.day, ctx);
    }

    case "QuestlineStarted": {
      const template = ctx.content.questlines[event.templateId];
      if (!template) throw new EngineError(`unknown questline template ${event.templateId}`);
      if (event.focus && !ctx.content.classes[event.focus]) throw new EngineError(`unknown class ${event.focus}`);
      assertNewQuestId(s, event.questlineId);
      const plan = planQuestline({
        userId: s.character!.userId,
        questlineId: event.questlineId,
        template,
        length: event.length,
        focus: event.focus ?? null,
        startDay: event.day,
        recent: s.recent,
        ctx,
      });
      return startPlan(s, plan, event.day, ctx);
    }

    case "SingleQuestStarted": {
      if (!ctx.content.archetypes[event.archetypeId]) throw new EngineError(`unknown quest type ${event.archetypeId}`);
      assertNewQuestId(s, event.questId);
      const plan = planSingleQuest({
        questId: event.questId,
        archetypeId: event.archetypeId,
        startDay: event.day,
        recent: s.recent,
        ctx,
      });
      return startPlan(s, plan, event.day, ctx);
    }

    case "BattleStarted": {
      const i = s.questlines.findIndex((q) => q.plan.questlineId === event.questlineId);
      const q = s.questlines[i];
      if (!q) throw new EngineError(`unknown questline ${event.questlineId}`);
      if (q.status !== "boss_ready") throw new EngineError(`questline ${event.questlineId} is not ready for its boss`);
      if (q.battle) throw new EngineError("battle already started");
      return withQuestline(s, i, { ...q, battle: startBattle(s, q, ctx) });
    }

    case "BattleActionTaken": {
      const i = s.questlines.findIndex((q) => q.plan.questlineId === event.questlineId);
      const q = s.questlines[i];
      if (!q?.battle) throw new EngineError(`no battle in progress for ${event.questlineId}`);
      let battle;
      try {
        battle = battleTurn(s, q, event.action, ctx);
      } catch (e) {
        throw new EngineError((e as Error).message);
      }
      return withQuestline(s, i, { ...q, battle, status: battle.outcome ? "victorious" : q.status });
    }

    case "RestDeclared": {
      const fatigue = CAPACITIES.reduce((sum, c) => sum + s.capacities[c].fatigue, 0);
      return {
        ...s,
        engagedDays: markEngaged(s.engagedDays, event.day),
        wellRestedUntil: fatigue >= ctx.rules.wellRestedFatigueThreshold ? event.day + 1 : s.wellRestedUntil,
      };
    }

    case "SanctuaryEntered":
      if (s.sanctuary !== null) return s;
      return { ...s, sanctuary: { since: event.day }, engagedDays: markEngaged(s.engagedDays, event.day) };

    case "SanctuaryExited": {
      if (s.sanctuary === null) return s;
      // Returning heroes get a fresh window, sized to where they are now.
      const out = { ...s, sanctuary: null };
      return { ...out, questlines: out.questlines.map((q) => rematerialize(out, q, (q.active?.roll ?? 0) + 1, event.day, ctx)) };
    }

    case "DayTicked":
      return s;
  }
}

export function replay(events: readonly GameEvent[], ctx: EngineContext = DEFAULT_CONTEXT): GameState {
  return events.reduce((st, e) => reduce(st, e, ctx), initialState());
}

export function hashState(state: GameState): string {
  return hashValue(state);
}

