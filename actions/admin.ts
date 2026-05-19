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
  revalidatePath("/disponibilidad");
  redirect("/admin?success=reservation-status");
}

export async function deleteReservation(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin?error=reservation-delete");
  }

  const { supabase } = await requireAdmin();
  const { data: deletedReservation, error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error deleting reservation", { id, error });
    redirect("/admin?error=reservation-delete");
  }

  if (!deletedReservation) {
    console.error("Reservation delete did not remove any row", { id });
    redirect("/admin?error=reservation-delete");
  }

  revalidatePath("/admin");
  revalidatePath("/disponibilidad");
  redirect("/admin?success=reservation-delete");
}

export async function saveCourt(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const sport_type = String(formData.get("sport_type") ?? "").trim();
  const payload = {
    name,
    slug,
    sport_type,
    description: nullableText(formData.get("description")),
    surface: nullableText(formData.get("surface")),
    location: nullableText(formData.get("location")),
    image_url: nullableText(formData.get("image_url")),
    price_per_hour: Number(formData.get("price_per_hour") ?? 0),
    player_count: nullableNumber(formData.get("player_count")),
    slot_duration_minutes: Number(formData.get("slot_duration_minutes") ?? 0),
    is_active: formData.get("is_active") === "on"
  };

  if (
    !payload.name ||
    !payload.slug ||
    !payload.sport_type ||
    payload.price_per_hour < 0 ||
    payload.slot_duration_minutes <= 0 ||
    (payload.player_count !== null && payload.player_count < 0)
  ) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { error } = id
    ? await supabase.from("courts").update(payload).eq("id", id)
    : await supabase.from("courts").insert(payload);

  if (error) {
    console.error(error);
    redirect("/admin?error=court-update");
  }

  revalidatePath("/admin");
  revalidatePath("/canchas");
  revalidatePath("/");
  redirect("/admin?success=court-update");
}

export async function updateSiteSettings(formData: FormData) {
  const payload = {
    club_name: requiredText(formData.get("club_name")),
    site_name: requiredText(formData.get("site_name")),
    hero_title: requiredText(formData.get("hero_title")),
    hero_subtitle: requiredText(formData.get("hero_subtitle")),
    location: requiredText(formData.get("location")),
    phone: requiredText(formData.get("phone")),
    whatsapp: requiredText(formData.get("whatsapp")),
    email: requiredText(formData.get("email")),
    opening_hours: requiredText(formData.get("opening_hours")),
    footer_description: requiredText(formData.get("footer_description")),
    primary_cta_label: requiredText(formData.get("primary_cta_label")),
    hero_badge_text: requiredText(formData.get("hero_badge_text")),
    home_card_title: requiredText(formData.get("home_card_title")),
    home_card_subtitle: requiredText(formData.get("home_card_subtitle"))
  };

  if (Object.values(payload).some((value) => !value)) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "main", value: payload }, { onConflict: "key" });

  if (error) {
    console.error(error);
    redirect("/admin?error=settings-update");
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/canchas");
  revalidatePath("/reservar/[courtId]", "page");
  redirect("/admin?success=settings-update");
}

export { signOut };

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
