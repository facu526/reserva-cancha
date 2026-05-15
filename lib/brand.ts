import { Clock, MapPin, MessageCircle, ShieldCheck, Trophy, Users } from "lucide-react";

export const brand = {
  appName: "Reserva Cancha",
  clubName: "Club Deportivo Norte",
  location: "Monte Grande, Buenos Aires",
  hours: "Lunes a domingo de 08:00 a 00:00",
  whatsapp: "+54 9 11 2345-6789",
  email: "reservas@clubdeportivonorte.com",
  address: "Av. Boulevard Buenos Aires 1840",
  tagline: "Canchas premium, reservas simples y una experiencia pensada para jugar mejor."
};

export const courtSpecs: Record<string, { surface: string; capacity: string; availability: string }> = {
  "Fútbol 5": {
    surface: "Césped sintético premium",
    capacity: "10 jugadores",
    availability: "Turnos cada 60 min"
  },
  Pádel: {
    surface: "Blindex y césped fibrilado",
    capacity: "4 jugadores",
    availability: "Turnos cada 90 min"
  },
  Tenis: {
    surface: "Superficie rápida",
    capacity: "Singles o dobles",
    availability: "Turnos diurnos y nocturnos"
  }
};

export function getCourtSpec(sportType: string) {
  return (
    courtSpecs[sportType] ?? {
      surface: "Superficie profesional",
      capacity: "Reserva por equipo",
      availability: "Horarios disponibles"
    }
  );
}

export const stats = [
  { label: "turnos mensuales", value: "+1.200" },
  { label: "canchas activas", value: "8" },
  { label: "deportes", value: "3" },
  { label: "valoración promedio", value: "4.8" }
];

export const benefits = [
  {
    icon: Trophy,
    title: "Canchas cuidadas",
    text: "Superficies mantenidas, iluminación LED y espacios listos para competir o entrenar."
  },
  {
    icon: Clock,
    title: "Reservas ágiles",
    text: "Elegí cancha, fecha y horario sin llamados ni esperas innecesarias."
  },
  {
    icon: Users,
    title: "Para grupos",
    text: "Opciones para partidos entre amigos, entrenamientos y torneos internos."
  },
  {
    icon: ShieldCheck,
    title: "Turnos ordenados",
    text: "Cada reserva queda registrada para evitar cruces y confirmar disponibilidad."
  }
];

export const contactItems = [
  { icon: MapPin, label: "Ubicación", value: `${brand.address}, ${brand.location}` },
  { icon: Clock, label: "Horarios", value: brand.hours },
  { icon: MessageCircle, label: "WhatsApp", value: brand.whatsapp }
];
