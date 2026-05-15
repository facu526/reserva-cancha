alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;

update public.profiles
set role = 'user'
where role = 'customer';

alter table public.profiles alter column role set default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'user'));

alter table public.reservations add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists reservations_user_id_idx on public.reservations (user_id);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin' else 'user' end
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      phone = coalesce(excluded.phone, public.profiles.phone),
      role = case
        when public.profiles.role = 'admin' then 'admin'
        else excluded.role
      end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
    and (
      reservations.user_id = auth.uid()
      or public.is_admin()
    )
  limit 1;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.get_reservation_receipt(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role = 'user');

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'user');

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read active courts" on public.courts;
drop policy if exists "Admins can manage courts" on public.courts;
drop policy if exists "Admins can read courts" on public.courts;
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

create policy "Admins can update courts"
on public.courts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create reservations" on public.reservations;
drop policy if exists "Users can create own reservations" on public.reservations;
drop policy if exists "Users can read own reservations" on public.reservations;
drop policy if exists "Admins can read reservations" on public.reservations;
drop policy if exists "Admins can update reservations" on public.reservations;

create policy "Users can create own reservations"
on public.reservations
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and reservation_date >= current_date
  and exists (
    select 1
    from public.courts
    where courts.id = reservations.court_id
      and courts.is_active = true
  )
);

create policy "Users can read own reservations"
on public.reservations
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read reservations"
on public.reservations
for select
to authenticated
using (public.is_admin());

create policy "Admins can update reservations"
on public.reservations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update on public.profiles to authenticated;
grant select on public.courts to anon, authenticated;
grant update on public.courts to authenticated;
grant select, insert, update on public.reservations to authenticated;
