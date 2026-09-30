import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { QUICK_ACTIVITIES } from "../game/selectors";
import { useGame } from "../game/store";
import { Body, Button, Card, Chip, Label, Row, Screen } from "../ui/components";
import { color, font, radius } from "../ui/theme";

/** Manual workout entry. Provider imports (Phase 7) will produce the same ActivityLogged event. */
export default function LogWorkout() {
  const dispatch = useGame((s) => s.dispatch);
  const seq = useGame((s) => s.state.seq);
  const [type, setType] = useState("walk");
  const [minutes, setMinutes] = useState("30");
  const [climb, setClimb] = useState("");
  const [km, setKm] = useState("");
  const [rpe, setRpe] = useState<number | null>(null);
  const mins = Number(minutes);
  const valid = Number.isFinite(mins) && mins >= 3;

  const save = () => {
    const activity: Record<string, unknown> = { type, durationMin: mins };
    if (Number(climb) > 0) activity.elevGainM = Number(climb);
    if (Number(km) > 0) activity.distanceM = Number(km) * 1000;
    if (rpe !== null) activity.rpe = rpe;
    if (dispatch({ type: "ActivityLogged", activityId: `m${seq + 1}-${Date.now().toString(36)}`, source: "manual", activity })) router.back();
  };

  return (
    <Screen>
      <Card>
        <Label>What did you do?</Label>
        <Row wrap>{QUICK_ACTIVITIES.map((a) => <Chip key={a.id} testID={`act-${a.id}`} text={a.label} active={type === a.id} onPress={() => setType(a.id)} />)}</Row>
      </Card>
      <Card>
        <Row>
          <Field label="Minutes" value={minutes} onChange={setMinutes} testID="minutes" />
          <Field label="Climb (m)" value={climb} onChange={setClimb} placeholder="optional" />
          <Field label="Distance (km)" value={km} onChange={setKm} placeholder="optional" />
        </Row>
        <Label>How hard did it feel? (optional)</Label>
        <Row wrap>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <Chip key={n} text={String(n)} active={rpe === n} onPress={() => setRpe(rpe === n ? null : n)} />)}
        </Row>
        <Body muted>1 is barely any effort, 5 is hard, 10 is everything you had.</Body>
      </Card>
      <Button testID="save-workout" title="Record it" disabled={!valid} onPress={save} />
    </Screen>
  );
}

function Field({ label, value, onChange, placeholder, testID }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; testID?: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Label>{label}</Label>
      <TextInput testID={testID} value={value} onChangeText={onChange} keyboardType="numeric" placeholder={placeholder} placeholderTextColor={color.inkMuted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: font.body, fontSize: 18, color: color.ink, borderWidth: 1, borderColor: color.line, borderRadius: radius.sm, padding: 8, backgroundColor: color.parchment },
});
