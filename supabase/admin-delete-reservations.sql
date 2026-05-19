-- Fix real availability by checking overlapping active reservations.
-- Also allows admins to delete reservations from the management panel.

alter table public.reservations enable row level security;

create index if not exists reservations_availability_lookup_idx
on public.reservations (court_id, reservation_date, start_time, end_time, status);

create or replace function public.has_overlapping_reservation(
  p_court_id uuid,
  p_reservation_date date,
  p_start_time time,
  p_end_time time
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
      and status in ('pending', 'pendiente', 'confirmed', 'confirmada')
      and start_time < p_end_time
      and end_time > p_start_time
  );
$$;

grant execute on function public.has_overlapping_reservation(uuid, date, time, time) to anon, authenticated;

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
  select public.has_overlapping_reservation(
    p_court_id,
    p_reservation_date,
    p_start_time,
    p_start_time + interval '1 hour'
  );
$$;

grant execute on function public.has_active_reservation(uuid, date, time) to anon, authenticated;

create or replace function public.get_public_availability(
  p_court_id uuid,
  p_reservation_date date
)
returns table (
  start_time text,
  end_time text,
  is_available boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_duration integer := 60;
  v_opening_hours text;
  v_opens_text text;
  v_closes_text text;
  v_opens_at time := '08:00'::time;
  v_closes_at time := '00:00'::time;
  v_opens_minute integer;
  v_closes_minute integer;
begin
  if not exists (
    select 1
    from public.courts
    where courts.id = p_court_id
      and courts.is_active = true
  ) then
    return;
  end if;

  if to_regclass('public.site_settings') is not null then
    execute $settings$
      select
        value->>'opening_hours',
        value->>'opens_at',
        value->>'closes_at'
      from public.site_settings
      where key = 'main'
      limit 1
    $settings$
    into v_opening_hours, v_opens_text, v_closes_text;
  end if;

  if v_opens_text is null and v_opening_hours ~ '[0-2][0-9]:[0-5][0-9]' then
    v_opens_text := substring(v_opening_hours from '([0-2][0-9]:[0-5][0-9])');
  end if;

  if v_closes_text is null and v_opening_hours ~ '[0-2][0-9]:[0-5][0-9].*[0-2][0-9]:[0-5][0-9]' then
    v_closes_text := regexp_replace(v_opening_hours, '^.*([0-2][0-9]:[0-5][0-9]).*$', '\1');
  end if;

  if v_opens_text ~ '^[0-2][0-9]:[0-5][0-9]$' then
    v_opens_at := v_opens_text::time;
  end if;

  if v_closes_text ~ '^[0-2][0-9]:[0-5][0-9]$' then
    v_closes_at := v_closes_text::time;
  end if;

  v_opens_minute := extract(hour from v_opens_at)::int * 60 + extract(minute from v_opens_at)::int;
  v_closes_minute := case
    when v_closes_at = '00:00'::time then 24 * 60
    else extract(hour from v_closes_at)::int * 60 + extract(minute from v_closes_at)::int
  end;

  if v_closes_minute <= v_opens_minute or v_duration <= 0 then
    return;
  end if;

  return query
  with slots as (
    select slot_minute
    from generate_series(v_opens_minute, v_closes_minute - v_duration, v_duration) as slot_minute
  )
  select
    to_char(make_time((slots.slot_minute / 60)::int, (slots.slot_minute % 60)::int, 0), 'HH24:MI') as start_time,
    to_char(
      make_time(
        (((slots.slot_minute + v_duration) % (24 * 60)) / 60)::int,
        ((slots.slot_minute + v_duration) % 60)::int,
        0
      ),
      'HH24:MI'
    ) as end_time,
    not public.has_overlapping_reservation(
      p_court_id,
      p_reservation_date,
      make_time((slots.slot_minute / 60)::int, (slots.slot_minute % 60)::int, 0),
      make_time(
        (((slots.slot_minute + v_duration) % (24 * 60)) / 60)::int,
        ((slots.slot_minute + v_duration) % 60)::int,
        0
      )
    ) as is_available
  from slots
  order by slots.slot_minute;
end;
$$;

grant execute on function public.get_public_availability(uuid, date) to anon, authenticated;

drop policy if exists "Admins can delete reservations" on public.reservations;
create policy "Admins can delete reservations"
on public.reservations
for delete
to authenticated
using (public.is_admin());

grant delete on public.reservations to authenticated;

notify pgrst, 'reload schema';
