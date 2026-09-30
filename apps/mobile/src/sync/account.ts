import { AppState } from "react-native";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { DEFAULT_CONTEXT as CTX, type GameEvent } from "@healthrpg/engine";
import { eventStore } from "../game/storage";
import { UNLINKED, type SyncMeta } from "../game/storage.types";
import { RULES_VERSION, useGame } from "../game/store";
import { saveExport } from "./exportFile";
import { planSync } from "./plan";
import { deleteAccount, exportAccount, fetchEvents, listHeroes, pushEvents, RemoteError, type HeroSummary } from "./remote";
import { supabase } from "./supabase";

/**
 * Accounts and sync. The device's event log stays the source of truth for play;
 * when signed in, new events are pushed to the server shortly after they happen,
 * and anything another device added is pulled in (see plan.ts for merging).
 */
export type SyncStatus = "unconfigured" | "signed_out" | "syncing" | "synced" | "pending" | "offline" | "error" | "other_account";

interface AccountStore {
  session: Session | null;
  status: SyncStatus;
  /** Latest error or notice for the player, if any. */
  message: string | null;
  lastSyncedAt: number | null;
  /** Local events the server doesn't have yet. */
  unsynced: number;
  heroes: HeroSummary[];
  meta: SyncMeta;
  /** A player-initiated action (sign-in, export, delete…) is in flight. */
  busy: boolean;
  /** Start listening for auth, game and app-state changes. Returns a cleanup function. */
  init(): () => void;
  sendCode(email: string): Promise<boolean>;
  verifyCode(email: string, code: string): Promise<boolean>;
  signOut(): Promise<void>;
  syncNow(): Promise<void>;
  /** Replace this device's save with one of the account's heroes. Refused if it would lose unsynced progress. */
  playHero(id: string): Promise<boolean>;
  exportData(): Promise<void>;
  deleteAccount(): Promise<boolean>;
  clearMessage(): void;
}

/** One line for the player about where their progress stands. */
export function syncLine(status: SyncStatus, unsynced: number): string {
  const changes = `${unsynced} change${unsynced === 1 ? "" : "s"}`;
  switch (status) {
    case "unconfigured": return "Accounts aren't set up in this build. Your hero is saved on this device.";
    case "signed_out": return "Your hero is saved on this device only. Sign in to back it up and play on other devices.";
    case "syncing": return "Saving your journey…";
    case "synced": return "Your journey is saved to your account.";
    case "pending": return `${changes} waiting to be saved to your account.`;
    case "offline": return `Offline. ${unsynced > 0 ? `${changes} will be saved` : "Your journey will sync"} when you're back online.`;
    case "error": return "Couldn't save to your account. Your progress is safe on this device.";
    case "other_account": return "The hero on this device belongs to a different account, so it isn't saved to this one.";
  }
}

const headSeq = () => useGame.getState().events.at(-1)?.seq ?? 0;
const unsyncedFor = (meta: SyncMeta) => Math.max(0, headSeq() - meta.syncedSeq);

let metaReady: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let again = false;
/** True while sync itself rewrites the game log, so that change doesn't trigger another sync. */
let applying = false;

async function setMeta(meta: SyncMeta) {
  useAccount.setState({ meta, unsynced: unsyncedFor(meta) });
  await eventStore.setSync(meta);
}

async function applyLog(events: GameEvent[]) {
  applying = true;
  try {
    await useGame.getState().replaceLog(events);
  } finally {
    applying = false;
  }
}

function requestSync(delayMs = 1500) {
  if (!supabase || !useAccount.getState().session) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void runSync();
  }, delayMs);
}

async function runSync() {
  if (running) {
    again = true;
    return;
  }
  running = true;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      again = false;
      await syncOnce();
      if (!again) break;
    }
  } finally {
    running = false;
  }
}

function describe(e: unknown): string {
  const msg = (e as Error)?.message ?? String(e);
  if (/rate limit/i.test(msg)) return "Too many codes requested. Wait a few minutes and try again.";
  if (/expired|invalid.*(otp|token)|token.*invalid/i.test(msg)) return "That code is wrong or has expired. Request a new one.";
  if (e instanceof RemoteError && e.offline) return "Can't reach the server. Your progress is safe on this device and will sync later.";
  return msg;
}

async function syncOnce() {
  const db = supabase;
  const session = useAccount.getState().session;
  if (!db || !session) return;
  await metaReady;
  const game = useGame.getState();
  if (game.status !== "ready") return;
  const local = game.events;
  let meta = useAccount.getState().meta;
  const set = useAccount.setState;

  if (local.length === 0) {
    set({ status: "synced", unsynced: 0 });
    await refreshHeroes();
    return;
  }
  if (meta.ownerId !== null && meta.ownerId !== session.user.id) {
    set({ status: "other_account" });
    return;
  }
  if (meta.characterId === null) {
    meta = { characterId: randomUUID(), ownerId: session.user.id, syncedSeq: 0 };
    await setMeta(meta);
  }
  const characterId = meta.characterId!;
  // A reset or hero switch while we were waiting makes this round's work stale.
  const stale = () => useAccount.getState().meta.characterId !== characterId;

  set({ status: "syncing" });
  try {
    const synced = Math.min(meta.syncedSeq, local.at(-1)!.seq);
    const tail = await fetchEvents(db, characterId, synced);
    if (stale() || useGame.getState().events !== local) {
      again = true; // the player acted meanwhile: plan again from the new log
      return;
    }
    const plan = planSync(local, synced, tail, CTX);
    let message: string | null = null;
    if (plan.kind === "pull" || plan.kind === "rebase") {
      await applyLog(plan.log);
      meta = { ...meta, syncedSeq: tail.at(-1)!.seq };
      await setMeta(meta);
    }
    if (plan.kind === "rebase" && plan.dropped.length > 0) {
      const n = plan.dropped.length;
      message = `${n} action${n === 1 ? "" : "s"} from this device clashed with progress from another device and ${n === 1 ? "was" : "were"} set aside.`;
    }
    const toPush = plan.kind === "push" ? plan.events : plan.kind === "rebase" ? plan.push : [];
    await pushEvents(db, characterId, RULES_VERSION, toPush, async (head) => {
      if (stale()) throw new Error("save changed during sync");
      meta = { ...meta, syncedSeq: head };
      await setMeta(meta);
    });
    await refreshHeroes();
    set({ status: unsyncedFor(meta) > 0 ? "pending" : "synced", message, lastSyncedAt: Date.now() });
  } catch (e) {
    if (e instanceof RemoteError && e.code === "PT409") {
      again = true; // another device pushed first: pull and merge
      return;
    }
    if (stale()) return;
    set(e instanceof RemoteError && e.offline ? { status: "offline", message: null } : { status: "error", message: describe(e) });
  }
}

async function refreshHeroes() {
  if (!supabase) return;
  useAccount.setState({ heroes: await listHeroes(supabase) });
}

export const useAccount = create<AccountStore>((set, get) => ({
  session: null,
  status: supabase ? "signed_out" : "unconfigured",
  message: null,
  lastSyncedAt: null,
  unsynced: 0,
  heroes: [],
  meta: UNLINKED,
  busy: false,

  init() {
    const db = supabase;
    if (!db) return () => {};
    metaReady = eventStore.getSync().then((meta) => set({ meta, unsynced: unsyncedFor(meta) }));
    void db.auth.getSession().then(({ data }) => {
      set({ session: data.session });
      if (data.session) requestSync(0);
    });
    const { data: auth } = db.auth.onAuthStateChange((event, session) => {
      set(session ? { session } : { session: null, status: "signed_out", heroes: [] });
      // Don't call Supabase inside this callback (it can deadlock the auth lock); defer instead.
      if (session && event === "SIGNED_IN") setTimeout(() => requestSync(0), 0);
    });
    const unsubscribeGame = useGame.subscribe((s, prev) => {
      if (s.events === prev.events) return;
      // An empty log has no hero to link (e.g. after "Start over"): the next hero starts unlinked.
      if (s.events.length === 0 && get().meta.characterId !== null) void setMeta(UNLINKED);
      else set({ unsynced: unsyncedFor(get().meta) });
      if (!applying) requestSync();
    });
    const appState = AppState.addEventListener("change", (s) => {
      if (s === "active") requestSync(0);
    });
    return () => {
      auth.subscription.unsubscribe();
      unsubscribeGame();
      appState.remove();
    };
  },

  async sendCode(email) {
    if (!supabase) return false;
    set({ busy: true, message: null });
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    set({ busy: false, message: error ? describe(error) : null });
    return !error;
  },

  async verifyCode(email, code) {
    if (!supabase) return false;
    set({ busy: true, message: null });
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    set({ busy: false, message: error ? describe(error) : null });
    return !error;
  },

  async signOut() {
    if (!supabase) return;
    set({ busy: true });
    // The save stays on this device and stays linked to its account, so it can't be pushed into another one.
    await supabase.auth.signOut();
    set({ busy: false, message: null });
  },

  async syncNow() {
    if (timer) clearTimeout(timer);
    timer = null;
    await runSync();
  },

  async playHero(id) {
    const db = supabase;
    const session = get().session;
    if (!db || !session) return false;
    const meta = get().meta;
    const head = headSeq();
    if (head > 0 && (meta.characterId === null || meta.syncedSeq < head)) {
      set({ message: "This device has progress that isn't saved to an account yet. Sync it first, or erase it with Start over in Camp." });
      return false;
    }
    set({ busy: true, message: null });
    try {
      const events = await fetchEvents(db, id, 0);
      await applyLog(events);
      await setMeta({ characterId: id, ownerId: session.user.id, syncedSeq: events.at(-1)?.seq ?? 0 });
      set({ status: "synced", lastSyncedAt: Date.now() });
      return true;
    } catch (e) {
      set({ message: describe(e) });
      return false;
    } finally {
      set({ busy: false });
    }
  },

  async exportData() {
    const db = supabase;
    const session = get().session;
    if (!db || !session) return;
    set({ busy: true, message: null });
    try {
      const server = await exportAccount(db, session.user);
      const device = { rules: RULES_VERSION, sync: get().meta, events: useGame.getState().events };
      const json = JSON.stringify({ exportedAt: new Date().toISOString(), ...server, device }, null, 2);
      await saveExport(`healthrpg-export-${new Date().toISOString().slice(0, 10)}.json`, json);
    } catch (e) {
      set({ message: describe(e) });
    } finally {
      set({ busy: false });
    }
  },

  async deleteAccount() {
    const db = supabase;
    if (!db || !get().session) return false;
    set({ busy: true, message: null });
    try {
      await deleteAccount(db);
      await db.auth.signOut({ scope: "local" });
      await setMeta(UNLINKED);
      set({ session: null, status: "signed_out", heroes: [], message: "Your account and everything stored with it have been deleted. This device's save is still here; you can erase it with Start over in Camp." });
      return true;
    } catch (e) {
      set({ message: describe(e) });
      return false;
    } finally {
      set({ busy: false });
    }
  },

  clearMessage() {
    set({ message: null });
  },
}));
