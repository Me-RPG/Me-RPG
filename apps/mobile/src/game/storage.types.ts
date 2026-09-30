import type { GameEvent } from "@me-rpg/engine";

/** How this device's save relates to the server copy (see src/sync). */
export interface SyncMeta {
  /** Server id of this save's hero; null until the save is first linked to an account. */
  characterId: string | null;
  /** The account the hero belongs to. A save is never pushed into a different account. */
  ownerId: string | null;
  /** Highest seq known to be stored on the server. */
  syncedSeq: number;
}

export const UNLINKED: SyncMeta = { characterId: null, ownerId: null, syncedSeq: 0 };

export interface EventStore {
  /** The full event log in order, plus the rules version it was written under. */
  load(): Promise<{ events: GameEvent[]; rules: string | null }>;
  append(event: GameEvent, rules: string): Promise<void>;
  /** Rewrite the whole log, e.g. after pulling from or merging with the server. */
  replace(events: GameEvent[], rules: string): Promise<void>;
  getSync(): Promise<SyncMeta>;
  setSync(meta: SyncMeta): Promise<void>;
  /** Erase the log and unlink the save from any account. */
  clear(): Promise<void>;
}
