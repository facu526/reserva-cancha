-- Admin courts fixes.
-- Adds the optional columns used by the admin form and allows admins to insert/update courts.

alter table public.courts enable row level security;

alter table public.courts add column if not exists player_count integer;
alter table public.courts add column if not exists slot_duration_minutes integer default 60;
alter table public.courts alter column slot_duration_minutes set default 60;

alter table public.courts drop constraint if exists courts_slot_duration_positive;
alter table public.courts
  add constraint courts_slot_duration_positive check (slot_duration_minutes is null or slot_duration_minutes > 0);

alter table public.courts drop constraint if exists courts_player_count_non_negative;
alter table public.courts
  add constraint courts_player_count_non_negative check (player_count is null or player_count >= 0);

create unique index if not exists courts_slug_unique on public.courts (slug);

drop policy if exists "Public can read active courts" on public.courts;
drop policy if exists "Admins can read courts" on public.courts;
drop policy if exists "Admins can insert courts" on public.courts;
drop policy if exists "Admins can update courts" on public.courts;

create policy "Public can read active courts"
on public.courts
for select
to anon, authenticated
using (is_active = true or public.is_admin());

create policy "Admins can read courts"
on public.courts
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert courts"
on public.courts
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update courts"
on public.courts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.courts to anon, authenticated;
grant insert, update on public.courts to authenticated;

notify pgrst, 'reload schema';
