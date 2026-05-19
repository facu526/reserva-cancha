"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Filter } from "lucide-react";
import { updateReservationStatus } from "@/actions/admin";
import { DeleteReservationForm } from "@/components/DeleteReservationForm";
import { EmptyState } from "@/components/EmptyState";
import { SubmitButton } from "@/components/SubmitButton";
import type { Court, Reservation, ReservationStatus } from "@/lib/types";
import { cn, currency, formatDate } from "@/lib/utils";

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

type StatusFilter = "all" | ReservationStatus;

export function AdminReservationsSection({
  reservations,
  courts
}: {
  reservations: Reservation[];
  courts: Court[];
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [courtFilter, setCourtFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const courtName = reservation.courts?.name ?? "";
        const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
        const matchesCourt = courtFilter === "all" || courtName === courtFilter;
        const matchesDate = !dateFilter || reservation.reservation_date === dateFilter;
        return matchesStatus && matchesCourt && matchesDate;
      }),
    [courtFilter, dateFilter, reservations, statusFilter]
  );

  const courtOptions = useMemo(() => {
    const names = new Set<string>();
    reservations.forEach((reservation) => {
      if (reservation.courts?.name) names.add(reservation.courts.name);
    });
    courts.forEach((court) => names.add(court.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [courts, reservations]);

  return (
    <section id="reservas" className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft scroll-mt-24 lg:p-4">
      <div className="mb-5 flex flex-col gap-4 lg:mb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-semibold text-field-700">Reservas</p>
          <h2 className="text-2xl font-bold text-ink lg:text-xl">Reservas</h2>
          <p className="mt-1 text-sm leading-6 text-ink/58">Consultá, confirmá, cancelá o eliminá turnos registrados.</p>
        </div>
        <span className="rounded-full bg-field-50 px-3 py-1.5 text-sm font-semibold text-field-700">
          {filteredReservations.length} de {reservations.length} reservas
        </span>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-black/8 bg-[#fbfdfb] p-4 md:grid-cols-3 lg:mb-4 lg:p-3.5">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Filter size={15} className="text-field-700" />
            Estado
          </span>
          <select className="admin-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Cancha</span>
          <select className="admin-input" value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)}>
            <option value="all">Todas</option>
            {courtOptions.map((courtName) => (
              <option key={courtName} value={courtName}>
                {courtName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Fecha</span>
          <input className="admin-input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </label>
      </div>

      {filteredReservations.length ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/8 bg-[#fbfdfb] text-ink/55">
                  <th className="rounded-l-xl px-4 py-3 font-semibold lg:py-2.5">Cliente</th>
                  <th className="px-4 py-3 font-semibold lg:py-2.5">Cancha</th>
                  <th className="px-4 py-3 font-semibold lg:py-2.5">Fecha y horario</th>
                  <th className="px-4 py-3 font-semibold lg:py-2.5">Precio</th>
                  <th className="px-4 py-3 font-semibold lg:py-2.5">Estado</th>
                  <th className="rounded-r-xl px-4 py-3 font-semibold lg:py-2.5">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <ReservationRow reservation={reservation} key={reservation.id} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredReservations.map((reservation) => (
              <ReservationCard reservation={reservation} key={reservation.id} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={CalendarClock} title="Sin reservas para estos filtros" text="Ajustá estado, cancha o fecha para ver otros turnos." />
      )}
    </section>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  return (
    <tr className="border-b border-black/5 align-top last:border-0">
      <td className="px-4 py-4 lg:py-3">
        <p className="font-semibold text-ink">{reservation.customer_name}</p>
        <p className="text-ink/55">{reservation.customer_email}</p>
        <p className="text-ink/55">{reservation.customer_phone}</p>
      </td>
      <td className="px-4 py-4 lg:py-3">
        <p className="font-semibold text-ink">{reservation.courts?.name ?? "Sin cancha"}</p>
        <p className="text-ink/55">{reservation.courts?.sport_type}</p>
      </td>
      <td className="px-4 py-4 text-ink/70 lg:py-3">
        <p className="font-semibold text-ink">{formatDate(reservation.reservation_date)}</p>
        <p className="text-ink/58">{formatReservationTime(reservation)}</p>
      </td>
      <td className="px-4 py-4 font-semibold text-ink lg:py-3">{currency(reservation.total_price ?? 0)}</td>
      <td className="px-4 py-4 lg:py-3">
        <StatusForm reservation={reservation} />
      </td>
      <td className="px-4 py-4 lg:py-3">
        <DeleteReservationForm reservationId={reservation.id} isCancelled={reservation.status === "cancelled"} />
      </td>
    </tr>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-4 lg:p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{reservation.customer_name}</p>
          <p className="mt-1 text-sm text-ink/55">{reservation.customer_email}</p>
          <p className="text-sm text-ink/55">{reservation.customer_phone}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-ink/68">
        <p><strong className="text-ink">Cancha:</strong> {reservation.courts?.name ?? "Sin cancha"} · {reservation.courts?.sport_type}</p>
        <p><strong className="text-ink">Fecha y horario:</strong> {formatDate(reservation.reservation_date)} · {formatReservationTime(reservation)}</p>
        <p><strong className="text-ink">Precio:</strong> {currency(reservation.total_price ?? 0)}</p>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <StatusForm reservation={reservation} />
        <DeleteReservationForm reservationId={reservation.id} isCancelled={reservation.status === "cancelled"} />
      </div>
    </article>
  );
}

function StatusForm({ reservation }: { reservation: Reservation }) {
  return (
    <form action={updateReservationStatus} className="flex flex-col gap-2">
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
      <SubmitButton pendingText="Guardando..." className="bg-ink px-3 py-2 text-xs text-white lg:py-1.5">
        Guardar estado
      </SubmitButton>
    </form>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", statusStyles[status])}>{statusLabels[status]}</span>;
}

function formatReservationTime(reservation: Reservation) {
  return `${reservation.start_time.slice(0, 5)} a ${reservation.end_time.slice(0, 5)}`;
}
