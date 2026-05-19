-- Public demand ranking for active courts.
-- Exposes only court ids and aggregate reservation counts, never customer data.

create or replace function public.get_public_courts_by_demand()
returns table (
  court_id uuid,
  reservation_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    courts.id as court_id,
    count(reservations.id)::bigint as reservation_count
  from public.courts
  left join public.reservations
    on reservations.court_id = courts.id
  where courts.is_active = true
  group by courts.id
  order by reservation_count desc, courts.created_at desc;
$$;

grant execute on function public.get_public_courts_by_demand() to anon, authenticated;

notify pgrst, 'reload schema';
