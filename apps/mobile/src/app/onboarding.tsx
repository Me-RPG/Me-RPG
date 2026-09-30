import { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { baselineFromOnboarding, type AgeBand, type SexForNorms } from "@healthrpg/fitness-model";
import { useGame } from "../game/store";
import { useAccount } from "../sync/account";
import { GameAsset } from "../ui/GameAsset";
import { Body, Button, Card, Chip, Label, Row, Screen, Title } from "../ui/components";
import { color, font, radius } from "../ui/theme";

const AGE_BANDS: AgeBand[] = ["18-29", "30-39", "40-49", "50-59", "60-69", "70+"];
const ACTIVITY: [number, string][] = [
  [0, "I avoid walking or exertion"],
  [1, "Light activity only"],
  [2, "10–60 min of moderate activity a week"],
  [3, "Over an hour of moderate activity a week"],
  [4, "Under 30 min of vigorous activity a week"],
  [5, "30–60 min vigorous a week"],
  [6, "1–3 hours vigorous a week"],
  [7, "Over 3 hours vigorous a week"],
];

/** Low-intrusion onboarding (research/r5): no weight, height or location. Safety screen is a v2 feature. */
export default function Onboarding() {
  const dispatch = useGame((s) => s.dispatch);
  const accountsOn = useAccount((s) => s.status !== "unconfigured");
  const [name, setName] = useState("");
  const [age, setAge] = useState<AgeBand>("30-39");
  const [sex, setSex] = useState<SexForNorms>("unspecified");
  const [rating, setRating] = useState(2);
  const [strength, setStrength] = useState<0 | 1 | 2 | 3>(0);
  const [toes, setToes] = useState(false);
  const [floor, setFloor] = useState(false);

  const begin = () => {
    const baseline = baselineFromOnboarding({ ageBand: age, sex, activityRating: rating, strengthDaysPerWeek: strength, canTouchToes: toes, canRiseFromFloorWithoutHands: floor });
    const userId = `local-${Date.now().toString(36)}`;
    if (dispatch({ type: "CharacterCreated", userId, name: name.trim() || "Aldric", baseline })) router.replace("/quests");
  };

  return (
    <Screen>
      <Row style={{ justifyContent: "center" }}><GameAsset id="ui.crest" width={88} showLabel={false} /></Row>
      <Title size={26} style={{ textAlign: "center" }}>A new hero arrives</Title>
      <Card tone="deep">
        <Body muted italic>
          Nothing here is medical advice. If you have a medical condition, are pregnant, or feel unwell during exercise, talk to a health professional and go gently.
        </Body>
      </Card>

      <Card>
        <Label>Your hero's name</Label>
        <TextInput testID="name" value={name} onChangeText={setName} placeholder="Aldric" placeholderTextColor={color.inkMuted} style={styles.input} />
      </Card>

      <Card>
        <Label>Age band</Label>
        <Row wrap>{AGE_BANDS.map((b) => <Chip key={b} text={b} active={age === b} onPress={() => setAge(b)} />)}</Row>
        <Label>For comparison tables only</Label>
        <Row wrap>
          {(["female", "male", "unspecified"] as SexForNorms[]).map((s) => (
            <Chip key={s} text={s === "unspecified" ? "Prefer not to say" : s[0]!.toUpperCase() + s.slice(1)} active={sex === s} onPress={() => setSex(s)} />
          ))}
        </Row>
      </Card>

      <Card>
        <Label>In a usual week…</Label>
        {ACTIVITY.map(([v, text]) => <Chip key={v} testID={`activity-${v}`} text={text} active={rating === v} onPress={() => setRating(v)} />)}
      </Card>

      <Card>
        <Label>Strength-training days per week</Label>
        <Row wrap>{([0, 1, 2, 3] as const).map((n) => <Chip key={n} text={n === 3 ? "3+" : String(n)} active={strength === n} onPress={() => setStrength(n)} />)}</Row>
        <Label>I can…</Label>
        <Row wrap>
          <Chip text="Touch my toes" active={toes} onPress={() => setToes(!toes)} />
          <Chip text="Get up from the floor without hands" active={floor} onPress={() => setFloor(!floor)} />
        </Row>
      </Card>

      <Button testID="begin" title="Begin the journey" onPress={begin} />
      {accountsOn ? <Button kind="secondary" testID="restore" title="Already have a hero? Sign in" onPress={() => router.push("/account")} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: font.body, fontSize: 18, color: color.ink, borderWidth: 1, borderColor: color.line, borderRadius: radius.sm, padding: 10, backgroundColor: color.parchment },
});
