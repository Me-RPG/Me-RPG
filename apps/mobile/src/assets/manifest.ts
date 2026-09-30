import type { ImageSourcePropType } from "react-native";

/**
 * Art manifest. Every visual in the game is referenced by key. A key mapped to
 * `null` renders as a labelled placeholder (see GameAsset), so real art drops in
 * by adding the file and replacing `null` with `require("../../assets/art/...")`.
 * No screen code changes.
 */
export type AssetCategory = "boss" | "portrait" | "class" | "quest" | "scene" | "ui";

export interface AssetEntry {
  category: AssetCategory;
  label: string;
  source: ImageSourcePropType | null;
}

const e = (category: AssetCategory, label: string): AssetEntry => ({ category, label, source: null });

export const ASSETS = {
  "boss.dragon_of_ashpeak": e("boss", "Vorthax the Cinder-Wyrm"),
  "boss.wolves_of_greywood": e("boss", "The Pale Alpha"),
  "scene.dragon_of_ashpeak": e("scene", "Ashpeak"),
  "scene.wolves_of_greywood": e("scene", "The Greywood"),
  "portrait.hero": e("portrait", "Your hero"),
  "class.ranger": e("class", "Ranger"),
  "class.berserker": e("class", "Berserker"),
  "class.warrior": e("class", "Warrior"),
  "quest.long_walk": e("quest", "The Long Road"),
  "quest.journey_hike": e("quest", "The Journey"),
  "quest.steady_foot": e("quest", "Patrol"),
  "quest.steady_cross": e("quest", "Cross-Training"),
  "quest.tempo_foot": e("quest", "The Chase"),
  "quest.strength_session": e("quest", "At the Forge"),
  "quest.conditioning_session": e("quest", "The Gauntlet"),
  "quest.mobility_session": e("quest", "At the Shrine"),
  "scene.camp": e("scene", "The Inn at Camp"),
  "ui.crest": e("ui", "Me RPG"),
} as const satisfies Record<string, AssetEntry>;

export type AssetId = keyof typeof ASSETS;

export function assetFor(id: string): AssetEntry {
  return (ASSETS as Record<string, AssetEntry>)[id] ?? e("ui", id);
}
