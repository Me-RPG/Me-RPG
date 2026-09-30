-- Phase 6: accounts and sync.
--
-- The save file is the event log, so the server stores each hero's log and nothing derived from it.
-- Every table has row-level security: a signed-in user can read only their own rows. Clients never
-- write tables directly; they call push_events(), which checks ownership and keeps each log
-- append-only and contiguous. Deleting the auth user cascades to everything they own.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- A hero (one save). The id is generated on the device so a push can be retried safely.
create table public.characters (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text,
  rules_version text not null,
  head_seq integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index characters_user_id_idx on public.characters (user_id);

create table public.events (
  character_id uuid not null references public.characters (id) on delete cascade,
  seq integer not null check (seq > 0),
  user_id uuid not null references auth.users (id) on delete cascade,
  day integer not null,
  type text not null,
  body jsonb not null,
  rules_version text not null,
  received_at timestamptz not null default now(),
  primary key (character_id, seq)
);
create index events_user_id_idx on public.events (user_id);

alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.events enable row level security;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users read their own heroes" on public.characters
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users read their own events" on public.events
  for select to authenticated using ((select auth.uid()) = user_id);

-- Reads only. Writes go through the functions below.
revoke all on public.profiles, public.characters, public.events from anon;
revoke insert, update, delete, truncate on public.profiles, public.characters, public.events from authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Append events to one of the caller's heroes, creating the hero on its first push. Events already
-- stored are accepted again only if identical, so a retried push is harmless. Returns the stored
-- head seq. Errors use PostgREST's PTxxx codes so the client sees a meaningful HTTP status.
create function public.push_events(p_character_id uuid, p_rules_version text, p_events jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  owner_id uuid;
  head integer;
  e jsonb;
  s integer;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = 'PT401';
  end if;
  if p_character_id is null or jsonb_typeof(p_events) is distinct from 'array' then
    raise exception 'push_events needs a hero id and an array of events' using errcode = 'PT400';
  end if;
  if jsonb_array_length(p_events) > 500 then
    raise exception 'push at most 500 events at a time' using errcode = 'PT413';
  end if;

  insert into public.characters (id, user_id, rules_version)
  values (p_character_id, uid, p_rules_version)
  on conflict (id) do nothing;

  select c.user_id, c.head_seq into owner_id, head
  from public.characters c
  where c.id = p_character_id
  for update;

  if owner_id is distinct from uid then
    raise exception 'unknown hero' using errcode = 'PT403';
  end if;

  for e in select value from jsonb_array_elements(p_events) order by (value->>'seq')::integer loop
    s := (e->>'seq')::integer;
    if s <= head then
      if not exists (
        select 1 from public.events ev
        where ev.character_id = p_character_id and ev.seq = s and ev.body = e
      ) then
        raise exception 'event % differs from the stored log', s using errcode = 'PT409';
      end if;
    elsif s = head + 1 then
      insert into public.events (character_id, seq, user_id, day, type, body, rules_version)
      values (p_character_id, s, uid, (e->>'day')::integer, e->>'type', e, p_rules_version);
      head := s;
    else
      raise exception 'event % leaves a gap after %', coalesce(s::text, '(no seq)'), head using errcode = 'PT400';
    end if;
  end loop;

  update public.characters c
  set head_seq = head,
      rules_version = p_rules_version,
      updated_at = now(),
      name = coalesce(c.name, (
        select ev.body->>'name' from public.events ev
        where ev.character_id = p_character_id and ev.seq = 1 and ev.type = 'CharacterCreated'
      ))
  where c.id = p_character_id;

  return head;
end;
$$;

-- In-app account deletion (App Store and GDPR, research/r8). Cascades to profile, heroes and events.
create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = 'PT401';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.push_events(uuid, text, jsonb) from public, anon;
revoke execute on function public.delete_account() from public, anon;
grant execute on function public.push_events(uuid, text, jsonb) to authenticated;
grant execute on function public.delete_account() to authenticated;
