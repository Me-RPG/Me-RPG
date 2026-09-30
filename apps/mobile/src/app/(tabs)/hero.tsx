import { View } from "react-native";
import { classRows, heroSheet, skillRows } from "../../game/selectors";
import { today, useGame } from "../../game/store";
import { GameAsset } from "../../ui/GameAsset";
import { Body, Card, Divider, Label, Meter, Row, Screen, Title } from "../../ui/components";
import { classColor, color, font } from "../../ui/theme";

export default function Hero() {
  const state = useGame((s) => s.state);
  const day = today(state);
  const st = heroSheet(state);
  const flags = [st.wellRested && "Well-Rested", st.inSanctuary && "In Sanctuary"].filter(Boolean) as string[];

  return (
    <Screen>
      <Card>
        <Row style={{ alignItems: "flex-start" }}>
          <GameAsset id="portrait.hero" width={84} />
          <View style={{ flex: 1, gap: 2 }}>
            <Title>{state.character?.name}</Title>
            <Body muted>Level {st.level} · {state.totals.sessions} sessions · {state.totals.xp} XP</Body>
            {flags.length ? <Body style={{ color: color.forest }}>{flags.join(" · ")}</Body> : null}
          </View>
        </Row>
        <Divider />
        <Meter label="STR" value={st.STR} max={70} tint={color.ember} note="strength" />
        <Meter label="END" value={st.END} max={70} tint={color.forest} note="endurance" />
        <Meter label="AGI" value={st.AGI} max={70} tint={color.sky} note="mobility" />
        <Meter label="VIT" value={st.VIT} max={50} tint={color.gold} note="consistency" />
        <Meter label="WAN" value={st.WAN} max={Math.max(50, st.WAN)} tint={color.iron} note="never fades" />
      </Card>

      <Title size={18}>Classes</Title>
      <Body muted>You grow in whatever you train. Classes aren't exclusive: mix freely.</Body>
      {classRows(state).map((c) => (
        <Card key={c.id}>
          <Row style={{ alignItems: "flex-start" }}>
            <GameAsset id={`class.${c.id}`} width={60} showLabel={false} />
            <View style={{ flex: 1, gap: 2 }}>
              <Title size={17} style={{ color: classColor[c.id] }}>{c.name} · level {c.level}</Title>
              <Body muted>{c.style}</Body>
              <Meter label="" value={Math.round(c.progress * 100)} max={100} tint={classColor[c.id]} note={`% to level ${c.level + 1}`} />
            </View>
          </Row>
          <Label>Skill tree</Label>
          {c.tree.map((n) => (
            <Row key={n.abilityId} style={{ alignItems: "flex-start" }}>
              <Body style={{ width: 22, color: n.unlocked ? classColor[c.id] : color.inkMuted }}>{n.unlocked ? "◆" : "◇"}</Body>
              <View style={{ flex: 1 }}>
                <Body style={{ fontFamily: font.bodyBold, color: n.unlocked ? color.ink : color.inkMuted }}>
                  {n.ability.name} <Body muted>· L{n.level} · {n.ability.kind}</Body>
                </Body>
                {n.unlocked ? <Body muted>{n.ability.description}{n.level > c.level ? " Earned early from a quest." : ""}</Body> : null}
              </View>
            </Row>
          ))}
        </Card>
      ))}

      <Title size={18}>Skills</Title>
      <Card>
        {skillRows(state, day).length === 0 ? <Body muted>Complete quests and train to earn skills.</Body> : null}
        {skillRows(state, day).map((r) => (
          <Row key={r.id}>
            <Body style={{ flex: 1, fontFamily: font.bodyBold }}>{r.ability!.name}</Body>
            <Body style={{ color: color.gold }}>{"★".repeat(r.rank)}{"☆".repeat(5 - r.rank)}</Body>
            <Body muted style={{ width: 96, textAlign: "right" }}>{r.sharp < 1 ? `${Math.round(r.sharp * 100)}% sharp` : "sharp"}</Body>
          </Row>
        ))}
        <Body muted italic>Ranks are never lost. An untrained skill slowly dulls; the weekly upkeep keeps it sharp.</Body>
      </Card>
    </Screen>
  );
}
