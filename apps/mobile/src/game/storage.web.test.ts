import { afterEach, describe, expect, it, vi } from "vitest";

function fakeLocalStorage(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("web event store", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("moves a save from the pre-rename keys and keeps loading it", async () => {
    const event = { type: "RestDeclared", seq: 2, day: 20_701 };
    const ls = fakeLocalStorage({ "healthrpg.events.v1": JSON.stringify([event]), "healthrpg.rules.v1": "r1", "healthrpg.sync.v1": '{"syncedSeq":2}' });
    vi.stubGlobal("localStorage", ls);
    const { eventStore } = await import("./storage.web");
    expect(await eventStore.load()).toEqual({ events: [event], rules: "r1" });
    expect((await eventStore.getSync()).syncedSeq).toBe(2);
    expect([...ls.data.keys()].sort()).toEqual(["merpg.events.v1", "merpg.rules.v1", "merpg.sync.v1"]);
  });

  it("never overwrites a save already under the new keys", async () => {
    const ls = fakeLocalStorage({ "healthrpg.events.v1": "[1]", "merpg.events.v1": "[2]" });
    vi.stubGlobal("localStorage", ls);
    await import("./storage.web");
    expect(ls.data.get("merpg.events.v1")).toBe("[2]");
    expect(ls.data.get("healthrpg.events.v1")).toBe("[1]");
  });
});
