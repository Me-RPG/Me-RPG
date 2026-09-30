import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { DEFAULT_CONTEXT as CTX, type QuestlineState } from "@me-rpg/engine";
import { maintenanceBoard, openQuestlines, titleOf } from "../../game/selectors";
import { today, useGame } from "../../game/store";
import { GameAsset } from "../../ui/GameAsset";
import { Body, Button, Card, Divider, Label, Meter, Row, Screen, Title } from "../../ui/components";
import { color, font } from "../../ui/theme";

export default function Quests() {
  const state = useGame((s) => s.state);
  const notices = useGame((s) => s.notices);
  const dismiss = useGame((s) => s.dismissNotice);
  const lastError = useGame((s) => s.lastError);
  const clearError = useGame((s) => s.clearError);
  const day = today(state);
  const open = openQuestlines(state);

  return (
    <Screen>
      {lastError ? (
        <Card tone="deep">
          <Body>{lastError}</Body>
          <Button small kind="secondary" title="OK" onPress={clearError} />
        </Card>
      ) : null}

      {notices.map((n) => (
        <Card key={n.id} tone={n.kind === "story" ? "vellum" : "deep"}>
          <Row style={{ alignItems: "flex-start" }}>
            {n.art ? <GameAsset id={n.art} width={64} showLabel={false} /> : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Label>{n.title}</Label>
              <Body italic={n.kind === "story"}>{n.text}</Body>
            </View>
          </Row>
          <Button small kind="secondary" title={n.kind === "boss_ready" ? "Onward" : "Continue"} onPress={() => dismiss(n.id)} testID={`dismiss-${n.id}`} />
        </Card>
      ))}

      <Row>
        <View style={{ flex: 1 }}><Button testID="log-workout" title="Log a workout" onPress={() => router.push("/log")} /></View>
        <View style={{ flex: 1 }}><Button testID="new-quest" kind="secondary" title="New quest" onPress={() => router.push("/start")} /></View>
      </Row>

      <Maintenance day={day} />

      {open.length === 0 ? (
        <Card>
          <Title size={18}>No quest in hand</Title>
          <Body muted>Choose a questline (a story that trains you toward a boss) or take a single bounty.</Body>
        </Card>
      ) : open.map((q) => <QuestlineCard key={q.plan.questlineId} q={q} day={day} />)}
    </Screen>
  );
}

function Maintenance({ day }: { day: number }) {
  const state = useGame((s) => s.state);
  const board = maintenanceBoard(state, day);
  return (
    <Card tone="deep">
      <Label>This week's upkeep</Label>
      {board.map((b) => (
        <Row key={b.id} style={{ alignItems: "flex-start" }}>
          <Body style={{ width: 22, color: b.done ? color.forest : color.inkMuted }}>{b.done ? "✓" : "○"}</Body>
          <View style={{ flex: 1 }}>
            <Body style={{ fontFamily: font.bodyBold }}>{b.title}</Body>
            <Body muted>{b.description}</Body>
          </View>
        </Row>
      ))}
    </Card>
  );
}

function QuestlineCard({ q, day }: { q: QuestlineState; day: number }) {
  const dispatch = useGame((s) => s.dispatch);
  const [openRoutine, setOpenRoutine] = useState<string | null>(null);
  const boss = CTX.content.bosses[q.plan.templateId];
  const a = q.active;
  const total = q.plan.slots.length;

  return (
    <Card>
      <Row style={{ alignItems: "flex-start" }}>
        <GameAsset id={q.plan.kind === "single" ? `quest.${q.plan.templateId}` : `scene.${q.plan.templateId}`} width={72} showLabel={false} />
        <View style={{ flex: 1, gap: 2 }}>
          <Title size={18}>{titleOf(q)}</Title>
          {q.plan.kind === "questline" ? (
            <Body muted>{q.plan.length} questline{q.plan.focus ? ` · ${CTX.content.classes[q.plan.focus].name} focus` : ""}</Body>
          ) : null}
          {q.plan.kind === "questline" ? <Meter label="" value={q.completed.length} max={total} tint={color.gold} note={`${q.completed.length}/${total} trials`} /> : null}
        </View>
      </Row>

      {q.status === "boss_ready" || (q.battle && !q.battle.outcome) ? (
        <>
          <Divider />
          <Row>
            <GameAsset id={`boss.${q.plan.templateId}`} width={80} />
            <View style={{ flex: 1, gap: 6 }}>
              <Body>{boss?.name ?? "The boss"} awaits.</Body>
              <Button testID="face-boss" title={q.battle ? "Return to the fight" : "Face the boss"} onPress={() => router.push(`/battle/${q.plan.questlineId}`)} />
            </View>
          </Row>
        </>
      ) : a ? (
        <>
          <Divider />
          <Row style={{ alignItems: "flex-start" }}>
            <GameAsset id={`quest.${a.archetypeId}`} width={56} showLabel={false} />
            <View style={{ flex: 1 }}>
              <Label>{a.isBoss ? "Final trial" : q.plan.kind === "single" ? "Bounty" : `Trial ${q.completed.length + 1} · ${a.act}`}</Label>
              <Title size={17}>{a.title}</Title>
              <Body muted>
                {a.availableFromDay > day ? `Opens in ${a.availableFromDay - day} day(s): rest first.` : "Open now."} No penalty if it runs late; it just re-rolls.
              </Body>
            </View>
          </Row>
          {a.options.map((o) => (
            <View key={o.id} style={{ gap: 4, paddingVertical: 6 }}>
              <Body style={{ fontFamily: font.bodyBold }}>{o.title}</Body>
              <Body muted>
                {o.targetMinutes} min{o.targetElevGainM ? ` · ${o.targetElevGainM} m climb` : ""} · effort about {o.targetRpe}/10
              </Body>
              {o.routine ? (
                <Pressable accessibilityRole="button" onPress={() => setOpenRoutine(openRoutine === o.id ? null : o.id)}>
                  <Body style={{ color: color.sky }}>{openRoutine === o.id ? "Hide the routine" : `Show ${o.routine.name}`}</Body>
                </Pressable>
              ) : null}
              {openRoutine === o.id && o.routine
                ? o.routine.exercises.map((e) => <Body key={e.name} muted>· {e.name}: {e.sets} × {e.reps ? `${e.reps} reps` : `${e.seconds}s`}. {e.cue}</Body>)
                : null}
              <Button
                small
                kind="secondary"
                testID={`done-${o.id}`}
                title="I did this"
                disabled={a.availableFromDay > day}
                onPress={() => dispatch({ type: "QuestOptionCompleted", questlineId: q.plan.questlineId, optionId: o.id })}
              />
            </View>
          ))}
          <Body muted italic>Logged workouts that match an option complete the quest automatically.</Body>
        </>
      ) : null}
    </Card>
  );
}
