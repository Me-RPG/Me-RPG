import type { GameEvent } from "@healthrpg/engine";

export interface EventStore {
  /** The full event log in order, plus the rules version it was written under. */
  load(): Promise<{ events: GameEvent[]; rules: string | null }>;
  append(event: GameEvent, rules: string): Promise<void>;
  clear(): Promise<void>;
}
