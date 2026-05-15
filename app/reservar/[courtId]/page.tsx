import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3, Layers, LockKeyhole, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createReservation } from "@/actions/reservations";
import { ButtonLink } from "@/components/ButtonLink";
import { ReservationForm } from "@/components/ReservationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brand, getCourtSpec } from "@/lib/brand";
import { normalizeCourtSlug } from "@/lib/court-slugs";
import { getCourtById } from "@/lib/courts";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function ReservationPage({
  params
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = await params;
  const normalizedCourtId = normalizeCourtSlug(courtId);

  const court = await getCourtById(normalizedCourtId);

  if (!court || !court.is_active) {
    notFound();
  }

  const spec = getCourtSpec(court.sport_type);
  const surface = court.surface ?? spec.surface;
  const imageUrl = court.image_url ?? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";
  const authContext = await getReservationAuthContext();
  const callbackUrl = `/reservar/${normalizedCourtId}`;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,#f1faf3_100%)]">
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <MapPin size={16} />
                {brand.clubName}
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">Reservá {court.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65">{court.description ?? "Cancha profesional con turnos disponibles durante la semana."}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SpecPill icon={Layers} label={surface} />
                <SpecPill icon={Users} label={spec.capacity} />
                <SpecPill icon={Clock3} label={spec.availability} />
              </div>
            </div>
            <div className="overflow-hidden rounded-[26px] border border-white bg-white p-3 shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                <Image src={imageUrl} alt={court.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-sm font-semibold text-field-100">{court.sport_type}</p>
                    <h2 className="mt-1 text-2xl font-bold">{court.name}</h2>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-right text-ink">
                    <p className="text-sm font-bold">{currency(court.price_per_hour)}</p>
                    <p className="text-[11px] font-medium text-ink/55">por hora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-10 sm:py-12">
          {authContext.userId ? (
            <ReservationForm court={court} action={createReservation} customer={authContext.customer} />
          ) : (
            <SessionRequired callbackUrl={callbackUrl} />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

async function getReservationAuthContext() {
  if (!hasSupabaseEnv()) {
    return {
      userId: null,
      customer: null
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      customer: null
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    customer: {
      name: (profile?.full_name as string | null | undefined) ?? "",
      email: user.email ?? "",
      phone: (profile?.phone as string | null | undefined) ?? ""
    }
  };
}

function SessionRequired({ callbackUrl }: { callbackUrl: string }) {
  const encodedCallback = encodeURIComponent(callbackUrl);

  return (
    <section className="mx-auto max-w-3xl rounded-[28px] border border-black/8 bg-white p-6 text-center shadow-soft sm:p-8">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-field-50 text-field-700">
        <LockKeyhole size={28} />
      </div>
      <h2 className="mt-5 text-3xl font-bold text-ink">Para reservar necesitás iniciar sesión o crear una cuenta.</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/62">
        Tu cuenta nos permite asociar la reserva a tus datos y mostrarte el estado del turno cuando el club lo revise.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={`/login?callbackUrl=${encodedCallback}`}>Ingresar</ButtonLink>
        <ButtonLink href={`/registro?callbackUrl=${encodedCallback}`} variant="secondary">
          Crear cuenta
        </ButtonLink>
      </div>
    </section>
  );
}

function SpecPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white px-3 py-3 text-sm font-semibold text-ink/68 shadow-sm">
      <Icon className="shrink-0 text-field-700" size={17} />
      <span className="leading-5">{label}</span>
    </div>
  );
}
