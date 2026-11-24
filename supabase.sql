-- Run this once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists public.records (
  id text primary key,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.records enable row level security;

-- Anyone with your site link and anon key can read and write.
-- Fine for a private family app. Do not store anything sensitive here.
create policy "family read"   on public.records for select to anon using (true);
create policy "family insert" on public.records for insert to anon with check (true);
create policy "family update" on public.records for update to anon using (true) with check (true);
create policy "family delete" on public.records for delete to anon using (true);
