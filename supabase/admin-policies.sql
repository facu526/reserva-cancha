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

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Admins can manage courts" on public.courts;
drop policy if exists "Admins can read courts" on public.courts;
drop policy if exists "Admins can update courts" on public.courts;
drop policy if exists "Admins can read reservations" on public.reservations;
drop policy if exists "Admins can update reservations" on public.reservations;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

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

grant select on public.profiles to authenticated;
grant select, update on public.courts to authenticated;
grant select, update on public.reservations to authenticated;
