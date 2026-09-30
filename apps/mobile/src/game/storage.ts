import * as SQLite from "expo-sqlite";
import type { GameEvent } from "@healthrpg/engine";
import type { EventStore } from "./storage.types";

/**
 * Native event store: an append-only table in on-device SQLite. The event log
 * is the save; state is always rebuilt by replaying it through the engine.
 * (Web uses storage.web.ts; expo-sqlite on web is still alpha.)
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("healthrpg.db").then(async (d) => {
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
    await d.runAsync("INSERT INTO events (seq, body) VALUES (?, ?)", event.seq, JSON.stringify(event));
    await d.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('rules', ?)", rules);
  },
  async clear() {
    const d = await db();
    await d.execAsync("DELETE FROM events; DELETE FROM meta;");
  },
};
