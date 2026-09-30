import type { Capacity } from "@me-rpg/fitness-model";

/**
 * Classes follow fitness styles, not a definition of "healthy". They are
 * non-exclusive: every session feeds the classes its style belongs to
 * (CLASS_AFFINITY), with XP mostly from time spent, not intensity, so a specialist rises fast in one class while an
 * all-rounder climbs all three more slowly. No class or mix is favored.
 */
export type ClassId = "ranger" | "berserker" | "warrior";

export interface SkillNode {
  abilityId: string;
  /** Class level at which this skill unlocks. */
  level: number;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  /** The fitness style it represents, in plain words. */
  style: string;
  /** The capacity this style mainly builds (descriptive; XP comes from CLASS_AFFINITY). */
  capacity: Capacity;
  description: string;
  /** Unlock order; each node also needs the one before it. */
  tree: SkillNode[];
  /**
   * How a questline started with this focus leans: the steady sessions it
   * prefers, and strength sessions added or removed per week (never below 1,
   * never breaking the session budget or R3 caps).
   */
  focus: { steadyArchetype: string; extraStrength: number };
}

export const CLASSES: Record<ClassId, ClassDef> = {
  ranger: {
    id: "ranger",
    name: "Ranger",
    style: "cardio: walking, hiking, running, cycling, swimming",
    capacity: "aerobic",
    description: "Wardens of the long road. Rangers outlast and outmanoeuvre, and strike when the moment is right.",
    tree: [
      { abilityId: "second_wind", level: 1 },
      { abilityId: "fleet_foot", level: 2 },
      { abilityId: "terrain_knowledge", level: 4 },
      { abilityId: "hunters_mark", level: 6 },
      { abilityId: "long_road", level: 8 },
    ],
    focus: { steadyArchetype: "steady_foot", extraStrength: -1 },
  },
  berserker: {
    id: "berserker",
    name: "Berserker",
    style: "lifting: heavy strength training",
    capacity: "muscular_strength",
    description: "Iron-forged and fearless. Berserkers hit hardest, and hit harder still when hurt.",
    tree: [
      { abilityId: "heavy_strike", level: 1 },
      { abilityId: "iron_hide", level: 2 },
      { abilityId: "rage", level: 4 },
      { abilityId: "crushing_blow", level: 6 },
      { abilityId: "bloodlust", level: 8 },
    ],
    focus: { steadyArchetype: "steady_foot", extraStrength: 1 },
  },
  warrior: {
    id: "warrior",
    name: "Warrior",
    style: "endurance: circuits, bodyweight work, rowing, long efforts under load",
    capacity: "muscular_endurance",
    description: "Shield-bearers who never break. Warriors guard, endure and keep coming.",
    tree: [
      { abilityId: "shield_wall", level: 1 },
      { abilityId: "endure", level: 2 },
      { abilityId: "stamina_surge", level: 4 },
      { abilityId: "rally", level: 6 },
      { abilityId: "unbroken", level: 8 },
    ],
    focus: { steadyArchetype: "conditioning_session", extraStrength: 0 },
  },
};

/** XP per class level: level = 1 + floor(sqrt(xp / CLASS_XP_SCALE)) (design; tuned in the balance sim). */
export const CLASS_XP_SCALE = 200;

type Affinity = Partial<Record<ClassId, number>>;

/**
 * Which class a session feeds, by activity (weights sum to 1). This is a plain
 * style mapping players can read ("lifting -> Berserker"), not a judgment of
 * which activity is better. Mobility work feeds no class; it trains shared
 * skills (Evade). Unlisted activities fall back to their family.
 */
export const CLASS_AFFINITY: Record<string, Affinity> = {
  resistance_training: { berserker: 1 },
  calisthenics: { warrior: 0.7, berserker: 0.3 },
  circuit_training: { warrior: 1 },
  hiit: { warrior: 0.7, ranger: 0.3 },
  aerobics_class: { ranger: 0.5, warrior: 0.5 },
  rowing: { warrior: 0.6, ranger: 0.4 },
  paddle: { warrior: 0.5, ranger: 0.5 },
  hike_loaded: { ranger: 0.5, warrior: 0.5 },
  stair_climb: { ranger: 0.5, warrior: 0.5 },
  climbing: { warrior: 0.5, berserker: 0.5 },
  combat_sport: { warrior: 0.5, berserker: 0.3, ranger: 0.2 },
  team_field_sport: { ranger: 0.6, warrior: 0.4 },
  basketball: { ranger: 0.6, warrior: 0.4 },
  soccer: { ranger: 0.7, warrior: 0.3 },
  alpine_ski_snowboard: { warrior: 0.6, ranger: 0.4 },
  surf_watersport: { warrior: 0.6, ranger: 0.4 },
  skating: { ranger: 0.6, warrior: 0.4 },
  cycle_mountain: { ranger: 0.7, warrior: 0.3 },
  other_workout: { warrior: 0.4, ranger: 0.3, berserker: 0.3 },
};

const FAMILY_AFFINITY: Record<string, Affinity> = {
  foot: { ranger: 1 },
  cycle: { ranger: 1 },
  water: { ranger: 1 },
  strength: { berserker: 1 },
  conditioning: { warrior: 1 },
  mobility: {},
  other: { ranger: 0.34, warrior: 0.33, berserker: 0.33 },
};

export function classAffinity(activity: string, family: string): Affinity {
  return CLASS_AFFINITY[activity] ?? FAMILY_AFFINITY[family] ?? {};
}
