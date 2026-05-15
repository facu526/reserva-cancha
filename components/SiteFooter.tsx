import Link from "next/link";
import { CalendarCheck, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-ink text-white">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-field-600">
              <CalendarCheck size={21} />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-field-100">{brand.clubName}</p>
              <h2 className="text-xl font-bold">{brand.appName}</h2>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">{brand.tagline}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">Reservas</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <Link href="/canchas" className="hover:text-white">
              Ver canchas
            </Link>
            <Link href="/#como-funciona" className="hover:text-white">
              Cómo funciona
            </Link>
            <Link href="/#contacto" className="hover:text-white">
              Contacto
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">Contacto</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 shrink-0 text-field-100" size={16} />
              {brand.location}
            </p>
            <p className="flex gap-2">
              <Clock className="mt-0.5 shrink-0 text-field-100" size={16} />
              {brand.hours}
            </p>
            <p className="flex gap-2">
              <MessageCircle className="mt-0.5 shrink-0 text-field-100" size={16} />
              {brand.whatsapp}
            </p>
            <p className="flex gap-2">
              <Mail className="mt-0.5 shrink-0 text-field-100" size={16} />
              {brand.email}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {brand.clubName}. Todos los derechos reservados.</p>
          <p>Monte Grande, Buenos Aires</p>
        </div>
      </div>
    </footer>
  );
}
