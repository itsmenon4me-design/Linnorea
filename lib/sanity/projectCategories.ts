export function normalizeProjectCategory(category?: string) {
  const normalized = category?.trim();
  if (!normalized) return undefined;
  if (normalized === "Residential" || normalized === "Commercial") return "Architecture";
  if (normalized === "Retail") return "Design";
  return normalized;
}
