import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { isUuid, normalizeCourtSlug } from "@/lib/court-slugs";
import { mockCourts } from "@/lib/mock-courts";
import type { Court } from "@/lib/types";

export async function getActiveCourts(limit?: number) {
  if (!hasSupabaseEnv()) {
    return limit ? mockCourts.slice(0, limit) : mockCourts;
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("courts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Court[];
}

export async function getCourtById(id: string) {
  const normalizedId = normalizeCourtSlug(id);

  if (!hasSupabaseEnv()) {
    return mockCourts.find((court) => court.id === normalizedId || court.slug === normalizedId) ?? null;
  }

  const supabase = await createSupabaseServerClient();

  const { data: courtBySlug, error: slugError } = await supabase
    .from("courts")
    .select("*")
    .eq("slug", normalizedId)
    .maybeSingle();

  if (slugError) {
    console.error(slugError);
  }

  if (courtBySlug) {
    return courtBySlug as Court;
  }

  if (!isUuid(normalizedId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("id", normalizedId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Court;
}
