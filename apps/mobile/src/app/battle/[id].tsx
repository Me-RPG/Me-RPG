import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DEFAULT_CONTEXT as CTX, availableActions, epilogue, incomingWarning } from "@me-rpg/engine";
import { useGame } from "../../game/store";
import { GameAsset } from "../../ui/GameAsset";
import { Body, Button, Card, Label, Meter, Row, Screen, Title } from "../../ui/components";
import { color } from "../../ui/theme";

export default function Battle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useGame((s) => s.state);
  const dispatch = useGame((s) => s.dispatch);
  const q = state.questlines.find((x) => x.plan.questlineId === id);
  const started = useRef(false);

  useEffect(() => {
    if (q && q.status === "boss_ready" && !q.battle && !started.current) {
      started.current = true;
      dispatch({ type: "BattleStarted", questlineId: q.plan.questlineId });
    }
  }, [q, dispatch]);

  if (!q?.battle) return <Screen><Body muted>Preparing the field…</Body></Screen>;
  const b = q.battle;
  const boss = CTX.content.bosses[q.plan.templateId]!;
  const warning = incomingWarning(b, q, CTX);

  if (b.outcome) {
    return (
      <Screen>
        <Row style={{ justifyContent: "center" }}><GameAsset id={`boss.${q.plan.templateId}`} width={140} /></Row>
        <Title size={26} style={{ textAlign: "center" }}>Victory: {b.outcome.grade}</Title>
        <Card>
          {b.log.at(-1)?.map((line, i) => <Body key={i}>{line}</Body>)}
        </Card>
        <Card tone="deep">
          <Body italic>{epilogue(state, q, b.outcome.grade, CTX)}</Body>
          <Body>Reward: {b.outcome.loot}</Body>
          <Body muted>{b.outcome.turns} turns · {b.crits} critical {b.crits === 1 ? "blow" : "blows"}{b.nickOfTime ? " · won in the nick of time" : ""}</Body>
        </Card>
        <Button testID="leave-battle" title="Return to the board" onPress={() => router.replace("/quests")} />
      </Screen>
    );
  }

  const actions = availableActions(b, CTX);
  return (
    <Screen>
      <Row style={{ alignItems: "flex-start" }}>
        <GameAsset id={`boss.${q.plan.templateId}`} width={96} />
        <View style={{ flex: 1, gap: 6 }}>
          <Title size={18}>{boss.name}</Title>
          <Meter label="HP" value={b.bossHp} max={b.bossMaxHp} tint={color.ember} note={`of ${b.bossMaxHp}`} />
          <Label>Turn {b.turn + 1}</Label>
        </View>
      </Row>
      <Card>
        <Label>{state.character?.name}</Label>
        <Meter label="HP" value={b.heroHp} max={b.heroMaxHp} tint={color.forest} note={`of ${b.heroMaxHp}`} />
        <Meter label="STA" value={b.stamina} max={b.staminaMax} tint={color.gold} note={`of ${b.staminaMax}`} />
      </Card>
      {warning ? <Card tone="deep"><Body style={{ color: color.danger }}>⚠ {warning}</Body></Card> : null}
      <Card style={{ maxHeight: 260 }}>
        <ScrollView>
          {b.log.length === 0 ? <Body italic>{b.intro}</Body> : b.log.slice(-3).flat().map((line, i) => <Body key={i}>{line}</Body>)}
        </ScrollView>
      </Card>
      <View style={{ gap: 8 }}>
        {actions.map((a) => {
          const ab = CTX.content.abilities[a];
          const title = ab ? `${ab.name}${ab.staminaCost ? ` · ${ab.staminaCost} stamina` : ""}` : a === "strike" ? "Strike" : "Guard";
          return <Button key={a} testID={`act-${a}`} kind={a === "strike" ? "primary" : "secondary"} title={title} onPress={() => dispatch({ type: "BattleActionTaken", questlineId: q.plan.questlineId, action: a })} />;
        })}
      </View>
    </Screen>
  );
}
