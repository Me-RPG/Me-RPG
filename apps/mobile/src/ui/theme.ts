/**
 * Design tokens: a medieval palette of parchment, iron, ember and forest.
 * Screens use these roles, never raw hex, so real art direction can re-skin
 * the whole app in one place.
 */
export const color = {
  parchment: "#f3e7cc",
  parchmentDeep: "#e8d6ae",
  vellum: "#fbf5e6",
  ink: "#2b2118",
  inkSoft: "#5b4a38",
  inkMuted: "#8a7760",
  iron: "#4a4f57",
  ironDark: "#2c3036",
  ember: "#b5432a",
  emberSoft: "#e3a07d",
  forest: "#2f5d3a",
  forestSoft: "#9cbf95",
  gold: "#b8923a",
  goldSoft: "#e6cf8f",
  sky: "#3d6a8a",
  line: "#cdb88c",
  danger: "#9b2c22",
} as const;

/** Class colours: identity only, used alongside the class name, never alone. */
export const classColor = { ranger: color.forest, berserker: color.ember, warrior: color.sky } as const;

export const font = {
  display: "Cinzel_700Bold",
  displayRegular: "Cinzel_400Regular",
  body: "EBGaramond_400Regular",
  bodyItalic: "EBGaramond_400Regular_Italic",
  bodyBold: "EBGaramond_600SemiBold",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 6, md: 10, lg: 16 } as const;
