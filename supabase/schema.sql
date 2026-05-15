create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles alter column role set default 'customer';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'customer'));

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sport_type text not null,
  description text,
  surface text,
  location text,
  price_per_hour integer not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.courts add column if not exists slug text;
alter table public.courts add column if not exists surface text;
alter table public.courts add column if not exists location text;
alter table public.courts alter column description drop not null;
alter table public.courts alter column image_url drop not null;
alter table public.courts alter column price_per_hour type integer using price_per_hour::integer;
alter table public.courts alter column is_active set default true;

update public.courts
set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
where slug is null;

alter table public.courts alter column slug set not null;
alter table public.courts alter column price_per_hour set not null;

create unique index if not exists courts_slug_unique on public.courts (slug);
create unique index if not exists courts_name_unique on public.courts (name);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending',
  total_price integer,
  created_at timestamptz not null default now()
);

alter table public.reservations add column if not exists total_price integer;
alter table public.reservations alter column status set default 'pending';

update public.reservations set status = 'pending' where status = 'pendiente';
update public.reservations set status = 'confirmed' where status = 'confirmada';
update public.reservations set status = 'cancelled' where status = 'cancelada';

alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations
  add constraint reservations_status_check check (status in ('pending', 'confirmed', 'cancelled'));

alter table public.reservations drop constraint if exists reservation_time_order;
alter table public.reservations
  add constraint reservation_time_order check (end_time > start_time);

drop index if exists reservations_unique_active_slot;
create unique index reservations_unique_active_slot
  on public.reservations (court_id, reservation_date, start_time)
  where status in ('pending', 'confirmed');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.has_active_reservation(
  p_court_id uuid,
  p_reservation_date date,
  p_start_time time
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reservations
    where court_id = p_court_id
      and reservation_date = p_reservation_date
      and start_time = p_start_time
      and status in ('pending', 'confirmed')
  );
$$;

grant execute on function public.has_active_reservation(uuid, date, time) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Public can read active courts" on public.courts;
create policy "Public can read active courts"
  on public.courts for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage courts" on public.courts;
create policy "Admins can manage courts"
  on public.courts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can create reservations" on public.reservations;
create policy "Public can create reservations"
  on public.reservations for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and reservation_date >= current_date
    and exists (
      select 1
      from public.courts
      where courts.id = reservations.court_id
        and courts.is_active = true
    )
  );

drop policy if exists "Admins can read reservations" on public.reservations;
create policy "Admins can read reservations"
  on public.reservations for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update reservations" on public.reservations;
create policy "Admins can update reservations"
  on public.reservations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop function if exists public.get_reservation_receipt(uuid);

create or replace function public.get_reservation_receipt(p_reservation_id uuid)
returns table (
  reservation_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  reservation_date date,
  start_time time,
  end_time time,
  status text,
  total_price integer,
  court_name text,
  court_slug text,
  sport_type text,
  surface text,
  location text,
  price_per_hour integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    reservations.id as reservation_id,
    reservations.customer_name,
    reservations.customer_email,
    reservations.customer_phone,
    reservations.reservation_date,
    reservations.start_time,
    reservations.end_time,
    reservations.status,
    reservations.total_price,
    courts.name as court_name,
    courts.slug as court_slug,
    courts.sport_type,
    courts.surface,
    courts.location,
    courts.price_per_hour
  from public.reservations
  join public.courts on courts.id = reservations.court_id
  where reservations.id = p_reservation_id
  limit 1;
$$;

grant execute on function public.get_reservation_receipt(uuid) to anon, authenticated;

insert into public.courts (
  slug,
  name,
  sport_type,
  description,
  surface,
  location,
  price_per_hour,
  image_url,
  is_active
)
values
  (
    'cancha-norte',
    'Cancha Norte',
    'Fútbol 5',
    'Césped sintético premium, iluminación LED y zona de espera para equipos.',
    'Césped sintético premium',
    'Monte Grande, Buenos Aires',
    18000,
    'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1000&q=80',
    true
  ),
  (
    'arena-verde',
    'Arena Verde',
    'Pádel',
    'Cancha vidriada con superficie profesional y excelente visibilidad para partidos nocturnos.',
    'Blindex y césped fibrilado',
    'Monte Grande, Buenos Aires',
    14500,
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80',
    true
  ),
  (
    'central-club',
    'Central Club',
    'Tenis',
    'Superficie rápida, vestuarios cercanos y turnos disponibles durante la semana.',
    'Superficie rápida',
    'Monte Grande, Buenos Aires',
    16000,
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  sport_type = excluded.sport_type,
  description = excluded.description,
  surface = excluded.surface,
  location = excluded.location,
  price_per_hour = excluded.price_per_hour,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

insert into storage.buckets (id, name, public)
values ('court-images', 'court-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read court images" on storage.objects;
create policy "Public can read court images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'court-images');

drop policy if exists "Admins can manage court images" on storage.objects;
create policy "Admins can manage court images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'court-images' and public.is_admin())
  with check (bucket_id = 'court-images' and public.is_admin());
