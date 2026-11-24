-- MioCare: run this in Supabase SQL Editor AFTER deploying the app update.
-- Only the two caregiver accounts below can access shared records.
alter table public.records enable row level security;
drop policy if exists "family read" on public.records;
drop policy if exists "family insert" on public.records;
drop policy if exists "family update" on public.records;
drop policy if exists "family delete" on public.records;
drop policy if exists "MioCare caregivers read" on public.records;
drop policy if exists "MioCare caregivers insert" on public.records;
drop policy if exists "MioCare caregivers update" on public.records;
drop policy if exists "MioCare caregivers delete" on public.records;
create policy "MioCare caregivers read" on public.records for select to authenticated
using (auth.uid() in ('0e075690-d564-4ead-8cdc-05e20e305f4f'::uuid,'4235a416-c072-4555-aebb-cf12754ceae7'::uuid));
create policy "MioCare caregivers insert" on public.records for insert to authenticated
with check (auth.uid() in ('0e075690-d564-4ead-8cdc-05e20e305f4f'::uuid,'4235a416-c072-4555-aebb-cf12754ceae7'::uuid));
create policy "MioCare caregivers update" on public.records for update to authenticated
using (auth.uid() in ('0e075690-d564-4ead-8cdc-05e20e305f4f'::uuid,'4235a416-c072-4555-aebb-cf12754ceae7'::uuid))
with check (auth.uid() in ('0e075690-d564-4ead-8cdc-05e20e305f4f'::uuid,'4235a416-c072-4555-aebb-cf12754ceae7'::uuid));
create policy "MioCare caregivers delete" on public.records for delete to authenticated
using (auth.uid() in ('0e075690-d564-4ead-8cdc-05e20e305f4f'::uuid,'4235a416-c072-4555-aebb-cf12754ceae7'::uuid));
