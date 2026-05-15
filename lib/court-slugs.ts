export const legacyCourtSlugs: Record<string, string> = {
};

export function normalizeCourtSlug(value: string) {
  return legacyCourtSlugs[value] ?? value;
}

export function isLegacyCourtSlug(value: string) {
  return value in legacyCourtSlugs;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
