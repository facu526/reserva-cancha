import { ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { CourtCard } from "@/components/CourtCard";
import { EmptyState } from "@/components/EmptyState";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { benefits } from "@/lib/brand";
import { getActiveCourts } from "@/lib/courts";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import type { Court } from "@/lib/types";

const peakTimes = ["18:00", "19:00", "20:00", "21:00", "17:00", "22:00", "16:00", "15:00", "14:00", "13:00", "12:00", "11:00", "10:00", "09:00", "08:00", "23:00"];

type HeroAvailability = {
  dayLabel: "Hoy" | "Mañana" | "Consultar";
  timeLabel: string;
  sportLabel: string;
};

const heroAvailabilityFallback: HeroAvailability = {
  dayLabel: "Consultar",
  timeLabel: "Disponibilidad",
  sportLabel: "Turnos online"
};

export default async function HomePage() {
  const [courts, settings] = await Promise.all([getActiveCourts(), getSiteSettings()]);
  const featuredCourts = courts.slice(0, 3);
  const heroAvailability = await getHeroAvailability(courts);
  const dynamicContactItems = [
    { icon: MapPin, label: "Ubicación", value: settings.location },
    { icon: Clock, label: "Horarios", value: settings.opening_hours },
    { icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp }
  ];

  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        <section className="relative border-b border-black/5 bg-[radial-gradient(circle_at_15%_15%,rgba(31,157,85,0.18),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f1faf3_55%,#ffffff_100%)]">
          {settings.hero_image_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
              style={{ backgroundImage: `url(${settings.hero_image_url})` }}
            />
          ) : null}
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-field-100/50 blur-3xl" />
          <div className="container-page relative grid min-h-[720px] items-center gap-10 py-14 lg:min-h-[640px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:py-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-field-100 bg-white/[0.8] px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <CheckCircle2 size={16} />
                {settings.hero_badge_text}
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-ink sm:text-5xl lg:text-5xl">
                {settings.hero_title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink/68 lg:text-base lg:leading-7">{settings.hero_subtitle}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-6">
                <ButtonLink href="/canchas" className="gap-2">
                  {settings.primary_cta_label}
                  <ArrowRight size={18} />
                </ButtonLink>
                <ButtonLink href="#contacto" variant="secondary">
                  Ver ubicación
                </ButtonLink>
              </div>

              <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-7">
                <InfoPill icon={Clock} label={settings.opening_hours} />
                <InfoPill icon={MapPin} label={settings.location} />
                <InfoPill icon={MessageCircle} label={settings.whatsapp} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 hidden rounded-2xl bg-white p-4 shadow-soft sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-field-700">{heroAvailability.dayLabel}</p>
                <p className="mt-1 text-2xl font-bold text-ink">{heroAvailability.timeLabel}</p>
                <p className="text-sm text-ink/55">{heroAvailability.sportLabel}</p>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-white bg-ink p-3 shadow-soft">
                <div
                  className="min-h-[460px] overflow-hidden rounded-[22px] bg-cover bg-center lg:min-h-[410px]"
                  style={{ backgroundImage: `url(${settings.home_featured_image_url ?? ""})` }}
                >
                  <div className="flex min-h-[460px] flex-col justify-end bg-gradient-to-t from-black/80 via-black/25 to-transparent p-6 text-white sm:p-8 lg:min-h-[410px] lg:p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-field-100">{settings.club_name}</p>
                    <h2 className="mt-2 text-3xl font-bold sm:text-4xl lg:text-3xl">{settings.home_card_title}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/76">{settings.home_card_subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-14 lg:py-12">
          <SectionHeading eyebrow="Canchas destacadas" title="Espacios preparados para jugar mejor" />
          {featuredCourts.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-7 lg:gap-4">
              {featuredCourts.map((court) => (
                <CourtCard court={court} featured key={court.id} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState icon={CalendarDays} title="Canchas en actualización" text="Estamos organizando la disponibilidad. Volvé a consultar en unos minutos." />
            </div>
          )}
        </section>

        <section id="como-funciona" className="bg-white py-14 lg:py-12">
          <div className="container-page">
            <SectionHeading eyebrow="Cómo funciona" title="Reservá en tres pasos" />
            <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-7 lg:gap-4">
              {[
                { icon: Search, title: "Elegí la cancha", text: "Compará deportes, superficies, capacidad y precio por hora." },
                { icon: CalendarDays, title: "Seleccioná horario", text: "Tomá un turno disponible de mañana, tarde o noche." },
                { icon: CheckCircle2, title: "Confirmá tus datos", text: "Dejá tu contacto para que el equipo valide la reserva." }
              ].map((item, index) => (
                <article className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-6 shadow-sm lg:p-5" key={item.title}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-field-600 text-white">
                      <item.icon size={22} />
                    </span>
                    <span className="text-4xl font-bold text-field-100">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-ink lg:mt-5 lg:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/62">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-14 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-6">
            <SectionHeading eyebrow="Beneficios" title="Una experiencia cómoda para jugadores exigentes" text="Turnos claros, espacios cuidados y atención cercana para que el partido empiece antes de llegar al club." />
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((item) => (
                <article className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm lg:p-4" key={item.title}>
                  <item.icon className="text-field-700" size={25} />
                  <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/62">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="container-page py-14 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
            <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-soft sm:p-8 lg:p-6">
              <SectionHeading eyebrow="Ubicación y contacto" title={settings.club_name} text={`Estamos en ${settings.location}, con acceso cómodo y atención todos los días.`} />
              <div className="mt-7 grid gap-4">
                {dynamicContactItems.map((item) => (
                  <div className="flex gap-3 rounded-2xl bg-field-50 p-4" key={item.label}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-field-700 shadow-sm">
                      <item.icon size={19} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-ink/64">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="min-h-[360px] overflow-hidden rounded-[28px] bg-cover bg-center shadow-soft"
              style={{ backgroundImage: `url(${settings.contact_image_url ?? ""})` }}
            >
              <div className="flex h-full min-h-[360px] items-end bg-gradient-to-t from-black/70 via-black/15 to-transparent p-6 text-white sm:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-field-100">Abierto todos los días</p>
                  <h3 className="mt-2 text-3xl font-bold">{settings.opening_hours.replace("Lunes a domingo de ", "")}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page pb-14 lg:pb-12">
          <div className="rounded-[28px] bg-field-600 p-7 text-white shadow-soft sm:p-10 md:flex md:items-center md:justify-between md:gap-8 lg:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-field-100">Tu próximo partido empieza acá</p>
              <h2 className="mt-2 text-3xl font-bold lg:text-2xl">Reservá una cancha en {settings.club_name}</h2>
            </div>
            <ButtonLink href="/canchas" variant="secondary" className="mt-6 shrink-0 md:mt-0">
              {settings.primary_cta_label}
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-semibold text-field-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[2rem]">{title}</h2>
      {text ? <p className="mt-3 text-base leading-7 text-ink/62 lg:text-sm lg:leading-6">{text}</p> : null}
    </div>
  );
}

function InfoPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/[0.78] px-3 py-3 text-sm font-semibold text-ink/68 shadow-sm">
      <Icon className="shrink-0 text-field-700" size={17} />
      <span className="leading-5">{label}</span>
    </div>
  );
}

async function getHeroAvailability(courts: Court[]): Promise<HeroAvailability> {
  if (!hasSupabaseEnv() || !courts.length) {
    return heroAvailabilityFallback;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const orderedCourts = await getCourtsByDemand(courts);
    const today = getDateString(0);
    const tomorrow = getDateString(1);

    for (const { date, dayLabel } of [
      { date: today, dayLabel: "Hoy" as const },
      { date: tomorrow, dayLabel: "Mañana" as const }
    ]) {
      for (const court of orderedCourts) {
        const { data, error } = await supabase.rpc("get_public_availability", {
          p_court_id: court.id,
          p_reservation_date: date
        });

        if (error || !Array.isArray(data)) {
          continue;
        }

        const availableTimes = new Set(
          data
            .filter((slot) => slot?.is_available === true)
            .map((slot) => normalizeTime(slot?.start_time))
            .filter((time): time is string => Boolean(time))
        );
        const timeLabel = peakTimes.find((time) => availableTimes.has(time));

        if (timeLabel) {
          return {
            dayLabel,
            timeLabel,
            sportLabel: `${court.sport_type} disponible`
          };
        }
      }
    }
  } catch (error) {
    console.error("Could not resolve hero availability.", error);
  }

  return heroAvailabilityFallback;
}

async function getCourtsByDemand(courts: Court[]) {
  const fallback = courts;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_public_courts_by_demand");

    if (error || !Array.isArray(data)) {
      return fallback;
    }

    const order = new Map<string, number>();
    data.forEach((row, index) => {
      if (row?.court_id) {
        order.set(String(row.court_id), index);
      }
    });

    return [...courts].sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER));
  } catch {
    return fallback;
  }
}

function getDateString(daysToAdd: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

function normalizeTime(value: unknown) {
  return typeof value === "string" ? value.slice(0, 5) : null;
}
