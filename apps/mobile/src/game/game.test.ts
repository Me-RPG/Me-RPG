import { describe, expect, it } from "vitest";
import { DEFAULT_CONTEXT as CTX, classLevel, reduce, replay, type GameState } from "@me-rpg/engine";
import { noticesBetween } from "./announce";
import { classRows, maintenanceBoard, openQuestlines, skillRows, titleOf } from "./selectors";

const START = 20_700;
const hero = (): GameState =>
  replay([{ type: "CharacterCreated", seq: 1, day: START, userId: "m", name: "Rowan", baseline: { aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 } }], CTX);

describe("mobile view models", () => {
  it("completing a quest yields a story notice; unlocking a skill yields a skill notice", () => {
    const s0 = reduce(hero(), { type: "QuestlineStarted", seq: 2, day: START, questlineId: "ql1", templateId: "wolves_of_greywood", length: "short" }, CTX);
    const option = s0.questlines[0]!.active!.options[0]!;
    const s1 = reduce(s0, { type: "QuestOptionCompleted", seq: 3, day: START, questlineId: "ql1", optionId: option.id }, CTX);
    const notices = noticesBetween(s0, s1, classLevel);
    expect(notices.find((n) => n.kind === "story")?.text).toMatch(/Rowan/);
    expect(notices.some((n) => n.kind === "skill_unlocked")).toBe(true);
    expect(new Set(notices.map((n) => n.id)).size).toBe(notices.length);
  });

  it("maintenance board reflects this week's sessions", () => {
    let s = hero();
    expect(maintenanceBoard(s, START).every((b) => !b.done)).toBe(true);
    s = reduce(s, { type: "ActivityLogged", seq: 2, day: START + 1, activityId: "w", source: "manual", activity: { type: "walk", durationMin: 30 } }, CTX);
    const board = maintenanceBoard(s, START + 1);
    expect(board.find((b) => b.id === "keep_the_road")?.done).toBe(true);
    expect(board.find((b) => b.id === "keep_the_blade")?.done).toBe(false);
  });

  it("class rows expose level, progress in [0,1] and tree unlocks", () => {
    let s = hero();
    for (let i = 0; i < 20; i++) {
      s = reduce(s, { type: "ActivityLogged", seq: s.seq + 1, day: START + i * 2, activityId: `l${i}`, source: "manual", activity: { type: "resistance_training", durationMin: 45 } }, CTX);
    }
    const berserker = classRows(s).find((c) => c.id === "berserker")!;
    expect(berserker.level).toBeGreaterThanOrEqual(2);
    expect(berserker.progress).toBeGreaterThanOrEqual(0);
    expect(berserker.progress).toBeLessThanOrEqual(1);
    expect(berserker.tree[0]!.unlocked).toBe(true);
    expect(skillRows(s, s.day).length).toBeGreaterThan(0);
  });

  it("questline titles and open lists", () => {
    const s = reduce(hero(), { type: "SingleQuestStarted", seq: 2, day: START, questId: "b1", archetypeId: "mobility_session" }, CTX);
    expect(titleOf(s.questlines[0]!)).toBe("Bounty: At the Shrine");
    expect(openQuestlines(s)).toHaveLength(1);
  });
});
