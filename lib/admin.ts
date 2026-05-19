import { redirect } from "next/navigation";
import { getProfileAuthFields, isAdminProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const profile = await getProfileAuthFields(supabase, user.id);

  return {
    supabase,
    user,
    isAdmin: isAdminProfile(profile)
  };
}

export async function requireAdmin() {
  const context = await getAdminContext();

  if (!context.isAdmin) {
    redirect("/login?error=unauthorized");
  }

  return context;
}
