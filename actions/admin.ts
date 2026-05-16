"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/actions/auth";
import { sendReservationStatusEmail } from "@/lib/email";
import type { ReservationStatus } from "@/lib/types";

export async function updateReservationStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ReservationStatus;

  if (!id || !["pending", "confirmed", "cancelled"].includes(status)) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { data: reservation, error: readError } = await supabase
    .from("reservations")
    .select("customer_name, customer_email, reservation_date, start_time, end_time, status, total_price, courts(name, sport_type)")
    .eq("id", id)
    .single();

  if (readError || !reservation) {
    console.error(readError);
    redirect("/admin?error=reservation-status");
  }

  const previousStatus = reservation.status as ReservationStatus;
  const statusChanged = previousStatus !== status;
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);

  if (error) {
    console.error(error);
    redirect("/admin?error=reservation-status");
  }

  if (statusChanged && (status === "confirmed" || status === "cancelled")) {
    const court = Array.isArray(reservation.courts) ? reservation.courts[0] : reservation.courts;

    await sendReservationStatusEmail({
      customerName: reservation.customer_name,
      customerEmail: reservation.customer_email,
      courtName: court?.name ?? "Cancha reservada",
      sportType: court?.sport_type ?? "Deporte",
      reservationDate: reservation.reservation_date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      totalPrice: reservation.total_price,
      status
    });
  }

  revalidatePath("/admin");
  redirect("/admin?success=reservation-status");
}

export async function updateCourtSettings(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = {
    price_per_hour: Number(formData.get("price_per_hour") ?? 0),
    is_active: formData.get("is_active") === "on"
  };

  if (!id || payload.price_per_hour <= 0) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("courts").update(payload).eq("id", id);

  if (error) {
    console.error(error);
    redirect("/admin?error=court-update");
  }

  revalidatePath("/admin");
  revalidatePath("/canchas");
  revalidatePath("/");
  redirect("/admin?success=court-update");
}

export { signOut };
