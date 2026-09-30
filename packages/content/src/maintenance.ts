import type { ActivityType } from "@me-rpg/fitness-model";
import type { Family } from "./types.js";

/**
 * Twice-weekly maintenance bounties, available whether or not a questline is
 * active. Sized to the R1/R2 maintenance dose (about 2 aerobic sessions and
 * 1 strength session a week), so doing both keeps stats from atrophying and
 * keeps skills sharp. A third, optional bounty covers mobility.
 */
export interface MaintenanceBountyDef {
  id: string;
  title: string;
  description: string;
  families: Family[];
  /** Extra activities accepted outside the families above. */
  alsoAccepts: ActivityType[];
  minMinutes: number;
  optional: boolean;
  /** XP bonus the first time it is completed in a week. */
  bonusXp: number;
}

export const MAINTENANCE_BOUNTIES: MaintenanceBountyDef[] = [
  {
    id: "keep_the_road",
    title: "Keep the Road",
    description: "A 30-minute walk, hike or run. Keeps your endurance and Second Wind from fading.",
    families: ["foot"],
    alsoAccepts: [],
    minMinutes: 30,
    optional: false,
    bonusXp: 25,
  },
  {
    id: "keep_the_blade",
    title: "Keep the Blade",
    description: "A 30-minute strength or circuit session. Keeps your strength and your Heavy Strike and Shield Wall sharp.",
    families: ["strength"],
    alsoAccepts: ["circuit_training"],
    minMinutes: 30,
    optional: false,
    bonusXp: 25,
  },
  {
    id: "keep_supple",
    title: "Keep Supple (optional)",
    description: "15 minutes of stretching or yoga. Keeps Evade sharp.",
    families: ["mobility"],
    alsoAccepts: [],
    minMinutes: 15,
    optional: true,
    bonusXp: 10,
  },
];
