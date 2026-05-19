import { cache } from "react";
import { brand } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export const defaultSiteSettings: SiteSettings = {
  key: "main",
  club_name: brand.clubName,
  site_name: brand.appName,
  hero_title: "Canchas listas para tu próximo partido",
  hero_subtitle: brand.tagline,
  location: brand.location,
  phone: brand.whatsapp,
  whatsapp: brand.whatsapp,
  email: brand.email,
  opening_hours: brand.hours,
  footer_description: brand.tagline,
  primary_cta_label: "Reservar cancha",
  hero_badge_text: `Reservas online en ${brand.location}`,
  home_card_title: "Fútbol, pádel y tenis todos los días",
  home_card_subtitle: "Elegí tu cancha, seleccioná un horario y dejá la reserva registrada en segundos."
};

let loggedSiteSettingsError = false;
let retrySiteSettingsAfter = 0;

export const getSiteSettings = cache(async function getSiteSettings() {
  if (!hasSupabaseEnv()) {
    return defaultSiteSettings;
  }

  if (Date.now() < retrySiteSettingsAfter) {
    return defaultSiteSettings;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "main")
      .single();

    if (error || !data) {
      if (error) {
        pauseSiteSettingsQueries();
        logSiteSettingsError(error);
      }
      return defaultSiteSettings;
    }

    return {
      ...defaultSiteSettings,
      ...(isSiteSettingsValue(data.value) ? data.value : {})
    };
  } catch (error) {
    pauseSiteSettingsQueries();
    logSiteSettingsError(error);
    return defaultSiteSettings;
  }
});

function pauseSiteSettingsQueries() {
  retrySiteSettingsAfter = Date.now() + 60_000;
}

function logSiteSettingsError(error: unknown) {
  if (!error || process.env.NODE_ENV !== "development" || loggedSiteSettingsError) {
    return;
  }

  loggedSiteSettingsError = true;
  console.error("Falling back to defaultSiteSettings because site_settings could not be loaded.", error);
}

function isSiteSettingsValue(value: unknown): value is Partial<SiteSettings> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
