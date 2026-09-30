import type { ActivityType } from "@healthrpg/fitness-model";
import type { AbilityDef } from "./abilities.js";
import type { BossDef } from "./bosses.js";
import type { ClassDef, ClassId } from "./classes.js";
import type { MaintenanceBountyDef } from "./maintenance.js";
import type { Grammar } from "./narrative.js";

/**
 * Activities that are comparable for progression caps (the 30-day longest
 * session, weekly volume growth). A hike and a walk are both "foot".
 */
export type Family = "foot" | "cycle" | "water" | "strength" | "mobility" | "conditioning" | "other";

export type Intensity = "easy" | "moderate" | "hard";

/**
 * - long: the week's progression-tracked session (the one that builds toward the boss)
 * - steady: supporting endurance at easy/moderate effort
 * - hard: a vigorous session (counts against the hard-session cap)
 * - strength / mobility: resistance and range-of-motion work
 */
export type SlotRole = "long" | "steady" | "hard" | "strength" | "mobility";

/** Questline acts, plus "bounty" for a standalone single quest. */
export type ActName = "training" | "journey" | "confrontation" | "bounty";

export interface OptionTemplate {
  id: string;
  title: string;
  /** The activity used to size this option's target. */
  activity: ActivityType;
  /** Activities that complete this option when logged. Must include `activity`. */
  accepts: ActivityType[];
  /** Metres of climb expected per minute (hikes); scales with the duration target. */
  elevPerMin?: number;
  /** A named routine from content/routines, shown to the player as the workout. */
  routineId?: string;
  /** Offered only once the player counts as "trained" (see ProgressionParams.trainedMinSessions28d). */
  requiresTrained?: boolean;
  /** Narrative hooks for the story engine (Phase 3). */
  tags: string[];
}

export interface ArchetypeDef {
  id: string;
  name: string;
  role: SlotRole;
  family: Family;
  intensity: Intensity;
  /** Starting minutes for a player with no comparable history. */
  defaultMinutes: { novice: number; trained: number };
  /** Hard bounds on the target regardless of progression. */
  minMinutes: number;
  maxMinutes: number;
  options: OptionTemplate[];
  /** Boss-battle abilities earned by completing a quest of this archetype (Phase 3). */
  grantsAbilities: string[];
  tags: string[];
}

export interface RoutineExercise {
  name: string;
  sets: number;
  reps?: number;
  seconds?: number;
  cue: string;
}

export interface RoutineDef {
  id: string;
  name: string;
  /** Minutes for one pass at the listed sets; sets scale with the quest's duration target. */
  nominalMinutes: number;
  equipment: "none" | "home" | "gym";
  exercises: RoutineExercise[];
}

export interface ActDef {
  name: ActName;
  title: string;
  /** Archetype for the week's long session in this act. */
  longArchetype: string;
  /** Archetypes for the remaining endurance slots, picked by seeded weight. */
  steadyPool: Array<[archetypeId: string, weight: number]>;
  /** Optional hard session (trained players, within the hard cap). */
  hardArchetype?: string;
  strengthArchetype: string;
  mobilityArchetype: string;
  narrativeBeats: string[];
}

export interface QuestlineTemplate {
  id: string;
  title: string;
  antagonist: string;
  setting: string;
  /** Tags every option in this questline should resonate with (content lint checks overlap). */
  themeTags: string[];
  /**
   * The boss quest the whole line trains for, expressed as the final long session.
   * The planner scales it down if the player can't safely reach it in the chosen length.
   */
  bossDemand: { archetype: string; minutes: number };
  /** Strength sessions per week by level. */
  strengthPerWeek: { novice: number; trained: number };
  /** Add a mobility session every N weeks (1 = every week). */
  mobilityEveryWeeks: number;
  acts: [ActDef, ActDef, ActDef];
  /** Abilities the boss fight is designed around; must be grantable by the line's archetypes. */
  bossMechanics: string[];
}

export interface ContentRegistry {
  version: string;
  archetypes: Record<string, ArchetypeDef>;
  routines: Record<string, RoutineDef>;
  questlines: Record<string, QuestlineTemplate>;
  abilities: Record<string, AbilityDef>;
  bosses: Record<string, BossDef>;
  maintenance: MaintenanceBountyDef[];
  classes: Record<ClassId, ClassDef>;
  sharedGrammar: Grammar;
  questlineGrammar: Record<string, Grammar>;
  familyOf: (activity: ActivityType) => Family;
}
