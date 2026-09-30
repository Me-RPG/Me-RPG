import { View } from "react-native";
import { DEFAULT_CONTEXT as CTX, epilogue, questStory } from "@me-rpg/engine";
import { titleOf } from "../../game/selectors";
import { useGame } from "../../game/store";
import { GameAsset } from "../../ui/GameAsset";
import { Body, Card, Divider, Label, Row, Screen, Title } from "../../ui/components";

export default function Chronicle() {
  const state = useGame((s) => s.state);
  const lines = [...state.questlines].reverse();
  return (
    <Screen>
      {lines.length === 0 ? <Body muted>Your story has not begun. Take a quest from the board.</Body> : null}
      {lines.map((q) => (
        <Card key={q.plan.questlineId}>
          <Row>
            <GameAsset id={q.plan.kind === "single" ? `quest.${q.plan.templateId}` : `scene.${q.plan.templateId}`} width={56} showLabel={false} />
            <View style={{ flex: 1 }}>
              <Title size={18}>{titleOf(q)}</Title>
              <Label>{q.status === "victorious" ? `Victory · ${q.battle?.outcome?.grade}` : q.status === "complete" ? "Complete" : "In progress"}</Label>
            </View>
          </Row>
          {q.completed.length === 0 ? <Body muted>Nothing written yet.</Body> : null}
          {q.completed.map((c, i) => (
            <View key={`${c.slotIndex}`} style={{ gap: 2 }}>
              <Divider />
              <Label>{CTX.content.archetypes[q.plan.slots[c.slotIndex]!.archetypeId]?.name}</Label>
              <Body italic>{questStory(state, q, i, CTX)}</Body>
            </View>
          ))}
          {q.battle?.outcome ? (
            <>
              <Divider />
              <Label>Epilogue</Label>
              <Body italic>{epilogue(state, q, q.battle.outcome.grade, CTX)}</Body>
              <Body muted>Reward: {q.battle.outcome.loot}</Body>
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
