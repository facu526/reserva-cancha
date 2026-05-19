import { SiteHeaderClient } from "@/components/SiteHeaderClient";
import { getCurrentHeaderUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import type { HeaderUser } from "@/lib/types";

export async function SiteHeader({ user }: { user?: HeaderUser | null } = {}) {
  const [settings, resolvedUser] = await Promise.all([
    getSiteSettings(),
    user === undefined ? getCurrentHeaderUser() : Promise.resolve(user)
  ]);

  return <SiteHeaderClient user={resolvedUser} settings={settings} />;
}
