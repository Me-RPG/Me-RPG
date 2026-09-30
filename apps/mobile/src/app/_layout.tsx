import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Cinzel_400Regular, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold } from "@expo-google-fonts/eb-garamond";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useGame } from "../game/store";
import { color, font } from "../ui/theme";
import { Body, Button, Card, Screen, Title } from "../ui/components";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Cinzel_400Regular, Cinzel_700Bold, EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold });
  const status = useGame((s) => s.status);
  const hydrate = useGame((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!fontsLoaded || status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.parchment }}>
        <ActivityIndicator color={color.ember} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {status === "incompatible" ? <IncompatibleSave /> : (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: color.parchmentDeep },
            headerTintColor: color.ink,
            headerTitleStyle: { fontFamily: font.display },
            contentStyle: { backgroundColor: color.parchment },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="log" options={{ presentation: "modal", title: "Log a workout" }} />
          <Stack.Screen name="start" options={{ presentation: "modal", title: "Choose your quest" }} />
          <Stack.Screen name="battle/[id]" options={{ title: "Battle", headerBackVisible: false, gestureEnabled: false }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}

function IncompatibleSave() {
  const reason = useGame((s) => s.incompatibleReason);
  const reset = useGame((s) => s.resetSave);
  return (
    <Screen>
      <Title>This save can't be loaded</Title>
      <Card>
        <Body>Your saved journey was recorded under an older version of the game's rules and can't be replayed with this version.</Body>
        <Body muted>{reason}</Body>
      </Card>
      <Button title="Start a new journey" kind="danger" onPress={() => void reset()} />
    </Screen>
  );
}
