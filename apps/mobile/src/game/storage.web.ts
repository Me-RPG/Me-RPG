import type { GameEvent } from "@me-rpg/engine";
import { UNLINKED, type EventStore, type SyncMeta } from "./storage.types";

/** Web event store: the same append-only log, in localStorage. */
const KEY = "merpg.events.v1";
const RULES = "merpg.rules.v1";
const SYNC = "merpg.sync.v1";

/** Keys from before the rename to Me RPG, moved once so existing saves keep loading. */
const LEGACY_KEYS: [string, string][] = [["healthrpg.events.v1", KEY], ["healthrpg.rules.v1", RULES], ["healthrpg.sync.v1", SYNC]];

function migrateLegacyKeys() {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return;
    for (const [old, key] of LEGACY_KEYS) {
      const value = ls.getItem(old);
      if (value === null || ls.getItem(key) !== null) continue;
      ls.setItem(key, value);
      ls.removeItem(old);
    }
  } catch {
    // Storage blocked: nothing to move.
  }
}
migrateLegacyKeys();

function read(): GameEvent[] {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "[]") as GameEvent[];
  } catch {
    return [];
  }
}

function write(events: GameEvent[], rules: string) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(events));
    globalThis.localStorage?.setItem(RULES, rules);
  } catch {
    // Private mode or storage blocked: the session still works, it just won't persist.
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
    write([...read().filter((e) => e.seq !== event.seq), event], rules);
  },
  async replace(events, rules) {
    write(events, rules);
  },
  async getSync() {
    try {
      const raw = globalThis.localStorage?.getItem(SYNC);
      return raw ? { ...UNLINKED, ...(JSON.parse(raw) as Partial<SyncMeta>) } : UNLINKED;
    } catch {
      return UNLINKED;
    }
  },
  async setSync(meta) {
    try {
      globalThis.localStorage?.setItem(SYNC, JSON.stringify(meta));
    } catch {
      // As above: nothing to persist to.
    }
  },
  async clear() {
    try {
      globalThis.localStorage?.removeItem(KEY);
      globalThis.localStorage?.removeItem(RULES);
      globalThis.localStorage?.removeItem(SYNC);
    } catch {
      // Nothing to clear.
    }
  },
};
