import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { SiteHeaderClient } from "@/components/SiteHeaderClient";

export async function SiteHeader() {
  let user: { email: string | null; fullName: string | null; isAdmin: boolean } | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .maybeSingle();

      user = {
        email: authUser.email ?? null,
        fullName: (profile?.full_name as string | null | undefined) ?? null,
        isAdmin: profile?.role === "admin"
      };
    }
  }

  return <SiteHeaderClient user={user} />;
}
