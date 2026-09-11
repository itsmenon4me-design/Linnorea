import { createClient } from "@sanity/client";

const locales = ["id", "en", "ja", "fr", "de", "it"] as const;
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_STUDIO_TOKEN;
const dryRun = process.env.MIGRATION_DRY_RUN === "true";

if (!projectId || !token) {
  throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_AUTH_TOKEN before running the migration.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01",
  token,
  useCdn: false,
});

function firstValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const localized = value as Record<string, unknown>;
  return locales.map((locale) => localized[locale]).find((candidate) => {
    if (typeof candidate === "string") return candidate.trim().length > 0;
    return candidate !== null && candidate !== undefined;
  });
}

function isLocalizedObject(value: unknown) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && locales.some((locale) => locale in (value as Record<string, unknown>)));
}

function firstSeoValue(value: unknown) {
  const selected = firstValue(value);
  return selected && typeof selected === "object" && !Array.isArray(selected) ? selected : {};
}

const fieldPaths: Record<string, string[]> = {
  heroSlide: ["eyebrow", "headline", "subheadline"],
  visionSlide: ["label", "headline", "description"],
  project: ["title", "styleTag", "homeTagline", "location", "description", "scopeOfWork"],
  product: ["name", "description"],
  service: ["title", "description"],
  approachItem: ["title", "description"],
  teamMember: ["role", "bio"],
  siteSettings: [
    "brandStatement",
    "aboutEstablished",
    "aboutDescription",
    "aboutVision",
    "aboutMission",
    "aboutKey[].label",
    "aboutProcess[].title",
    "aboutProcess[].subtitle",
    "aboutProcess[].description",
    "officeAddress",
    "whatsappCtaText",
    "seoDefaults",
  ],
};

function getAtPath(document: Record<string, unknown>, path: string) {
  const arrayMatch = path.match(/^(.+)\[\](?:\.(.+))?$/);
  if (!arrayMatch) return { parent: document, key: path };
  const items = document[arrayMatch[1]];
  return Array.isArray(items) ? { items, key: arrayMatch[2] } : { items: [], key: arrayMatch[2] };
}

const documents = await client.fetch<Array<Record<string, unknown>>>(
  `*[_type in ${JSON.stringify(Object.keys(fieldPaths))}]`,
);
let migratedDocuments = 0;
let documentsWithValues = 0;
const processedByType: Record<string, number> = {};
const migratedByType: Record<string, number> = {};
const emptyDocuments: Array<{ id: string; type: string; title: string }> = [];
const failedDocuments: Array<{ id: string; type: string; error: string }> = [];
let emptyFields = 0;
const emptyFieldReports: Array<{ id: string; type: string; field: string }> = [];

for (const document of documents) {
  const type = String(document._type);
  const id = String(document._id);
  processedByType[type] = (processedByType[type] ?? 0) + 1;
  const patch: Record<string, unknown> = {};
  let localizedFieldCount = 0;
  let selectedValueCount = 0;

  try {
    for (const path of fieldPaths[type] ?? []) {
      const target = getAtPath(document, path);
      if ("items" in target) {
        const items = Array.isArray(target.items) ? target.items : [];
        const migratedItems = items.map((item) => {
          const original = target.key ? item[target.key] : item;
          const value = isLocalizedObject(original) ? firstValue(original) : original;
          if (isLocalizedObject(original)) {
            localizedFieldCount += 1;
            if (value !== undefined) selectedValueCount += 1;
            if (value === undefined) {
              emptyFields += 1;
              emptyFieldReports.push({ id, type, field: path });
            }
          }
          return target.key ? { ...item, [target.key]: value } : value;
        });
        if (items.length > 0) patch[path.split("[]")[0]] = migratedItems;
        continue;
      }

      const original = target.parent[target.key];
      if (!isLocalizedObject(original)) continue;
      localizedFieldCount += 1;
      const value = path === "seoDefaults" ? firstSeoValue(original) : firstValue(original);
      if (value !== undefined) selectedValueCount += 1;
      if (value === undefined) {
        emptyFields += 1;
        emptyFieldReports.push({ id, type, field: path });
      }
      patch[target.key] = value;
    }

    if (localizedFieldCount > 0) {
      if (selectedValueCount > 0) {
        documentsWithValues += 1;
        migratedByType[type] = (migratedByType[type] ?? 0) + 1;
      } else {
        emptyDocuments.push({
          id,
          type,
          title: String(firstValue(document.title) ?? firstValue(document.name) ?? document._id),
        });
      }
    }

    if (!dryRun && Object.keys(patch).length > 0) {
      await client.patch(id).set(patch).commit();
      migratedDocuments += 1;
    }
  } catch (error) {
    failedDocuments.push({ id, type, error: error instanceof Error ? error.message : String(error) });
  }
}

console.log(JSON.stringify({
  dryRun,
  totalDocuments: documents.length,
  processedByType,
  migratedDocuments,
  documentsWithValues,
  migratedByType,
  emptyDocuments,
  emptyFields,
  emptyFieldReports,
  failedDocuments,
}, null, 2));
