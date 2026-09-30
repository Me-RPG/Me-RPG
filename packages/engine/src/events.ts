import type { ClassId } from "@me-rpg/content";
import type { ActivityInput, Capacity } from "@me-rpg/fitness-model";
import type { QuestlineLength } from "./quests/types.js";

/** Days since 1970-01-01 (UTC). The engine never reads the clock itself. */
export type EpochDay = number;

interface Base {
  /** Monotonic per-user sequence number. */
  seq: number;
  day: EpochDay;
}

export type ActivitySource = "manual" | "healthkit" | "health_connect" | "strava";

export interface CharacterCreated extends Base {
  type: "CharacterCreated";
  userId: string;
  name: string;
  /** Starting capacity estimates from onboarding (see research/r5). */
  baseline: Record<Capacity, number>;
}

export interface ActivityLogged extends Base {
  type: "ActivityLogged";
  activityId: string;
  source: ActivitySource;
  activity: ActivityInput;
}

/** The player marked a day as planned rest ("Camp"). Never penalized. */
export interface RestDeclared extends Base {
  type: "RestDeclared";
}

/** Illness or injury: pauses displayed atrophy and quest deadlines. */
export interface SanctuaryEntered extends Base {
  type: "SanctuaryEntered";
  reason: "illness" | "injury" | "life" | "other";
}

export interface SanctuaryExited extends Base {
  type: "SanctuaryExited";
}

/** Begin a questline from a content template. The plan is derived deterministically from state at this point. */
export interface QuestlineStarted extends Base {
  type: "QuestlineStarted";
  questlineId: string;
  templateId: string;
  /** Player's choice: short (2 weeks), average (6) or long (12). */
  length: QuestlineLength;
  /** Optional class focus (Ranger, Berserker, Warrior): the plan leans toward that style. */
  focus?: ClassId;
}

/** Take a single standalone quest ("bounty") of the chosen archetype. No boss follows. */
export interface SingleQuestStarted extends Base {
  type: "SingleQuestStarted";
  questId: string;
  archetypeId: string;
}

/**
 * The player marked a quest option done (questlineId is the quest id for single quests) without a tracked workout (e.g. a
 * strength routine). The engine logs the option's nominal activity for stats.
 */
export interface QuestOptionCompleted extends Base {
  type: "QuestOptionCompleted";
  questlineId: string;
  optionId: string;
  durationMin?: number;
  rpe?: number;
}

/** Enter the boss fight of a questline whose quests are all complete. */
export interface BattleStarted extends Base {
  type: "BattleStarted";
  questlineId: string;
}

/** One hero action in the boss fight: "strike", "guard", or an earned ability id. */
export interface BattleActionTaken extends Base {
  type: "BattleActionTaken";
  questlineId: string;
  action: string;
}

/** Advance the simulation to `day` with nothing else happening. */
export interface DayTicked extends Base {
  type: "DayTicked";
}

export type GameEvent =
  | CharacterCreated
  | ActivityLogged
  | RestDeclared
  | SanctuaryEntered
  | SanctuaryExited
  | QuestlineStarted
  | SingleQuestStarted
  | QuestOptionCompleted
  | BattleStarted
  | BattleActionTaken
  | DayTicked;
