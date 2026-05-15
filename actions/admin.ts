"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/actions/auth";
import type { ReservationStatus } from "@/lib/types";

export async function updateReservationStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ReservationStatus;

  if (!id || !["pending", "confirmed", "cancelled"].includes(status)) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);

  if (error) {
    console.error(error);
    redirect("/admin?error=reservation-status");
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
