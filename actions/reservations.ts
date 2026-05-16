"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { sendReservationCreatedEmail } from "@/lib/email";
import { timeSlots } from "@/lib/time-slots";
import type { ActionState } from "@/lib/types";

const initialError: ActionState = {
  ok: false,
  message: "No se pudo crear la reserva. Revisá los datos e intentá nuevamente."
};

export async function createReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const court_id = String(formData.get("court_id") ?? "");
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const customer_email = String(formData.get("customer_email") ?? "").trim();
  const customer_phone = String(formData.get("customer_phone") ?? "").trim();
  const reservation_date = String(formData.get("reservation_date") ?? "");
  const start_time = String(formData.get("start_time") ?? "");
  const end_time = String(formData.get("end_time") ?? "");

  if (
    !court_id ||
    !customer_name ||
    !customer_email ||
    !customer_phone ||
    !reservation_date ||
    !start_time ||
    !end_time
  ) {
    return { ok: false, message: "Completá todos los campos para confirmar la reserva." };
  }

  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "El servicio de reservas todavía no está conectado. Probá nuevamente más tarde o contactanos por WhatsApp."
    };
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email);
  const phoneIsValid = customer_phone.replace(/[^\d]/g, "").length >= 8;
  const slotIsValid = timeSlots.some((slot) => slot.start === start_time && slot.end === end_time);

  if (!emailIsValid) {
    return { ok: false, message: "Ingresá un email válido." };
  }

  if (!phoneIsValid) {
    return { ok: false, message: "Ingresá un teléfono válido, con al menos 8 números." };
  }

  if (!slotIsValid) {
    return { ok: false, message: "Seleccioná un horario válido." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(`${reservation_date}T00:00:00`);

  if (selectedDate < today) {
    return { ok: false, message: "La fecha de reserva no puede ser anterior a hoy." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      message: "Para reservar necesitás iniciar sesión o crear una cuenta."
    };
  }

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("id, name, sport_type, price_per_hour")
    .eq("id", court_id)
    .eq("is_active", true)
    .maybeSingle();

  if (courtError) {
    console.error(courtError);
    return initialError;
  }

  if (!court) {
    return { ok: false, message: "La cancha seleccionada no está disponible." };
  }

  const { data: slotIsTaken, error: slotError } = await supabase.rpc("has_active_reservation", {
    p_court_id: court_id,
    p_reservation_date: reservation_date,
    p_start_time: start_time
  });

  if (slotError) {
    console.error(slotError);
    return initialError;
  }

  if (slotIsTaken) {
    return {
      ok: false,
      message: "Ese horario ya fue reservado. Elegí otro turno disponible."
    };
  }

  const reservationId = crypto.randomUUID();

  const { error } = await supabase
    .from("reservations")
    .insert({
      id: reservationId,
      user_id: user.id,
      court_id,
      customer_name,
      customer_email,
      customer_phone,
      reservation_date,
      start_time,
      end_time,
      status: "pending",
      total_price: court.price_per_hour
    });

  if (error) {
    console.error(error);
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Ese horario ya fue reservado. Elegí otro turno disponible."
      };
    }
    return initialError;
  }

  await sendReservationCreatedEmail({
    customerName: customer_name,
    customerEmail: customer_email,
    courtName: court.name,
    sportType: court.sport_type,
    reservationDate: reservation_date,
    startTime: start_time,
    endTime: end_time,
    totalPrice: court.price_per_hour
  });

  redirect(`/reserva-exitosa?id=${reservationId}`);
}
