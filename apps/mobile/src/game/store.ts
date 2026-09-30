import { create } from "zustand";
import {
  DEFAULT_CONTEXT as CTX,
  STATE_VERSION,
  classLevel,
  initialState,
  reduce,
  replay,
  type GameEvent,
  type GameState,
} from "@healthrpg/engine";
import { noticesBetween, type Notice } from "./announce";
import { eventStore } from "./storage";

/** Saves record the rules they were made under; a save from other rules may not replay. */
export const RULES_VERSION = `${CTX.params.version}+content-${CTX.content.version}+state-${STATE_VERSION}`;

type EventInput = { type: GameEvent["type"] } & Record<string, unknown>;

interface GameStore {
  status: "loading" | "ready" | "incompatible";
  incompatibleReason: string | null;
  events: GameEvent[];
  state: GameState;
  notices: Notice[];
  lastError: string | null;
  /** Load the saved event log and replay it. */
  hydrate(): Promise<void>;
  /** Apply one event through the engine. Returns false (and sets lastError) if the engine refuses it. */
  dispatch(e: EventInput, day?: number): boolean;
  dismissNotice(id: string): void;
  clearError(): void;
  resetSave(): Promise<void>;
}

const realToday = () => Math.floor(Date.now() / 86_400_000);

/** The game's "today": the real date, or later if time was advanced for testing. */
export function today(state: GameState): number {
  return Math.max(realToday(), state.day);
}

export const useGame = create<GameStore>((set, get) => ({
  status: "loading",
  incompatibleReason: null,
  events: [],
  state: initialState(),
  notices: [],
  lastError: null,

  async hydrate() {
    const { events, rules } = await eventStore.load();
    try {
      set({ events, state: replay(events, CTX), status: "ready" });
    } catch (e) {
      set({ status: "incompatible", incompatibleReason: `Saved under rules "${rules ?? "unknown"}", current "${RULES_VERSION}": ${(e as Error).message}` });
    }
  },

  dispatch(input, day) {
    const { state, events } = get();
    const event = { ...input, seq: state.seq + 1, day: day ?? today(state) } as GameEvent;
    try {
      const next = reduce(state, event, CTX);
      const notices = noticesBetween(state, next, classLevel);
      set((s) => ({ state: next, events: [...events, event], notices: [...s.notices, ...notices], lastError: null }));
      void eventStore.append(event, RULES_VERSION);
      return true;
    } catch (e) {
      set({ lastError: (e as Error).message });
      return false;
    }
  },

  dismissNotice(id) {
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) }));
  },

  clearError() {
    set({ lastError: null });
  },

  async resetSave() {
    await eventStore.clear();
    set({ events: [], state: initialState(), notices: [], status: "ready", incompatibleReason: null });
  },
}));
