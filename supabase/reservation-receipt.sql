drop function if exists public.get_reservation_receipt(uuid);

alter table public.reservations add column if not exists user_id uuid references auth.users(id) on delete set null;

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

grant execute on function public.get_reservation_receipt(uuid) to authenticated;
