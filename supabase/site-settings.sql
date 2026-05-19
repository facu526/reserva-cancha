-- Site settings table and RLS policies.
-- Safe to run multiple times in Supabase SQL editor for future deployments.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.courts add column if not exists player_count integer;
alter table public.courts add column if not exists slot_duration_minutes integer default 60;

alter table public.courts drop constraint if exists courts_price_non_negative;
alter table public.courts
  add constraint courts_price_non_negative check (price_per_hour >= 0);

alter table public.courts drop constraint if exists courts_slot_duration_positive;
alter table public.courts
  add constraint courts_slot_duration_positive check (slot_duration_minutes is null or slot_duration_minutes > 0);

alter table public.courts drop constraint if exists courts_player_count_non_negative;
alter table public.courts
  add constraint courts_player_count_non_negative check (player_count is null or player_count >= 0);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  key,
  value
)
values (
  'main',
  '{
    "club_name": "Club Deportivo Norte",
    "site_name": "Reserva Cancha",
    "hero_title": "Canchas listas para tu próximo partido",
    "hero_subtitle": "Canchas premium, reservas simples y una experiencia pensada para jugar mejor.",
    "location": "Monte Grande, Buenos Aires",
    "phone": "+54 9 11 2345-6789",
    "whatsapp": "+54 9 11 2345-6789",
    "email": "reservas@clubdeportivonorte.com",
    "opening_hours": "Lunes a domingo de 08:00 a 00:00",
    "footer_description": "Canchas premium, reservas simples y una experiencia pensada para jugar mejor.",
    "primary_cta_label": "Reservar cancha",
    "hero_badge_text": "Reservas online en Monte Grande, Buenos Aires",
    "home_card_title": "Fútbol, pádel y tenis todos los días",
    "home_card_subtitle": "Elegí tu cancha, seleccioná un horario y dejá la reserva registrada en segundos."
  }'::jsonb
)
on conflict (key) do nothing;

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_site_settings_updated_at();

alter table public.site_settings enable row level security;
alter table public.courts enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;
drop policy if exists "Admins can insert site settings" on public.site_settings;
drop policy if exists "Admins can delete site settings" on public.site_settings;

create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admins can insert site settings"
on public.site_settings
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update site settings"
on public.site_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete site settings"
on public.site_settings
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can read active courts" on public.courts;
drop policy if exists "Admins can manage courts" on public.courts;
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

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant select on public.courts to anon, authenticated;
grant insert, update on public.courts to authenticated;
