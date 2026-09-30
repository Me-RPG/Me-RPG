import type { ActivityType } from "@me-rpg/fitness-model";
import type { Family } from "./types.js";

const FAMILY: Record<string, Family> = {
  walk: "foot",
  hike: "foot",
  hike_loaded: "foot",
  stair_climb: "foot",
  run: "foot",
  trail_run: "foot",
  snowshoe: "foot",
  cycle_road: "cycle",
  cycle_mountain: "cycle",
  cycle_stationary: "cycle",
  ebike: "cycle",
  swim: "water",
  rowing: "water",
  paddle: "water",
  resistance_training: "strength",
  calisthenics: "strength",
  yoga: "mobility",
  pilates: "mobility",
  stretching_mobility: "mobility",
  tai_chi: "mobility",
  circuit_training: "conditioning",
  hiit: "conditioning",
  aerobics_class: "conditioning",
  elliptical: "conditioning",
};

export function familyOf(activity: ActivityType): Family {
  return FAMILY[activity] ?? "other";
}
