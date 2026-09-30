import type { GameEvent } from "@healthrpg/engine";
import type { EventStore } from "./storage.types";

/** Web event store (browser preview only): the same append-only log, in localStorage. */
const KEY = "healthrpg.events.v1";
const RULES = "healthrpg.rules.v1";

function read(): GameEvent[] {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "[]") as GameEvent[];
  } catch {
    return [];
  }
}

export const eventStore: EventStore = {
  async load() {
    let rules: string | null = null;
    try {
      rules = globalThis.localStorage?.getItem(RULES) ?? null;
    } catch {
      rules = null;
    }
    return { events: read(), rules };
  },
  async append(event, rules) {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify([...read(), event]));
      globalThis.localStorage?.setItem(RULES, rules);
    } catch {
      // Private mode or storage blocked: the session still works, it just won't persist.
    }
  },
  async clear() {
    try {
      globalThis.localStorage?.removeItem(KEY);
      globalThis.localStorage?.removeItem(RULES);
    } catch {
      // Nothing to clear.
    }
  },
};
