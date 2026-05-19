import Image from "next/image";
import { ArrowRight, Clock3, Layers, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { getCourtSpec } from "@/lib/brand";
import { currency } from "@/lib/utils";
import type { Court } from "@/lib/types";

export function CourtCard({ court, featured = false }: { court: Court; featured?: boolean }) {
  const spec = getCourtSpec(court.sport_type);
  const reservationHref = `/reservar/${court.slug ?? court.id}`;
  const surface = court.surface ?? spec.surface;
  const capacity = court.player_count ? `${court.player_count} jugadores` : spec.capacity;
  const availability = court.slot_duration_minutes ? `Turnos cada ${court.slot_duration_minutes} min` : spec.availability;
  const imageUrl = court.image_url ?? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-field-50">
        <Image
          src={imageUrl}
          alt={court.name}
          fill
          sizes={featured ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/[0.92] px-3 py-1 text-xs font-bold text-field-700 shadow-sm">
          {court.sport_type}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <h3 className="text-2xl font-bold">{court.name}</h3>
            <p className="mt-1 text-sm text-white/75">{surface}</p>
          </div>
          <div className="rounded-xl bg-white/[0.95] px-3 py-2 text-right text-ink shadow-sm">
            <p className="text-sm font-bold">{currency(court.price_per_hour)}</p>
            <p className="text-[11px] font-medium text-ink/55">por hora</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="line-clamp-2 text-sm leading-6 text-ink/65">{court.description ?? "Cancha profesional con turnos disponibles durante la semana."}</p>

        <div className="grid gap-2 text-sm text-ink/68">
          <p className="flex items-center gap-2">
            <Layers size={16} className="text-field-700" />
            {surface}
          </p>
          <p className="flex items-center gap-2">
            <Users size={16} className="text-field-700" />
            {capacity}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 size={16} className="text-field-700" />
            {availability}
          </p>
        </div>

        <ButtonLink href={reservationHref} className="w-full gap-2 py-3">
          Reservar
          <ArrowRight size={17} />
        </ButtonLink>
      </div>
    </article>
  );
}
