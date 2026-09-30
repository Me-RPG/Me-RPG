import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { color, font, radius, space } from "./theme";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView> : <View style={styles.scroll}>{children}</View>}
    </SafeAreaView>
  );
}

export function Card({ children, style, tone = "vellum" }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: "vellum" | "deep" | "iron" }) {
  return <View style={[styles.card, tone === "deep" && styles.cardDeep, tone === "iron" && styles.cardIron, style]}>{children}</View>;
}

export function Title({ children, size = 22, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text accessibilityRole="header" style={[styles.title, { fontSize: size }, style]}>{children}</Text>;
}

export function Body({ children, muted, italic, style }: { children: ReactNode; muted?: boolean; italic?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, muted && { color: color.inkSoft }, italic && { fontFamily: font.bodyItalic }, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Button({
  title, onPress, kind = "primary", disabled, testID, small,
}: { title: string; onPress: () => void; kind?: "primary" | "secondary" | "danger"; disabled?: boolean; testID?: string; small?: boolean }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        kind === "secondary" && styles.buttonSecondary,
        kind === "danger" && styles.buttonDanger,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.buttonText, small && { fontSize: 14 }, kind === "secondary" && { color: color.ink }]}>{title}</Text>
    </Pressable>
  );
}

/** A horizontal meter. The value is always printed beside it, so the bar never carries meaning alone. */
export function Meter({ label, value, max, tint = color.forest, note }: { label: string; value: number; max: number; tint?: string; note?: string }) {
  const frac = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={styles.meterRow} accessibilityLabel={`${label} ${Math.round(value)}${note ? `, ${note}` : ""}`}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${frac * 100}%`, backgroundColor: tint }]} />
      </View>
      <Text style={styles.meterValue}>{Math.round(value)}</Text>
      {note ? <Text style={styles.meterNote}>{note}</Text> : null}
    </View>
  );
}

export function Chip({ text, active, onPress, testID }: { text: string; active?: boolean; onPress?: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: color.vellum }]}>{text}</Text>
    </Pressable>
  );
}

export function Row({ children, gap = space.sm, wrap, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, wrap && { flexWrap: "wrap" }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.parchment },
  scroll: { padding: space.lg, gap: space.md, paddingBottom: 48, maxWidth: 720, width: "100%", alignSelf: "center" },
  card: { backgroundColor: color.vellum, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: space.lg, gap: space.sm },
  cardDeep: { backgroundColor: color.parchmentDeep },
  cardIron: { backgroundColor: color.ironDark, borderColor: color.iron },
  title: { fontFamily: font.display, color: color.ink, letterSpacing: 0.5 },
  body: { fontFamily: font.body, fontSize: 17, lineHeight: 24, color: color.ink },
  label: { fontFamily: font.displayRegular, fontSize: 12, letterSpacing: 1.2, color: color.inkSoft, textTransform: "uppercase" },
  button: { backgroundColor: color.ember, borderRadius: radius.sm, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", minHeight: 44, justifyContent: "center" },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
  buttonSecondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color.inkSoft },
  buttonDanger: { backgroundColor: color.danger },
  buttonText: { fontFamily: font.display, color: color.vellum, fontSize: 16, letterSpacing: 0.5 },
  meterRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  meterLabel: { fontFamily: font.display, fontSize: 14, width: 42, color: color.ink },
  meterTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: color.parchmentDeep, overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: 5 },
  meterValue: { fontFamily: font.bodyBold, fontSize: 16, width: 32, textAlign: "right", color: color.ink },
  meterNote: { fontFamily: font.body, fontSize: 13, color: color.inkSoft, width: 90 },
  chip: { borderWidth: 1.5, borderColor: color.inkSoft, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, minHeight: 36, justifyContent: "center" },
  chipActive: { backgroundColor: color.ink, borderColor: color.ink },
  chipText: { fontFamily: font.body, fontSize: 15, color: color.ink },
  divider: { height: 1, backgroundColor: color.line, marginVertical: space.xs },
});
