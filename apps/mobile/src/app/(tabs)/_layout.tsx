import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useGame } from "../../game/store";
import { color, font } from "../../ui/theme";

const ICON: Record<string, string> = { quests: "⚔", hero: "♜", chronicle: "✎", camp: "⌂" };

export default function TabsLayout() {
  const hasHero = useGame((s) => s.state.character !== null);
  if (!hasHero) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: color.parchmentDeep },
        headerTitleStyle: { fontFamily: font.display, color: color.ink },
        tabBarStyle: { backgroundColor: color.parchmentDeep, borderTopColor: color.line },
        tabBarActiveTintColor: color.ember,
        tabBarInactiveTintColor: color.inkSoft,
        tabBarLabelStyle: { fontFamily: font.displayRegular, fontSize: 11 },
        tabBarIcon: ({ color: c }) => <Text style={{ color: c, fontSize: 18 }}>{ICON[route.name] ?? "•"}</Text>,
      })}
    >
      <Tabs.Screen name="quests" options={{ title: "Quests" }} />
      <Tabs.Screen name="hero" options={{ title: "Hero" }} />
      <Tabs.Screen name="chronicle" options={{ title: "Chronicle" }} />
      <Tabs.Screen name="camp" options={{ title: "Camp" }} />
    </Tabs>
  );
}
