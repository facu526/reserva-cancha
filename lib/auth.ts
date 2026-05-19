import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HeaderUser } from "@/lib/types";

type ProfileAuthFields = {
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
  is_admin?: boolean | null;
};

export function isAdminProfile(profile: ProfileAuthFields | null | undefined) {
  return profile?.role === "admin" || profile?.is_admin === true;
}

export async function getProfileAuthFields(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, role, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (!error) {
    return data as ProfileAuthFields | null;
  }

  const { data: fallbackData } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", userId)
    .maybeSingle();

  return fallbackData as ProfileAuthFields | null;
}

export function toHeaderUser(user: { email?: string | null }, profile: ProfileAuthFields | null | undefined): HeaderUser {
  return {
    email: user.email ?? null,
    fullName: profile?.full_name ?? null,
    isAdmin: isAdminProfile(profile)
  };
}

export async function getCurrentHeaderUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfileAuthFields(supabase, user.id);

  return toHeaderUser(user, profile);
}
