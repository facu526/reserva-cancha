import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { cn, currency, formatDate } from "@/lib/utils";

export const metadata = {
  title: `Mis reservas | ${brand.clubName}`
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

const statusStyles: Record<ReservationStatus, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
  confirmed: "border-field-100 bg-field-50 text-field-700",
  cancelled: "border-red-200 bg-red-50 text-red-700"
};

export default async function MyReservationsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <>
        <SiteHeader />
        <main className="container-page grid min-h-[70vh] place-items-center py-12">
          <ErrorMessage>El servicio de cuentas todavía no está conectado. Probá nuevamente más tarde.</ErrorMessage>
        </main>
        <SiteFooter />
      </>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?callbackUrl=/mis-reservas");
  }

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("*, courts(name, sport_type)")
    .eq("user_id", user.id)
    .order("reservation_date", { ascending: false })
    .order("start_time", { ascending: true });

  const typedReservations = (reservations ?? []) as Reservation[];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,#f1faf3_100%)]">
          <div className="container-page py-10 sm:py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <CalendarClock size={16} />
                Cuenta de jugador
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">Mis reservas</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/65">
                Consultá tus turnos, estado de confirmación y comprobantes de reserva en {brand.clubName}.
              </p>
            </div>
          </div>
        </section>

        <section className="container-page py-10 sm:py-12">
          {error ? <ErrorMessage>No pudimos cargar tus reservas. Intentá nuevamente en unos minutos.</ErrorMessage> : null}

          {!error && typedReservations.length ? (
            <div className="grid gap-4">
              {typedReservations.map((reservation) => (
                <ReservationCard reservation={reservation} key={reservation.id} />
              ))}
            </div>
          ) : null}

          {!error && !typedReservations.length ? (
            <EmptyState
              icon={Clock3}
              title="Todavía no tenés reservas"
              text="Cuando reserves una cancha, tus turnos aparecerán en esta sección."
            >
              <ButtonLink href="/canchas" className="mt-5">
                Ver canchas disponibles
              </ButtonLink>
            </EmptyState>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-field-700">{reservation.courts?.sport_type ?? "Cancha"}</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">{reservation.courts?.name ?? "Cancha reservada"}</h2>
          <p className="mt-2 text-sm text-ink/58">
            {formatDate(reservation.reservation_date)} · {formatTime(reservation.start_time)} a {formatTime(reservation.end_time)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Precio estimado" value={currency(reservation.total_price ?? 0)} />
        <SummaryItem label="Contacto" value={reservation.customer_phone} />
        <SummaryItem label="Email" value={reservation.customer_email} />
        <SummaryItem label="Estado" value={statusLabels[reservation.status]} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/reserva-exitosa?id=${reservation.id}`}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-field-600 px-4 py-3 text-sm font-semibold text-white hover:bg-field-700"
        >
          <CheckCircle2 size={17} />
          Ver comprobante
        </Link>
        <ButtonLink href="/canchas" variant="secondary">
          Reservar otra cancha
        </ButtonLink>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const Icon = status === "confirmed" ? CheckCircle2 : status === "cancelled" ? XCircle : Clock3;

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold", statusStyles[status])}>
      <Icon size={16} />
      {statusLabels[status]}
    </span>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fbfdfb] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function formatTime(value: string) {
  return value.slice(0, 5);
}
