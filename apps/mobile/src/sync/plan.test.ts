import { describe, expect, it } from "vitest";
import { DEFAULT_CONTEXT as CTX, hashState, replay, type GameEvent } from "@healthrpg/engine";
import { planSync } from "./plan";

const START = 20_700;
const created: GameEvent = { type: "CharacterCreated", seq: 1, day: START, userId: "m", name: "Rowan", baseline: { aerobic: 32, muscular_strength: 20, muscular_endurance: 20, mobility: 15 } };
const walk = (seq: number, day: number, id = `w${seq}`): GameEvent => ({ type: "ActivityLogged", seq, day, activityId: id, source: "manual", activity: { type: "walk", durationMin: 30 } });

describe("sync plan", () => {
  const log = [created, walk(2, START + 1), walk(3, START + 2)];

  it("does nothing when both sides agree", () => {
    expect(planSync(log, 3, [], CTX)).toEqual({ kind: "none" });
  });

  it("pushes only events the server doesn't have", () => {
    expect(planSync(log, 1, [], CTX)).toEqual({ kind: "push", events: log.slice(1) });
    expect(planSync(log, 0, [], CTX)).toEqual({ kind: "push", events: log });
  });

  it("fast-forwards when only the server moved", () => {
    const tail = [walk(4, START + 3, "other-device")];
    const plan = planSync(log, 3, tail, CTX);
    expect(plan).toEqual({ kind: "pull", log: [...log, ...tail] });
  });

  it("rebases local-only events after the server's when both moved", () => {
    const local = [created, walk(2, START + 1, "phone")];
    const tail = [walk(2, START + 3, "tablet-a"), walk(3, START + 4, "tablet-b")];
    const plan = planSync(local, 1, tail, CTX);
    if (plan.kind !== "rebase") throw new Error(plan.kind);
    expect(plan.log.map((e) => e.seq)).toEqual([1, 2, 3, 4]);
    expect(plan.log.slice(0, 3)).toEqual([created, ...tail]);
    // The phone's walk survives, renumbered and moved to the day the log had reached.
    expect(plan.push).toEqual([{ ...local[1], seq: 4, day: START + 4 }]);
    expect(plan.dropped).toEqual([]);
    // After the push the server holds exactly the device's merged log, and it replays.
    expect([created, ...tail, ...plan.push]).toEqual(plan.log);
    expect(hashState(replay(plan.log, CTX))).toMatch(/^[0-9a-f]+$/);
  });

  it("drops a local event the engine refuses in its new position, and reports it", () => {
    const local = [created, { type: "SingleQuestStarted", seq: 2, day: START, questId: "b1", archetypeId: "mobility_session" } as GameEvent];
    const tail = [{ type: "SingleQuestStarted", seq: 2, day: START, questId: "b1", archetypeId: "mobility_session" } as GameEvent];
    // Same quest id started on both devices: the server's copy wins and the duplicate is dropped.
    const plan = planSync(local, 1, tail, CTX);
    if (plan.kind !== "rebase") throw new Error(plan.kind);
    expect(plan.log).toEqual([created, ...tail]);
    expect(plan.push).toEqual([]);
    expect(plan.dropped).toEqual([local[1]]);
  });
});
