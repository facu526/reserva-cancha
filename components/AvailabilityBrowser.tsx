"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Loader2, RefreshCw, XCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Court } from "@/lib/types";
import { cn, currency, formatDate } from "@/lib/utils";

type AvailabilitySlot = {
  start_time: string;
  end_time: string;
  is_available: boolean;
};

type AvailabilityRow = {
  start_time: string | null;
  end_time?: string | null;
  is_available: boolean | null;
};

export function AvailabilityBrowser({
  courts,
  hasSupabase
}: {
  courts: Court[];
  hasSupabase: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? courts[0],
    [courts, selectedCourtId]
  );

  const loadAvailability = useCallback(
    async (background = false) => {
      if (!selectedCourt || !hasSupabase) {
        setSlots(createFallbackSlots(selectedCourt));
        setLastUpdated(new Date());
        return;
      }

      setError("");
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: availabilityError } = await supabase.rpc("get_public_availability", {
          p_court_id: selectedCourt.id,
          p_reservation_date: selectedDate
        });

        if (availabilityError) {
          console.error(availabilityError);
          setError("No pudimos actualizar la disponibilidad en este momento. Intentá nuevamente en unos minutos.");
          setSlots([]);
        } else {
          setSlots(normalizeAvailability(data, selectedCourt));
          setLastUpdated(new Date());
        }
      } catch (availabilityError) {
        console.error(availabilityError);
        setError("No pudimos actualizar la disponibilidad en este momento. Intentá nuevamente en unos minutos.");
        setSlots([]);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [hasSupabase, selectedCourt, selectedDate]
  );

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadAvailability(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadAvailability]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
      <aside className="rounded-2xl border border-black/8 bg-white p-4 shadow-soft sm:p-5 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-2 text-sm font-semibold text-field-700">
          <CalendarDays size={17} />
          Elegí cancha y fecha
        </div>

        <div className="mt-5 grid gap-3">
          {courts.map((court) => {
            const selected = court.id === selectedCourt?.id;

            return (
              <button
                type="button"
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={cn(
                  "focus-ring w-full rounded-xl border p-4 text-left transition",
                  selected ? "border-field-500 bg-field-50" : "border-black/8 bg-white hover:border-field-200 hover:bg-field-50/50"
                )}
              >
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-base font-bold text-ink">{court.name}</span>
                    <span className="mt-1 block text-sm text-ink/58">{court.sport_type}</span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-ink shadow-sm">
                    {currency(court.price_per_hour)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-5 block space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Clock3 className="text-field-700" size={16} />
            Fecha
          </span>
          <input
            className="focus-ring w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm"
            type="date"
            min={today}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </aside>

      <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 border-b border-black/5 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-field-700">{selectedCourt?.name ?? "Cancha"}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{formatDate(selectedDate)}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink/55">
            {refreshing ? <Loader2 className="animate-spin text-field-700" size={15} /> : <RefreshCw size={15} />}
            <span>{lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}` : "Actualizando"}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid min-h-72 place-items-center text-ink/60">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="animate-spin text-field-700" size={18} />
              Consultando turnos...
            </span>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot) => {
              const slotTime = slot.start_time.slice(0, 5);
              const href = selectedCourt
                ? `/reservar/${selectedCourt.slug ?? selectedCourt.id}?fecha=${selectedDate}&hora=${slotTime}`
                : "/canchas";

              return (
                <div
                  key={slotTime}
                  className={cn(
                    "rounded-xl border p-4",
                    slot.is_available ? "border-emerald-200 bg-emerald-50/45" : "border-black/8 bg-stone-50 text-ink/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-ink">{slotTime}</p>
                      <p className="mt-1 text-sm text-ink/58">{`${slotTime} a ${slot.end_time.slice(0, 5)}`}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                        slot.is_available ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                      )}
                    >
                      {slot.is_available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {slot.is_available ? "Disponible" : "Ocupado"}
                    </span>
                  </div>

                  {slot.is_available ? (
                    <Link
                      href={href}
                      className="focus-ring mt-4 inline-flex w-full items-center justify-center rounded-lg bg-field-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-field-700"
                    >
                      Reservar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-black/8 bg-white px-4 py-2.5 text-sm font-semibold text-ink/42"
                    >
                      No disponible
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function normalizeAvailability(data: unknown, court: Court): AvailabilitySlot[] {
  if (!Array.isArray(data)) {
    return createFallbackSlots(court);
  }

  return data
    .map((row: AvailabilityRow) => {
      const startTime = normalizeTime(row.start_time);
      if (!startTime) {
        return null;
      }

      return {
        start_time: startTime,
        end_time: normalizeTime(row.end_time) ?? addMinutes(startTime, getSlotDuration(court)),
        is_available: row.is_available === true
      };
    })
    .filter((slot): slot is AvailabilitySlot => Boolean(slot));
}

function createFallbackSlots(court?: Court): AvailabilitySlot[] {
  const duration = getSlotDuration(court);
  const slots: AvailabilitySlot[] = [];

  for (let minutes = 8 * 60; minutes < 24 * 60; minutes += duration) {
    const startTime = formatMinutes(minutes);
    slots.push({
      start_time: startTime,
      end_time: formatMinutes(minutes + duration),
      is_available: true
    });
  }

  return slots;
}

function getSlotDuration(court?: Court) {
  return court?.slot_duration_minutes && court.slot_duration_minutes > 0 ? court.slot_duration_minutes : 60;
}

function normalizeTime(value?: string | null) {
  const match = value?.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  return formatMinutes(hours * 60 + minutes + minutesToAdd);
}

function formatMinutes(totalMinutes: number) {
  const normalized = totalMinutes % (24 * 60);
  const hours = Math.floor(normalized / 60).toString().padStart(2, "0");
  const minutes = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
