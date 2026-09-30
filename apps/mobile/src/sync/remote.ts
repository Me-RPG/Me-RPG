import type { GameEvent } from "@healthrpg/engine";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Server calls for sync (tables and functions in supabase/migrations). */

const PAGE = 1000; // PostgREST's default row cap
const PUSH_BATCH = 500; // push_events refuses more per call

export interface HeroSummary {
  id: string;
  name: string | null;
  headSeq: number;
  updatedAt: string;
}

export class RemoteError extends Error {
  constructor(message: string, readonly code: string, readonly offline: boolean) {
    super(message);
  }
}

function fail(error: { message: string; code?: string }): never {
  const code = error.code ?? "";
  throw new RemoteError(error.message, code, code === "" && /fetch|network|timed? ?out|abort/i.test(error.message));
}

/** A hero's events after `afterSeq`, in order. */
export async function fetchEvents(db: SupabaseClient, characterId: string, afterSeq: number): Promise<GameEvent[]> {
  const out: GameEvent[] = [];
  for (let last = afterSeq; ; ) {
    const { data, error } = await db.from("events").select("body").eq("character_id", characterId).gt("seq", last).order("seq").limit(PAGE);
    if (error) fail(error);
    const page = (data as { body: GameEvent }[]).map((r) => r.body);
    out.push(...page);
    if (page.length < PAGE) return out;
    last = page[page.length - 1]!.seq;
  }
}

/** Append events in batches; `onStored` gets the server's head seq after each batch. */
export async function pushEvents(db: SupabaseClient, characterId: string, rules: string, events: readonly GameEvent[], onStored: (head: number) => Promise<void>) {
  for (let i = 0; i < events.length; i += PUSH_BATCH) {
    const { data, error } = await db.rpc("push_events", { p_character_id: characterId, p_rules_version: rules, p_events: events.slice(i, i + PUSH_BATCH) });
    if (error) fail(error);
    await onStored(data as number);
  }
}

export async function listHeroes(db: SupabaseClient): Promise<HeroSummary[]> {
  const { data, error } = await db.from("characters").select("id, name, head_seq, updated_at").order("updated_at", { ascending: false });
  if (error) fail(error);
  return (data as { id: string; name: string | null; head_seq: number; updated_at: string }[]).map((r) => ({ id: r.id, name: r.name, headSeq: r.head_seq, updatedAt: r.updated_at }));
}

async function allRows(db: SupabaseClient, table: string, order: string[]): Promise<unknown[]> {
  const out: unknown[] = [];
  for (;;) {
    let q = db.from(table).select("*");
    for (const col of order) q = q.order(col);
    const { data, error } = await q.range(out.length, out.length + PAGE - 1);
    if (error) fail(error);
    out.push(...data);
    if (data.length < PAGE) return out;
  }
}

/** Everything the server holds for this account (data export, research/r8). */
export async function exportAccount(db: SupabaseClient, user: User) {
  return {
    account: { id: user.id, email: user.email ?? null, createdAt: user.created_at },
    profiles: await allRows(db, "profiles", ["id"]),
    heroes: await allRows(db, "characters", ["created_at", "id"]),
    events: await allRows(db, "events", ["character_id", "seq"]),
  };
}

export async function deleteAccount(db: SupabaseClient) {
  const { error } = await db.rpc("delete_account");
  if (error) fail(error);
}
