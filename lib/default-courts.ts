import type { Court } from "@/lib/types";

export const defaultCourts: Court[] = [
  {
    id: "cancha-norte",
    slug: "cancha-norte",
    name: "Cancha Norte",
    sport_type: "Fútbol 5",
    description: "Césped sintético premium, iluminación LED y zona de espera para equipos.",
    surface: "Césped sintético premium",
    location: "Monte Grande, Buenos Aires",
    price_per_hour: 18000,
    image_url: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1000&q=80",
    player_count: 10,
    slot_duration_minutes: 60,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "arena-verde",
    slug: "arena-verde",
    name: "Arena Verde",
    sport_type: "Pádel",
    description: "Cancha vidriada con superficie profesional y excelente visibilidad para partidos nocturnos.",
    surface: "Blindex y césped fibrilado",
    location: "Monte Grande, Buenos Aires",
    price_per_hour: 14500,
    image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80",
    player_count: 4,
    slot_duration_minutes: 90,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "central-club",
    slug: "central-club",
    name: "Central Club",
    sport_type: "Tenis",
    description: "Superficie rápida, vestuarios cercanos y turnos disponibles durante la semana.",
    surface: "Superficie rápida",
    location: "Monte Grande, Buenos Aires",
    price_per_hour: 16000,
    image_url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80",
    player_count: 4,
    slot_duration_minutes: 60,
    is_active: true,
    created_at: new Date().toISOString()
  }
];
