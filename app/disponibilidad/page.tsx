import { CalendarDays, MapPin } from "lucide-react";
import { AvailabilityBrowser } from "@/components/AvailabilityBrowser";
import { EmptyState } from "@/components/EmptyState";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import { getActiveCourts } from "@/lib/courts";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: `Turnos disponibles | ${brand.clubName}`
};

export default async function AvailabilityPage() {
  const [courts, settings] = await Promise.all([getActiveCourts(), getSiteSettings()]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,#f1faf3_100%)]">
          <div className="container-page py-10 sm:py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <MapPin size={16} />
                {settings.club_name}
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">Consultá turnos disponibles</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65">
                Elegí una cancha y una fecha para ver horarios libres en tiempo real.
              </p>
            </div>
          </div>
        </section>

        <section className="container-page py-10 sm:py-12">
          {courts.length ? (
            <AvailabilityBrowser courts={courts} hasSupabase={hasSupabaseEnv()} />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No hay canchas activas"
              text="Cuando el club active canchas, vas a poder consultar acá los turnos disponibles sin iniciar sesión."
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
