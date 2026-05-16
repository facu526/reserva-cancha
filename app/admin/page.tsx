import Link from "next/link";
import { CalendarClock, CheckCircle2, CircleDollarSign, Clock3, Home, LayoutDashboard, ShieldAlert, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { updateCourtSettings, signOut, updateReservationStatus } from "@/actions/admin";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { getAdminContext } from "@/lib/admin";
import { brand } from "@/lib/brand";
import type { Court, Reservation, ReservationStatus } from "@/lib/types";
import { cn, currency, formatDate } from "@/lib/utils";

export const metadata = {
  title: `Panel de gestión | ${brand.clubName}`
};

const statuses: ReservationStatus[] = ["pending", "confirmed", "cancelled"];

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

const statusStyles: Record<ReservationStatus, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
  confirmed: "border-field-100 bg-field-50 text-field-700",
  cancelled: "border-red-200 bg-red-50 text-red-700"
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const { supabase, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const [{ data: reservations, error: reservationsError }, { data: courts, error: courtsError }] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, courts(name, sport_type)")
      .order("reservation_date", { ascending: false })
      .order("start_time", { ascending: true }),
    supabase.from("courts").select("*").order("name", { ascending: true })
  ]);

  const typedReservations = (reservations ?? []) as Reservation[];
  const typedCourts = (courts ?? []) as Court[];
  const pendingCount = typedReservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedCount = typedReservations.filter((reservation) => reservation.status === "confirmed").length;
  const cancelledCount = typedReservations.filter((reservation) => reservation.status === "cancelled").length;
  const confirmedIncome = typedReservations
    .filter((reservation) => reservation.status === "confirmed")
    .reduce((total, reservation) => total + (reservation.total_price ?? 0), 0);
  const hasLoadError = Boolean(reservationsError || courtsError);

  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <header className="border-b border-black/5 bg-white">
        <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-field-700">{brand.clubName}</p>
            <h1 className="text-3xl font-bold text-ink">Panel de gestión</h1>
            <p className="mt-1 text-sm text-ink/55">Reservas reales, estados de turnos y disponibilidad de canchas.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-field-50"
            >
              <Home size={17} />
              Inicio
            </Link>
            <form action={signOut}>
              <SubmitButton pendingText="Saliendo..." className="w-full border border-black/10 bg-white px-4 py-2.5 text-ink hover:bg-field-50">
                Cerrar sesión
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-8 py-8">
        {success ? <ActionNotice type="success" code={success} /> : null}
        {error ? <ActionNotice type="error" code={error} /> : null}
        {hasLoadError ? (
          <ErrorMessage>No se pudieron cargar todos los datos del panel. Verificá las políticas de administrador en Supabase.</ErrorMessage>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={LayoutDashboard} title="Reservas totales" value={typedReservations.length.toString()} text="Turnos registrados" />
          <MetricCard icon={Clock3} title="Pendientes" value={pendingCount.toString()} text="Solicitudes por revisar" />
          <MetricCard icon={CheckCircle2} title="Confirmadas" value={confirmedCount.toString()} text="Turnos aprobados" />
          <MetricCard icon={XCircle} title="Canceladas" value={cancelledCount.toString()} text="Turnos dados de baja" />
          <MetricCard icon={CircleDollarSign} title="Ingresos estimados" value={currency(confirmedIncome)} text="Reservas confirmadas" />
        </section>

        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-semibold text-field-700">Reservas</p>
              <h2 className="text-2xl font-bold text-ink">Turnos registrados</h2>
            </div>
            <span className="text-sm text-ink/60">{typedReservations.length} reservas</span>
          </div>

          {typedReservations.length ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/8 text-ink/55">
                      <th className="py-3 pr-4 font-semibold">Cliente</th>
                      <th className="py-3 pr-4 font-semibold">Cancha</th>
                      <th className="py-3 pr-4 font-semibold">Fecha</th>
                      <th className="py-3 pr-4 font-semibold">Horario</th>
                      <th className="py-3 pr-4 font-semibold">Precio</th>
                      <th className="py-3 pr-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typedReservations.map((reservation) => (
                      <ReservationRow reservation={reservation} key={reservation.id} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 lg:hidden">
                {typedReservations.map((reservation) => (
                  <ReservationCard reservation={reservation} key={reservation.id} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="Sin reservas registradas"
              text="Los próximos turnos aparecerán acá cuando los clientes completen una solicitud."
            />
          )}
        </section>

        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-semibold text-field-700">Canchas</p>
              <h2 className="text-2xl font-bold text-ink">Disponibilidad y precios</h2>
            </div>
            <span className="text-sm text-ink/60">{typedCourts.length} canchas</span>
          </div>

          {typedCourts.length ? (
            <div className="grid gap-4">
              {typedCourts.map((court) => (
                <CourtSettingsCard court={court} key={court.id} />
              ))}
            </div>
          ) : (
            <EmptyState icon={LayoutDashboard} title="Sin canchas cargadas" text="Cuando cargues canchas en Supabase aparecerán en esta sección." />
          )}
        </section>
      </div>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <div className="container-page grid min-h-screen place-items-center py-12">
        <section className="max-w-lg rounded-2xl border border-black/8 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-700">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-ink">Acceso denegado</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Tu usuario está autenticado, pero no tiene permisos de administrador para ingresar al panel de gestión.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-field-50"
            >
              <Home size={17} />
              Inicio
            </Link>
            <form action={signOut}>
              <SubmitButton pendingText="Saliendo..." className="bg-ink px-5 py-3 text-white">
                Cerrar sesión
              </SubmitButton>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  return (
    <tr className="border-b border-black/5 align-top last:border-0">
      <td className="py-4 pr-4">
        <p className="font-semibold text-ink">{reservation.customer_name}</p>
        <p className="text-ink/55">{reservation.customer_email}</p>
        <p className="text-ink/55">{reservation.customer_phone}</p>
      </td>
      <td className="py-4 pr-4">
        <p className="font-semibold text-ink">{reservation.courts?.name ?? "Sin cancha"}</p>
        <p className="text-ink/55">{reservation.courts?.sport_type}</p>
      </td>
      <td className="py-4 pr-4 text-ink/70">{formatDate(reservation.reservation_date)}</td>
      <td className="py-4 pr-4 text-ink/70">{formatReservationTime(reservation)}</td>
      <td className="py-4 pr-4 font-semibold text-ink">{currency(reservation.total_price ?? 0)}</td>
      <td className="py-4 pr-4">
        <StatusForm reservation={reservation} />
      </td>
    </tr>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{reservation.customer_name}</p>
          <p className="mt-1 text-sm text-ink/55">{reservation.customer_email}</p>
          <p className="text-sm text-ink/55">{reservation.customer_phone}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-ink/68">
        <p>
          <strong className="text-ink">Cancha:</strong> {reservation.courts?.name ?? "Sin cancha"} · {reservation.courts?.sport_type}
        </p>
        <p>
          <strong className="text-ink">Fecha:</strong> {formatDate(reservation.reservation_date)}
        </p>
        <p>
          <strong className="text-ink">Horario:</strong> {formatReservationTime(reservation)}
        </p>
        <p>
          <strong className="text-ink">Precio:</strong> {currency(reservation.total_price ?? 0)}
        </p>
      </div>
      <div className="mt-4">
        <StatusForm reservation={reservation} />
      </div>
    </article>
  );
}

function StatusForm({ reservation }: { reservation: Reservation }) {
  return (
    <form action={updateReservationStatus} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="id" value={reservation.id} />
      <select
        name="status"
        defaultValue={reservation.status}
        className={cn("focus-ring rounded-lg border px-3 py-2 text-sm font-semibold", statusStyles[reservation.status])}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
      <SubmitButton pendingText="Guardando..." className="bg-ink px-3 py-2 text-xs text-white">
        Guardar
      </SubmitButton>
    </form>
  );
}

function CourtSettingsCard({ court }: { court: Court }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-4">
      <form action={updateCourtSettings} className="grid gap-4 md:grid-cols-[1fr_160px_140px_auto] md:items-end">
        <input type="hidden" name="id" value={court.id} />
        <div>
          <p className="text-lg font-bold text-ink">{court.name}</p>
          <p className="mt-1 text-sm text-ink/58">
            {court.sport_type}
            {court.surface ? ` · ${court.surface}` : ""}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">/{court.slug}</p>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Precio por hora</span>
          <input
            name="price_per_hour"
            type="number"
            min="1"
            defaultValue={court.price_per_hour}
            className="focus-ring w-full rounded-lg border border-black/10 px-3 py-3 text-sm"
            required
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-3 text-sm font-semibold text-ink">
          <input name="is_active" type="checkbox" defaultChecked={court.is_active} className="size-4 accent-field-600" />
          Activa
        </label>
        <SubmitButton pendingText="Guardando..." className="bg-field-600 px-4 py-3 text-white hover:bg-field-700">
          Guardar
        </SubmitButton>
      </form>
    </article>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", statusStyles[status])}>{statusLabels[status]}</span>;
}

function MetricCard({
  icon: Icon,
  title,
  value,
  text
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <Icon className="text-field-700" size={22} />
      <p className="mt-4 text-sm font-semibold text-field-700">{title}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink/55">{text}</p>
    </article>
  );
}

function ActionNotice({ type, code }: { type: "success" | "error"; code: string }) {
  const successMessages: Record<string, string> = {
    "reservation-status": "El estado de la reserva se actualizó correctamente.",
    "court-update": "La cancha se actualizó correctamente."
  };
  const errorMessages: Record<string, string> = {
    "reservation-status": "No pudimos actualizar el estado de la reserva. Revisá los permisos de Supabase e intentá nuevamente.",
    "court-update": "No pudimos guardar los cambios de la cancha. Revisá los permisos de Supabase e intentá nuevamente."
  };
  const fallback = type === "success" ? "La acción se completó correctamente." : "No pudimos completar la acción. Intentá nuevamente.";

  if (type === "error") {
    return <ErrorMessage>{errorMessages[code] ?? fallback}</ErrorMessage>;
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-field-100 bg-field-50 px-4 py-3 text-sm font-semibold text-field-700">
      <CheckCircle2 size={18} />
      {successMessages[code] ?? fallback}
    </div>
  );
}

function formatReservationTime(reservation: Reservation) {
  return `${reservation.start_time.slice(0, 5)} a ${reservation.end_time.slice(0, 5)}`;
}
