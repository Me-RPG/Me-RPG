import type { Family } from "./types.js";

/**
 * Battle abilities. Each is earned by training, either by completing a quest
 * (ArchetypeDef.grantsAbilities) or by reaching a class level (classes.ts), so
 * the boss fight is literally built from the workouts the player did.
 * Effects are implemented in the engine (battle/battle.ts) by id.
 */
export interface AbilityDef {
  id: string;
  name: string;
  /** Actives are battle actions; passives apply automatically for the whole fight. */
  kind: "active" | "passive";
  /** What the player learns, in fiction and in mechanics. */
  description: string;
  staminaCost: number;
  /** Turns before it can be used again (0 = every turn). */
  cooldown: number;
  /** Usable at most once per battle. */
  oncePerBattle: boolean;
  /** Line shown when used. {hero}, {boss} are filled in. */
  text: string;
  /**
   * After a quest unlocks it, any session like this trains the skill further
   * (rank up) and keeps it sharp. Skills persist across questlines.
   */
  trainedBy: { families: Family[]; minMinutes: number; minClimbM?: number };
  /** How rank shows up in battle, for the player. */
  rankEffect: string;
}

export const ABILITIES: Record<string, AbilityDef> = {
  heavy_strike: {
    id: "heavy_strike",
    name: "Heavy Strike",
    kind: "active",
    description: "Forged at the anvil: a blow with twice the force. (Earned from strength quests.)",
    staminaCost: 4,
    cooldown: 1,
    oncePerBattle: false,
    text: "{hero} plants their feet and brings the blade down with the weight of every session at the forge.",
    trainedBy: { families: ["strength"], minMinutes: 15 },
    rankEffect: "Each rank adds 10% to the blow.",
  },
  shield_wall: {
    id: "shield_wall",
    name: "Shield Wall",
    kind: "active",
    description: "Braced and unshakeable: blocks the next attack completely. (Earned from strength quests.)",
    staminaCost: 3,
    cooldown: 3,
    oncePerBattle: false,
    text: "{hero} raises the shield and sets their stance; the ground itself seems to hold them.",
    trainedBy: { families: ["strength"], minMinutes: 15 },
    rankEffect: "Higher ranks also restore a little stamina when a blow is blocked.",
  },
  second_wind: {
    id: "second_wind",
    name: "Second Wind",
    kind: "active",
    description: "The long roads taught you to keep going: recover health and all stamina, once. (Earned from long walks and journeys.)",
    staminaCost: 0,
    cooldown: 0,
    oncePerBattle: true,
    text: "{hero} breathes the way the long road taught them. Strength returns to tired legs.",
    trainedBy: { families: ["foot", "cycle", "water"], minMinutes: 20 },
    rankEffect: "Each rank restores 10% more.",
  },
  terrain_knowledge: {
    id: "terrain_knowledge",
    name: "Terrain Knowledge",
    kind: "active",
    description: "You walked these slopes: slip clear of the next great attack and strike from high ground. (Earned from journey hikes.)",
    staminaCost: 2,
    cooldown: 2,
    oncePerBattle: false,
    text: "{hero} remembers every ridge and switchback of the climb and moves to the high ground.",
    trainedBy: { families: ["foot"], minMinutes: 20, minClimbM: 50 },
    rankEffect: "Each rank strengthens the strike from high ground.",
  },
  evade: {
    id: "evade",
    name: "Evade",
    kind: "active",
    description: "Loose and quick: the next attack only grazes you. (Earned from mobility quests.)",
    staminaCost: 2,
    cooldown: 1,
    oncePerBattle: false,
    text: "{hero} rolls low and light, supple as the Shrine taught.",
    trainedBy: { families: ["mobility"], minMinutes: 10 },
    rankEffect: "Higher ranks turn more grazes into clean misses.",
  },
  stamina_surge: {
    id: "stamina_surge",
    name: "Stamina Surge",
    kind: "active",
    description: "Hard efforts paid off: strike twice in one breath. (Earned from hard and Gauntlet quests, or on the Warrior tree.)",
    staminaCost: 3,
    cooldown: 2,
    oncePerBattle: false,
    text: "{hero} surges forward, faster than anything expects.",
    trainedBy: { families: ["conditioning", "foot"], minMinutes: 10 },
    rankEffect: "Each rank adds force to both strikes.",
  },
  // ---------------------------------------------------------------- class skill trees
  fleet_foot: {
    id: "fleet_foot", name: "Fleet Foot", kind: "passive",
    description: "Ranger: miles in the legs mean more to give. More stamina, and a chance to slip half of any blow.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "{hero} moves with the easy rhythm of the long road.",
    trainedBy: { families: ["foot", "cycle", "water"], minMinutes: 20 },
    rankEffect: "Each rank adds stamina.",
  },
  hunters_mark: {
    id: "hunters_mark", name: "Hunter's Mark", kind: "active",
    description: "Ranger: read the quarry's rhythm; your next two attacks are far more likely to be critical.",
    staminaCost: 3, cooldown: 3, oncePerBattle: false,
    text: "{hero} watches, waits, and marks the weak point.",
    trainedBy: { families: ["foot", "cycle", "water"], minMinutes: 30 },
    rankEffect: "Each rank sharpens the mark.",
  },
  long_road: {
    id: "long_road", name: "The Long Road", kind: "passive",
    description: "Ranger mastery: Second Wind can be called on twice in a fight.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "{hero} has walked farther than this fight will ever ask.",
    trainedBy: { families: ["foot", "cycle", "water"], minMinutes: 45 },
    rankEffect: "Higher ranks strengthen the second Second Wind.",
  },
  iron_hide: {
    id: "iron_hide", name: "Iron Hide", kind: "passive",
    description: "Berserker: heavy iron builds a heavy frame. Every blow against you lands softer.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "Blows glance off {hero} like hail off a roof.",
    trainedBy: { families: ["strength"], minMinutes: 20 },
    rankEffect: "Each rank turns aside more of every blow.",
  },
  rage: {
    id: "rage", name: "Rage", kind: "active",
    description: "Berserker: roar into a fury for three turns. The more you are hurt, the harder you hit.",
    staminaCost: 2, cooldown: 4, oncePerBattle: false,
    text: "{hero} roars, and pain turns to fury.",
    trainedBy: { families: ["strength"], minMinutes: 30 },
    rankEffect: "Each rank deepens the fury.",
  },
  crushing_blow: {
    id: "crushing_blow", name: "Crushing Blow", kind: "active",
    description: "Berserker: everything behind one swing. Triple force, heavy stamina cost.",
    staminaCost: 6, cooldown: 3, oncePerBattle: false,
    text: "{hero} winds up with a roar and brings everything down at once.",
    trainedBy: { families: ["strength"], minMinutes: 30 },
    rankEffect: "Each rank adds to the blow.",
  },
  bloodlust: {
    id: "bloodlust", name: "Bloodlust", kind: "passive",
    description: "Berserker mastery: every critical blow restores your health.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "Each great blow fills {hero} with new strength.",
    trainedBy: { families: ["strength"], minMinutes: 45 },
    rankEffect: "Each rank restores more.",
  },
  endure: {
    id: "endure", name: "Endure", kind: "passive",
    description: "Warrior: rep after rep has made you hard to put down. More health in every fight.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "{hero} has outlasted worse than this.",
    trainedBy: { families: ["conditioning", "strength", "water"], minMinutes: 20 },
    rankEffect: "Each rank adds health.",
  },
  rally: {
    id: "rally", name: "Rally", kind: "active",
    description: "Warrior: dig in, catch your breath and fight on. Restores some health and stamina.",
    staminaCost: 0, cooldown: 3, oncePerBattle: false,
    text: "{hero} plants their feet, breathes, and squares up again.",
    trainedBy: { families: ["conditioning", "strength", "water"], minMinutes: 30 },
    rankEffect: "Each rank restores more.",
  },
  unbroken: {
    id: "unbroken", name: "Unbroken", kind: "passive",
    description: "Warrior mastery: guarding, grazing and bracing all shed far more of every blow.",
    staminaCost: 0, cooldown: 0, oncePerBattle: false,
    text: "Nothing gets through {hero}'s guard cleanly.",
    trainedBy: { families: ["conditioning", "strength", "water"], minMinutes: 45 },
    rankEffect: "Higher ranks shed more.",
  },
};
