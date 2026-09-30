import { useState } from "react";
import { View } from "react-native";
import { heroSheet } from "../../game/selectors";
import { today, useGame } from "../../game/store";
import { GameAsset } from "../../ui/GameAsset";
import { Body, Button, Card, Label, Row, Screen, Title } from "../../ui/components";

const CONNECTIONS = [
  { id: "healthkit", name: "Apple Health", note: "Planned (Phase 7): import workouts from your iPhone and watch." },
  { id: "health_connect", name: "Health Connect", note: "Planned (Phase 7): import workouts on Android." },
  { id: "strava", name: "Strava", note: "Planned (Phase 8), subject to Strava's API terms." },
];

export default function Camp() {
  const state = useGame((s) => s.state);
  const dispatch = useGame((s) => s.dispatch);
  const resetSave = useGame((s) => s.resetSave);
  const [confirmReset, setConfirmReset] = useState(false);
  const st = heroSheet(state);
  const day = today(state);

  return (
    <Screen>
      <Card>
        <Row style={{ alignItems: "flex-start" }}>
          <GameAsset id="scene.camp" width={84} />
          <View style={{ flex: 1, gap: 4 }}>
            <Title size={18}>The Inn</Title>
            <Body muted>Rest is part of training. Resting never costs you anything, and resting after hard days leaves you Well-Rested.</Body>
          </View>
        </Row>
        <Button testID="rest" title={st.wellRested ? "Rested (Well-Rested)" : "Rest today"} onPress={() => dispatch({ type: "RestDeclared" })} />
      </Card>

      <Card>
        <Title size={18}>Sanctuary</Title>
        <Body muted>Unwell, injured, or life got heavy? Sanctuary pauses stat fading and quest deadlines until you return.</Body>
        {st.inSanctuary
          ? <Button testID="leave-sanctuary" title="Leave the Sanctuary" onPress={() => dispatch({ type: "SanctuaryExited" })} />
          : <Button testID="enter-sanctuary" kind="secondary" title="Enter the Sanctuary" onPress={() => dispatch({ type: "SanctuaryEntered", reason: "other" })} />}
      </Card>

      <Card>
        <Title size={18}>Connections</Title>
        {CONNECTIONS.map((c) => (
          <View key={c.id} style={{ gap: 2 }}>
            <Body>{c.name}</Body>
            <Body muted>{c.note}</Body>
          </View>
        ))}
      </Card>

      <Card tone="deep">
        <Label>Prototype tools</Label>
        <Body muted>Day {day - (state.character?.createdDay ?? day) + 1} of your journey. Let time pass to test quests, rest and fading without waiting.</Body>
        <Row>
          <View style={{ flex: 1 }}><Button small kind="secondary" testID="wait-1" title="+1 day" onPress={() => dispatch({ type: "DayTicked" }, day + 1)} /></View>
          <View style={{ flex: 1 }}><Button small kind="secondary" title="+7 days" onPress={() => dispatch({ type: "DayTicked" }, day + 7)} /></View>
        </Row>
        {confirmReset ? (
          <Row>
            <View style={{ flex: 1 }}><Button small kind="danger" title="Erase everything" onPress={() => { setConfirmReset(false); void resetSave(); }} /></View>
            <View style={{ flex: 1 }}><Button small kind="secondary" title="Keep my save" onPress={() => setConfirmReset(false)} /></View>
          </Row>
        ) : (
          <Button small kind="secondary" title="Start over…" onPress={() => setConfirmReset(true)} />
        )}
      </Card>
    </Screen>
  );
}
