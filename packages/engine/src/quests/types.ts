import type { ActName, ClassId, Family, RoutineDef, SlotRole } from "@healthrpg/content";
import type { ActivityType, PlanWeekKind } from "@healthrpg/fitness-model";
import type { BattleState } from "../battle/battle.js";
import type { EpochDay } from "../events.js";

export type PlayerLevel = "novice" | "trained";

/** Questline length the player picks when starting a questline. */
export type QuestlineLength = "short" | "average" | "long";

/** One planned session in the skeleton. Concrete targets are set when the quest becomes active. */
export interface QuestSlot {
  index: number;
  week: number;
  weekKind: PlanWeekKind;
  act: ActName;
  archetypeId: string;
  role: SlotRole;
  /** Suggested day, relative to the questline's start day. */
  dayOffset: number;
  plannedMinutes: number;
  isBoss: boolean;
}

export interface QuestlinePlan {
  questlineId: string;
  /** "single" is a standalone bounty: one quest, no boss. */
  kind: "questline" | "single";
  /** Chosen length for questlines; null for single quests. */
  length: QuestlineLength | null;
  /** Class focus chosen at start, if any. */
  focus: ClassId | null;
  /** Questline template id, or the archetype id for a single quest. */
  templateId: string;
  startDay: EpochDay;
  level: PlayerLevel;
  weekKinds: PlanWeekKind[];
  slots: QuestSlot[];
  /** Planned boss minutes; below the template's demand when `bossScaled`. */
  bossMinutes: number;
  bossScaled: boolean;
}

export interface QuestOption {
  id: string;
  title: string;
  activity: ActivityType;
  accepts: ActivityType[];
  targetMinutes: number;
  targetElevGainM?: number;
  targetRpe: number;
  /** MET-minutes this option is sized to; options in one quest match within tolerance. */
  targetMetMinutes: number;
  /** TRIMP-style training load at the target (drives stat gains). */
  targetLoad: number;
  routine?: RoutineDef;
  tags: string[];
}

export interface ActiveQuest {
  slotIndex: number;
  /** Increments each time a lapsed window re-rolls the quest (it never fails). */
  roll: number;
  archetypeId: string;
  title: string;
  act: ActName;
  family: Family;
  isBoss: boolean;
  availableFromDay: EpochDay;
  dueDay: EpochDay;
  options: QuestOption[];
}

export interface CompletedQuest {
  slotIndex: number;
  optionId: string;
  activityId: string;
  day: EpochDay;
  /** What the player actually did; the story is written from this. */
  activity: ActivityType;
  minutes: number;
  elevGainM?: number;
}

export interface QuestlineState {
  plan: QuestlinePlan;
  active: ActiveQuest | null;
  completed: CompletedQuest[];
  /** Boss-battle abilities earned so far (Phase 3 uses these). */
  abilities: string[];
  /**
   * boss_ready: every quest done, battle unlocked. victorious: boss defeated.
   * complete: a single quest is done.
   */
  status: "active" | "boss_ready" | "victorious" | "complete";
  battle: BattleState | null;
}
