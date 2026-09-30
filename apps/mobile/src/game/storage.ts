import * as SQLite from "expo-sqlite";
import type { GameEvent } from "@me-rpg/engine";
import { UNLINKED, type EventStore, type SyncMeta } from "./storage.types";

/**
 * Native event store: an append-only table in on-device SQLite. The event log
 * is the save; state is always rebuilt by replaying it through the engine.
 * (Web uses storage.web.ts; expo-sqlite on web is still alpha.)
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("merpg.db").then(async (d) => {
      await d.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY NOT NULL, body TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      `);
      return d;
    });
  }
  return dbPromise;
}

export const eventStore: EventStore = {
  async load() {
    const d = await db();
    const rows = await d.getAllAsync<{ body: string }>("SELECT body FROM events ORDER BY seq");
    const rules = await d.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'rules'");
    return { events: rows.map((r) => JSON.parse(r.body) as GameEvent), rules: rules?.value ?? null };
  },
  async append(event, rules) {
    const d = await db();
    // OR REPLACE: a sync may already have written this seq while the append was queued.
    await d.runAsync("INSERT OR REPLACE INTO events (seq, body) VALUES (?, ?)", event.seq, JSON.stringify(event));
    await d.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('rules', ?)", rules);
  },
  async replace(events, rules) {
    const d = await db();
    await d.withTransactionAsync(async () => {
      await d.runAsync("DELETE FROM events");
      for (const e of events) await d.runAsync("INSERT INTO events (seq, body) VALUES (?, ?)", e.seq, JSON.stringify(e));
      await d.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('rules', ?)", rules);
    });
  },
  async getSync() {
    const d = await db();
    const row = await d.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'sync'");
    return row ? { ...UNLINKED, ...(JSON.parse(row.value) as Partial<SyncMeta>) } : UNLINKED;
  },
  async setSync(meta) {
    const d = await db();
    await d.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('sync', ?)", JSON.stringify(meta));
  },
  async clear() {
    const d = await db();
    await d.execAsync("DELETE FROM events; DELETE FROM meta;");
  },
};
