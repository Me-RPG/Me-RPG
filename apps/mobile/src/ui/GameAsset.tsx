import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { assetFor, type AssetCategory } from "../assets/manifest";
import { color, font, radius } from "./theme";

/**
 * Renders the manifest's art for `id`, or a framed placeholder silhouette with
 * its label while art is pending. Placeholders are sized and tinted by category
 * so layouts read correctly before any real asset exists.
 */
export function GameAsset({ id, width = 96, height, showLabel = true }: { id: string; width?: number; height?: number; showLabel?: boolean }) {
  const entry = assetFor(id);
  const h = height ?? width;
  if (entry.source) {
    return <Image source={entry.source} style={{ width, height: h, borderRadius: radius.sm }} accessibilityLabel={entry.label} />;
  }
  const tint = TINT[entry.category];
  return (
    <View style={[styles.frame, { width, height: h, borderColor: tint }]} accessibilityLabel={`${entry.label} (placeholder art)`}>
      <Svg width="100%" height={showLabel ? "72%" : "100%"} viewBox="0 0 100 100">
        <Rect x="4" y="4" width="92" height="92" rx="8" fill={color.parchmentDeep} stroke={tint} strokeWidth="2" strokeDasharray="5 4" />
        <G fill={tint} opacity={0.85}>{SILHOUETTE[entry.category]}</G>
      </Svg>
      {showLabel ? <Text numberOfLines={2} style={[styles.label, { fontSize: width < 90 ? 10 : 12 }]}>{entry.label}</Text> : null}
    </View>
  );
}

const TINT: Record<AssetCategory, string> = {
  boss: color.ember,
  portrait: color.gold,
  class: color.forest,
  quest: color.iron,
  scene: color.sky,
  ui: color.inkSoft,
};

// Simple abstract silhouettes: readable at a glance, obviously placeholders.
const SILHOUETTE: Record<AssetCategory, React.ReactNode> = {
  boss: (
    <>
      <Path d="M20 72 L32 40 L42 56 L50 26 L58 56 L68 40 L80 72 Z" />
      <Circle cx="42" cy="62" r="3" fill={color.parchment} />
      <Circle cx="58" cy="62" r="3" fill={color.parchment} />
    </>
  ),
  portrait: (
    <>
      <Circle cx="50" cy="38" r="14" />
      <Path d="M24 82 Q50 50 76 82 Z" />
    </>
  ),
  class: <Path d="M50 18 L78 28 L74 60 Q66 78 50 86 Q34 78 26 60 L22 28 Z" />,
  quest: (
    <>
      <Path d="M28 22 H72 V78 H28 Z" opacity={0.35} />
      <Path d="M34 34 H66 M34 46 H66 M34 58 H56" stroke={color.parchment} strokeWidth="5" />
    </>
  ),
  scene: <Path d="M8 80 L34 42 L48 60 L64 34 L92 80 Z" />,
  ui: <Circle cx="50" cy="50" r="24" />,
};

const styles = StyleSheet.create({
  frame: { borderRadius: radius.sm, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.vellum, overflow: "hidden", padding: 2 },
  label: { fontFamily: font.displayRegular, color: color.inkSoft, textAlign: "center", paddingHorizontal: 4 },
});
