import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import type { ClassId } from "@me-rpg/content";
import { DEFAULT_CONTEXT as CTX, QUESTLINE_LENGTH_WEEKS, type QuestlineLength } from "@me-rpg/engine";
import { useGame } from "../game/store";
import { GameAsset } from "../ui/GameAsset";
import { Body, Button, Card, Chip, Label, Row, Screen, Title } from "../ui/components";

const LENGTHS: QuestlineLength[] = ["short", "average", "long"];

export default function StartQuest() {
  const dispatch = useGame((s) => s.dispatch);
  const count = useGame((s) => s.state.questlines.length);
  const [templateId, setTemplateId] = useState(Object.keys(CTX.content.questlines)[0]!);
  const [length, setLength] = useState<QuestlineLength>("average");
  const [focus, setFocus] = useState<ClassId | null>(null);

  const begin = () => {
    if (dispatch({ type: "QuestlineStarted", questlineId: `ql${count + 1}`, templateId, length, ...(focus ? { focus } : {}) })) router.back();
  };
  const bounty = (archetypeId: string) => {
    if (dispatch({ type: "SingleQuestStarted", questId: `b${count + 1}`, archetypeId })) router.back();
  };

  return (
    <Screen>
      <Title size={18}>A questline</Title>
      {Object.values(CTX.content.questlines).map((t) => (
        <Card key={t.id} tone={templateId === t.id ? "deep" : "vellum"}>
          <Row style={{ alignItems: "flex-start" }}>
            <GameAsset id={`boss.${t.id}`} width={72} showLabel={false} />
            <View style={{ flex: 1, gap: 2 }}>
              <Title size={17}>{t.title}</Title>
              <Body muted>Against {t.antagonist}, from {t.setting}.</Body>
              <Chip testID={`pick-${t.id}`} text={templateId === t.id ? "Chosen" : "Choose"} active={templateId === t.id} onPress={() => setTemplateId(t.id)} />
            </View>
          </Row>
        </Card>
      ))}
      <Card>
        <Label>Length</Label>
        <Row wrap>{LENGTHS.map((l) => <Chip key={l} testID={`len-${l}`} text={`${l[0]!.toUpperCase()}${l.slice(1)} · ${QUESTLINE_LENGTH_WEEKS[l]} wk`} active={length === l} onPress={() => setLength(l)} />)}</Row>
        <Body muted>Longer questlines build toward a bigger boss. Every plan stays within safe weekly progression.</Body>
        <Label>Focus (optional)</Label>
        <Row wrap>
          <Chip text="None" active={focus === null} onPress={() => setFocus(null)} />
          {Object.values(CTX.content.classes).map((c) => <Chip key={c.id} testID={`focus-${c.id}`} text={c.name} active={focus === c.id} onPress={() => setFocus(c.id)} />)}
        </Row>
        <Body muted>{focus ? `Leans the plan toward ${CTX.content.classes[focus].style}.` : "A balanced plan."}</Body>
      </Card>
      <Button testID="begin-questline" title="Begin the questline" onPress={begin} />

      <Title size={18} style={{ marginTop: 16 }}>Or a single bounty</Title>
      <Body muted>One quest, sized to where you are now. No boss.</Body>
      <Row wrap>
        {Object.values(CTX.content.archetypes).map((a) => <Chip key={a.id} testID={`bounty-${a.id}`} text={a.name} onPress={() => bounty(a.id)} />)}
      </Row>
    </Screen>
  );
}
