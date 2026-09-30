import { ABILITIES } from "./abilities.js";
import { ARCHETYPES } from "./archetypes.js";
import { BOSSES } from "./bosses.js";
import { CLASSES } from "./classes.js";
import { MAINTENANCE_BOUNTIES } from "./maintenance.js";
import { QUESTLINE_GRAMMAR, SHARED_GRAMMAR } from "./narrative.js";
import { familyOf } from "./families.js";
import { DRAGON_OF_ASHPEAK } from "./questlines/dragon-of-ashpeak.js";
import { WOLVES_OF_GREYWOOD } from "./questlines/wolves-of-greywood.js";
import { ROUTINES } from "./routines.js";
import type { ContentRegistry } from "./types.js";

export * from "./types.js";
export type { AbilityDef } from "./abilities.js";
export type { BossAttack, BossDef, VictoryGrade } from "./bosses.js";
export type { Grammar } from "./narrative.js";
export type { MaintenanceBountyDef } from "./maintenance.js";
export type { ClassDef, ClassId, SkillNode } from "./classes.js";
export { CLASS_AFFINITY, CLASS_XP_SCALE, classAffinity } from "./classes.js";
export { familyOf } from "./families.js";
export { scaledRoutine } from "./routines.js";
export { lintContent } from "./lint.js";

export const DEFAULT_CONTENT: ContentRegistry = {
  version: "0.1.0",
  archetypes: ARCHETYPES,
  routines: ROUTINES,
  questlines: {
    [DRAGON_OF_ASHPEAK.id]: DRAGON_OF_ASHPEAK,
    [WOLVES_OF_GREYWOOD.id]: WOLVES_OF_GREYWOOD,
  },
  abilities: ABILITIES,
  bosses: BOSSES,
  maintenance: MAINTENANCE_BOUNTIES,
  classes: CLASSES,
  sharedGrammar: SHARED_GRAMMAR,
  questlineGrammar: QUESTLINE_GRAMMAR,
  familyOf,
};
