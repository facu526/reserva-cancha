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
