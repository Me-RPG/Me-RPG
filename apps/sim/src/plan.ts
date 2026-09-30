// Print a generated questline plan and its first quest.
// Usage:
//   npm run plan -- [templateId] [short|average|long] [novice|trained]
//   npm run plan -- single:<archetypeId> [novice|trained]      (e.g. single:long_walk)
import { replay, type GameEvent, type QuestlineLength } from "@me-rpg/engine";

const args = process.argv.slice(2);
const target = args.find((a) => !["short", "average", "long", "novice", "trained"].includes(a)) ?? "dragon_of_ashpeak";
const length = (args.find((a) => a === "short" || a === "average" || a === "long") ?? "average") as QuestlineLength;
const trained = args.includes("trained");
const single = target.startsWith("single:");
const START = 20_700;

const events: GameEvent[] = [
  {
    type: "CharacterCreated",
    seq: 1,
    day: START - 30,
    userId: "demo",
    name: "Aldric",
    baseline: { aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 },
  },
];
let seq = 2;
if (trained) {
  // Four weeks of history: 3 walks of ~45 min and a lift each week.
  for (let w = 0; w < 4; w++) {
    for (const [d, type, min] of [[0, "walk", 40], [2, "resistance_training", 40], [4, "walk", 45], [6, "hike", 60]] as const) {
      events.push({ type: "ActivityLogged", seq: seq++, day: START - 29 + w * 7 + d, activityId: `h${seq}`, source: "manual", activity: { type, durationMin: min } });
    }
  }
}
events.push(
  single
    ? { type: "SingleQuestStarted", seq: seq++, day: START, questId: "ql1", archetypeId: target.slice("single:".length) }
    : { type: "QuestlineStarted", seq: seq++, day: START, questlineId: "ql1", templateId: target, length },
);

const state = replay(events);
const ql = state.questlines[0]!;
const { plan } = ql;
console.log(`${plan.templateId}  ${plan.kind}${plan.length ? ` (${plan.length})` : ""}  level=${plan.level}  weeks=${plan.weekKinds.join(" ")}  boss=${plan.bossMinutes} min${plan.bossScaled ? " (scaled)" : ""}`);
let week = -1;
for (const s of plan.slots) {
  if (s.week !== week) {
    week = s.week;
    console.log(`\n week ${week + 1} [${s.weekKind}] ${s.act}`);
  }
  console.log(`   day ${String(s.dayOffset).padStart(2)}  ${s.role.padEnd(8)} ${s.archetypeId.padEnd(18)} ${String(s.plannedMinutes).padStart(3)} min${s.isBoss ? "  <== BOSS" : ""}`);
}
console.log("\nFirst quest:", JSON.stringify(ql.active, null, 2));
