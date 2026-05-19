import { CalendarDays, Filter, MapPin } from "lucide-react";
import { CourtCard } from "@/components/CourtCard";
import { EmptyState } from "@/components/EmptyState";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import { getActiveCourts } from "@/lib/courts";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: `Canchas disponibles | ${brand.clubName}`
};

export default async function CourtsPage() {
  const [courts, settings] = await Promise.all([getActiveCourts(), getSiteSettings()]);
  const sports = [...new Set(courts.map((court) => court.sport_type))];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,#f1faf3_100%)]">
          <div className="container-page py-10 sm:py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <MapPin size={16} />
                {settings.location}
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">Canchas disponibles</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65">
                Elegí entre fútbol 5, pádel y tenis. Todas las canchas cuentan con iluminación, mantenimiento frecuente y horarios amplios.
              </p>
            </div>

            {sports.length ? (
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-ink/65">
                  <Filter size={15} />
                  Deportes
                </span>
                {sports.map((sport) => (
                  <span className="rounded-full bg-field-50 px-4 py-2 text-sm font-semibold text-field-700" key={sport}>
                    {sport}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="container-page py-10 sm:py-12">
          {courts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <CourtCard court={court} key={court.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Estamos actualizando la disponibilidad"
              text="Nuestro equipo está organizando los próximos turnos. Consultá nuevamente en unos minutos o contactanos por WhatsApp."
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
