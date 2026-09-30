import { reduce, replay, type EngineContext, type GameEvent } from "@me-rpg/engine";

/**
 * What one sync round should do, decided from the local log, the seq the server
 * is known to hold, and the server events after that seq. Pure: no IO.
 *
 * The log is per hero and append-only, so the only real conflict is the same
 * hero played on two devices while offline. Then the server's events win their
 * seq numbers and the local-only events are replayed after them (the plan's
 * "sequence number plus server order"). An event the engine no longer accepts
 * in its new position (a second boss fight, say) is dropped and reported.
 */
export type SyncPlan =
  | { kind: "none" }
  | { kind: "push"; events: GameEvent[] }
  | { kind: "pull"; log: GameEvent[] }
  | { kind: "rebase"; log: GameEvent[]; push: GameEvent[]; dropped: GameEvent[] };

export function planSync(local: readonly GameEvent[], syncedSeq: number, serverTail: readonly GameEvent[], ctx: EngineContext): SyncPlan {
  const base = local.filter((e) => e.seq <= syncedSeq);
  const unsynced = local.filter((e) => e.seq > syncedSeq);
  if (serverTail.length === 0) return unsynced.length === 0 ? { kind: "none" } : { kind: "push", events: unsynced };
  if (unsynced.length === 0) return { kind: "pull", log: [...base, ...serverTail] };
  return { kind: "rebase", ...rebase([...base, ...serverTail], unsynced, ctx) };
}

/** Replay `extra` after `base`, renumbering each event and moving it no earlier than the day the log has reached. */
export function rebase(base: readonly GameEvent[], extra: readonly GameEvent[], ctx: EngineContext) {
  let state = replay(base, ctx);
  const log = [...base];
  const push: GameEvent[] = [];
  const dropped: GameEvent[] = [];
  for (const e of extra) {
    const moved = { ...e, seq: state.seq + 1, day: Math.max(e.day, state.day) } as GameEvent;
    try {
      state = reduce(state, moved, ctx);
      log.push(moved);
      push.push(moved);
    } catch {
      dropped.push(e);
    }
  }
  return { log, push, dropped };
}
