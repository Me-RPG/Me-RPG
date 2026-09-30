import type { QuestlineTemplate } from "../types.js";

export const WOLVES_OF_GREYWOOD: QuestlineTemplate = {
  id: "wolves_of_greywood",
  title: "The Wolves of Greywood",
  antagonist: "The Pale Alpha",
  setting: "Hollin",
  themeTags: ["village", "patrol", "forest", "road", "pursuit", "shield"],
  // Tracking the pack through the forest: a long patrol on foot.
  bossDemand: { archetype: "long_walk", minutes: 90 },
  strengthPerWeek: { novice: 1, trained: 1 },
  mobilityEveryWeeks: 1,
  bossMechanics: ["second_wind", "evade", "shield_wall"],
  acts: [
    {
      name: "training",
      title: "The Watch of Hollin",
      longArchetype: "long_walk",
      steadyPool: [["steady_foot", 1]],
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["howls_at_dusk", "joining_the_watch"],
    },
    {
      name: "journey",
      title: "Into the Greywood",
      longArchetype: "long_walk",
      steadyPool: [["steady_foot", 2], ["steady_cross", 1]],
      hardArchetype: "tempo_foot",
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["tracks_in_the_frost", "the_woodcutters_warning"],
    },
    {
      name: "confrontation",
      title: "The Den",
      longArchetype: "long_walk",
      steadyPool: [["steady_foot", 1]],
      strengthArchetype: "strength_session",
      mobilityArchetype: "mobility_session",
      narrativeBeats: ["the_den_in_the_hollow"],
    },
  ],
};
