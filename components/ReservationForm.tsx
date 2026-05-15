"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Mail, Phone, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { getCourtSpec } from "@/lib/brand";
import { timeSlots } from "@/lib/time-slots";
import type { ActionState, Court } from "@/lib/types";
import { currency, formatDate } from "@/lib/utils";

const initialState = {
  ok: false,
  message: ""
};

export function ReservationForm({
  court,
  action,
  customer
}: {
  court: Court;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  customer?: {
    name: string;
    email: string;
    phone: string;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [date, setDate] = useState("");
  const [slotValue, setSlotValue] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const selectedSlot = useMemo(() => timeSlots.find((slot) => `${slot.start}-${slot.end}` === slotValue), [slotValue]);
  const spec = getCourtSpec(court.sport_type);
  const surface = court.surface ?? spec.surface;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.78fr]">
      <form action={formAction} className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft sm:p-6">
        <input type="hidden" name="court_id" value={court.id} />
        <input type="hidden" name="start_time" value={selectedSlot?.start ?? ""} />
        <input type="hidden" name="end_time" value={selectedSlot?.end ?? ""} />

        <div className="mb-6">
          <p className="text-sm font-semibold text-field-700">Datos de la reserva</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Elegí fecha y dejá tu contacto</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel icon={CalendarDays} label="Fecha">
            <input
              className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
              type="date"
              name="reservation_date"
              min={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </FieldLabel>

          <FieldLabel icon={Clock} label="Horario">
            <select
              className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
              name="slot"
              required
              value={slotValue}
              onChange={(event) => setSlotValue(event.target.value)}
            >
              <option value="" disabled>
                Seleccionar turno
              </option>
              {timeSlots.map((slot) => (
                <option key={slot.start} value={`${slot.start}-${slot.end}`}>
                  {slot.start} a {slot.end}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FieldLabel icon={User} label="Nombre">
            <input
              className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
              name="customer_name"
              placeholder="Nombre y apellido"
              autoComplete="name"
              defaultValue={customer?.name ?? ""}
              required
            />
          </FieldLabel>
          <FieldLabel icon={Mail} label="Email">
            <input
              className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
              type="email"
              name="customer_email"
              placeholder="nombre@email.com"
              autoComplete="email"
              defaultValue={customer?.email ?? ""}
              required
            />
          </FieldLabel>
          <FieldLabel icon={Phone} label="Teléfono">
            <input
              className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
              name="customer_phone"
              placeholder="+54 9 11 2345-6789"
              minLength={8}
              autoComplete="tel"
              defaultValue={customer?.phone ?? ""}
              required
            />
          </FieldLabel>
        </div>

        {state.message ? (
          <div className="mt-5">
            <ErrorMessage>{state.message}</ErrorMessage>
          </div>
        ) : null}

        <button
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-field-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-field-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          <CheckCircle2 size={18} />
          {pending ? "Confirmando reserva..." : "Confirmar reserva"}
        </button>
      </form>

      <aside className="rounded-2xl border border-black/8 bg-ink p-5 text-white shadow-soft sm:p-6 lg:sticky lg:top-24 lg:self-start">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-field-100">Resumen</p>
        <h3 className="mt-2 text-2xl font-bold">{court.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">{surface}</p>

        <div className="mt-6 grid gap-3">
          <SummaryRow label="Deporte" value={court.sport_type} />
          <SummaryRow label="Fecha" value={date ? formatDate(date) : "Seleccionar"} />
          <SummaryRow label="Horario" value={selectedSlot ? `${selectedSlot.start} a ${selectedSlot.end}` : "Seleccionar"} />
          <SummaryRow label="Precio estimado" value={currency(court.price_per_hour)} strong />
        </div>

        <p className="mt-5 rounded-xl bg-white/[0.08] p-4 text-sm leading-6 text-white/68">
          La reserva queda registrada como solicitud y el equipo del club puede confirmarla desde administración.
        </p>
      </aside>
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  label,
  children
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="text-field-700" size={16} />
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-white/55">{label}</span>
      <span className={strong ? "text-lg font-bold text-white" : "text-sm font-semibold text-white"}>{value}</span>
    </div>
  );
}
