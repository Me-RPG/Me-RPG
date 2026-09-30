import type { QuestlineTemplate } from "../types.js";

export const DRAGON_OF_ASHPEAK: QuestlineTemplate = {
  id: "dragon_of_ashpeak",
  title: "The Dragon of Ashpeak",
  antagonist: "Vorthax the Cinder-Wyrm",
  setting: "Emberford",
  themeTags: ["forge", "mountain", "road", "trail", "village", "journey", "shield"],
  // The climb to the lair: a long hike with real elevation. Scaled to what the player can safely reach.
  bossDemand: { archetype: "journey_hike", minutes: 180 },
  strengthPerWeek: { novice: 1, trained: 2 },
  mobilityEveryWeeks: 2,
  bossMechanics: ["heavy_strike", "shield_wall", "second_wind", "terrain_knowledge"],
  acts: [
    {
      name: "training",
      title: "The Smith's Yard",
      longArchetype: "long_walk",
      steadyPool: [["steady_foot", 3], ["steady_cross", 1]],
      hardArchetype: "tempo_foot",
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["ash_on_the_wind", "the_smiths_offer", "forging_the_blade"],
    },
    {
      name: "journey",
      title: "The Road to Ashpeak",
      longArchetype: "journey_hike",
      steadyPool: [["steady_foot", 2], ["steady_cross", 1]],
      hardArchetype: "tempo_foot",
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["leaving_emberford", "the_burnt_bridge", "the_hermits_map"],
    },
    {
      name: "confrontation",
      title: "The Cinder Lair",
      longArchetype: "journey_hike",
      steadyPool: [["steady_foot", 1]],
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["the_final_ascent", "the_lair_mouth"],
    },
  ],
};
