import { useState } from "react";
import {
  useDocumentOperation,
  type DocumentActionProps,
  type DocumentActionDescription,
} from "sanity";
import { useToast } from "@sanity/ui/toast";
import { TranslateIcon } from "@sanity/icons/Translate";

const LOCALES = ["id", "en", "ja", "fr", "de", "it"] as const;
type Locale = (typeof LOCALES)[number];
const LOCALE_LABELS: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "Bahasa Inggris",
  ja: "Bahasa Jepang",
  fr: "Bahasa Prancis",
  de: "Bahasa Jerman",
  it: "Bahasa Italia",
};

interface FieldToTranslate {
  id: string; // Identifier used for API matching, e.g., "headline" or "aboutKey.0.label"
  path: string; // Exact patch path
  values: Partial<Record<Locale, string>>;
  rawValues: Partial<Record<Locale, unknown>>;
  targetLangs: Locale[];
  isSeoField?: "title" | "description";
  isBlock?: boolean; // Portable Text block array (localeBlock)
}

function blocksToPlainText(blocks: any): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block: any) => {
      if (!block || typeof block !== "object") return "";
      if (block._type === "block") {
        const children = Array.isArray(block.children)
          ? block.children.map((c: any) => (typeof c?.text === "string" ? c.text : "")).join("")
          : "";
        return children;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function isLocaleObject(obj: any, nonInternalKeys: string[]): boolean {
  return (
    nonInternalKeys.length > 0 &&
    nonInternalKeys.every((k) => (LOCALES as readonly string[]).includes(k))
  );
}

function findTranslatableFields(obj: any, currentPath = ""): FieldToTranslate[] {
  const fields: FieldToTranslate[] = [];
  if (!obj || typeof obj !== "object") return fields;

  // 1. Handle seoDefaults object
  if (currentPath === "seoDefaults" || currentPath.endsWith(".seoDefaults")) {
    for (const fieldName of ["title", "description"] as const) {
      const values: Partial<Record<Locale, string>> = {};
      const rawValues: Partial<Record<Locale, unknown>> = {};
      for (const lang of LOCALES) {
        const val = obj[lang]?.[fieldName];
        if (typeof val === "string" && val.trim().length > 0) {
          values[lang] = val.trim();
          rawValues[lang] = val;
        }
      }

      if (Object.keys(values).length > 0) {
        fields.push({
          id: `${currentPath}.${fieldName}`,
          path: currentPath,
          values,
          rawValues,
          targetLangs: LOCALES.filter((lang) => !values[lang]),
          isSeoField: fieldName,
        });
      }
    }
    return fields;
  }

  // 2. Check if obj is a localeString / localeText / localeBlock object
  const nonInternalKeys = Object.keys(obj).filter((k) => !k.startsWith("_"));

  if (isLocaleObject(obj, nonInternalKeys)) {
    const valuesAreBlocks = nonInternalKeys.some((k) => Array.isArray(obj[k]));
    const values: Partial<Record<Locale, string>> = {};
    const rawValues: Partial<Record<Locale, unknown>> = {};
    for (const lang of LOCALES) {
      const val = obj[lang];
      if (valuesAreBlocks) {
        const text = blocksToPlainText(val);
        if (text.trim().length > 0) {
          values[lang] = text.trim();
          rawValues[lang] = val;
        }
      } else if (typeof val === "string" && val.trim().length > 0) {
        values[lang] = val.trim();
        rawValues[lang] = val;
      }
    }

    if (Object.keys(values).length > 0) {
      fields.push({
        id: currentPath,
        path: currentPath,
        values,
        rawValues,
        targetLangs: LOCALES.filter((lang) => !values[lang]),
        isBlock: valuesAreBlocks,
      });
    }
    return fields;
  }

  // 3. Array handling
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemKey = item?._key ? `[_key=="${item._key}"]` : `[${index}]`;
      const itemPath = currentPath ? `${currentPath}${itemKey}` : `${itemKey}`;
      fields.push(...findTranslatableFields(item, itemPath));
    });
    return fields;
  }

  // 4. Object traversal
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("_")) continue;
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    fields.push(...findTranslatableFields(value, nextPath));
  }

  return fields;
}

function getApiUrl(): string {
  if (typeof process !== "undefined" && process.env.SANITY_STUDIO_API_URL) {
    return `${process.env.SANITY_STUDIO_API_URL}/api/translate`;
  }
  if (typeof window !== "undefined") {
    if (
      window.location.port === "3000" ||
      window.location.hostname === "linnorea.com" ||
      window.location.hostname.endsWith(".vercel.app")
    ) {
      return "/api/translate";
    }
  }
  return "http://localhost:3000/api/translate";
}

export function AutoTranslateAction(props: DocumentActionProps): DocumentActionDescription | null {
  const { patch } = useDocumentOperation(props.id, props.type);
  const toast = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  // Document types that support localized strings
  const supportedTypes = [
    "heroSlide",
    "visionSlide",
    "project",
    "service",
    "product",
    "siteSettings",
    "approachItem",
    "teamMember",
  ];

  if (!supportedTypes.includes(props.type)) {
    return null;
  }

  const doc = props.draft || props.published;
  if (!doc) return null;

  return {
    label: isTranslating ? "Menerjemahkan..." : "Terjemahkan Otomatis",
    title: "Deteksi bahasa, pindahkan teks ke locale yang benar, lalu terjemahkan field kosong dengan Google Cloud Translation",
    icon: TranslateIcon,
    disabled: isTranslating,
    onHandle: async () => {
      setIsTranslating(true);
      try {
        const currentDoc = props.draft || props.published;
        if (!currentDoc) {
          toast.push({
            status: "warning",
            title: "Dokumen kosong",
            description: "Silakan isi minimal satu bahasa sebelum menerjemahkan.",
          });
          setIsTranslating(false);
          return;
        }

        const fieldsToTranslate = findTranslatableFields(currentDoc);

        if (fieldsToTranslate.length === 0) {
          toast.push({
            status: "info",
            title: "Semua bahasa sudah lengkap",
            description: "Tidak ditemukan field kosong yang perlu diterjemahkan.",
          });
          setIsTranslating(false);
          return;
        }

        const apiUrl = getApiUrl();
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: fieldsToTranslate.map((f) => ({
              id: f.id,
              values: f.values,
              targetLangs: f.targetLangs,
            })),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const { translations, moves } = await response.json();
        if (!translations || typeof translations !== "object") {
          throw new Error("Format respon terjemahan tidak valid.");
        }

        // Build patches
        const patchSet: Record<string, any> = {};
        const unsetPaths: string[] = [];
        let translatedCount = 0;

        for (const field of fieldsToTranslate) {
          const fieldMoves = Array.isArray(moves)
            ? moves.filter((move: { id?: string }) => move?.id === field.id)
            : [];

          const filledAfterMoves = new Set<Locale>();
          for (const lang of LOCALES) {
            if (field.rawValues[lang] !== undefined) filledAfterMoves.add(lang);
          }
          for (const move of fieldMoves) {
            const movedValue = field.rawValues[move.from as Locale];
            if (movedValue === undefined) continue;
            const targetPath = field.isSeoField
              ? `${field.path}.${move.to}.${field.isSeoField}`
              : `${field.path}.${move.to}`;
            const sourcePath = field.isSeoField
              ? `${field.path}.${move.from}.${field.isSeoField}`
              : `${field.path}.${move.from}`;
            patchSet[targetPath] = movedValue;
            unsetPaths.push(sourcePath);
            filledAfterMoves.delete(move.from as Locale);
            filledAfterMoves.add(move.to as Locale);
          }

          const itemTranslations = translations[field.id];
          if (!itemTranslations || typeof itemTranslations !== "object") continue;

          const targetsAfterMoves = LOCALES.filter((lang) => !filledAfterMoves.has(lang));
          for (const targetLang of targetsAfterMoves) {
            const translatedText = itemTranslations[targetLang];
            if (typeof translatedText === "string" && translatedText.trim().length > 0) {
              if (field.isSeoField) {
                // For seoDefaults: seoDefaults.{lang}.{title|description}
                patchSet[`${field.path}.${targetLang}.${field.isSeoField}`] = translatedText.trim();
              } else if (field.isBlock) {
                // For Portable Text blocks: convert paragraphs into block objects
                const paragraphs = translatedText.trim().split(/\n\n+/);
                const blockArray = paragraphs.map((p, pIdx) => ({
                  _type: "block",
                  _key: `trans_${targetLang}_${Date.now()}_${pIdx}`,
                  style: "normal",
                  markDefs: [],
                  children: [
                    {
                      _type: "span",
                      _key: `span_${Date.now()}_${pIdx}`,
                      text: p,
                      marks: [],
                    },
                  ],
                }));
                patchSet[`${field.path}.${targetLang}`] = blockArray;
              } else {
                // For regular localeString/localeText: {path}.{lang}
                patchSet[`${field.path}.${targetLang}`] = translatedText.trim();
              }
              translatedCount++;
            }
          }
        }

        if (Object.keys(patchSet).length > 0) {
          patch.execute([{ set: patchSet, ...(unsetPaths.length > 0 ? { unset: unsetPaths } : {}) }]);
          const movedDescriptions = Array.isArray(moves)
            ? moves.map((move: { from: Locale; to: Locale; detectedLanguage?: Locale }) =>
                `Teks terdeteksi ${LOCALE_LABELS[move.detectedLanguage || move.to]}, dipindahkan dari kolom ${LOCALE_LABELS[move.from]} ke kolom ${LOCALE_LABELS[move.to]}`
              )
            : [];
          const moveMessage = movedDescriptions.length > 0
            ? ` Pemindahan otomatis: ${movedDescriptions.join(", ")}.`
            : "";
          toast.push({
            status: "success",
            title: "Terjemahan Berhasil",
            description: `Berhasil mengisi ${translatedCount} field terjemahan. Konten manual sebelumnya tetap terjaga.${moveMessage}`,
          });
        } else {
          toast.push({
            status: "warning",
            title: "Tidak ada terjemahan baru",
            description: "Tidak ada field kosong atau teks yang dapat diterjemahkan.",
          });
        }
      } catch (err: unknown) {
        console.error("Auto-translate error:", err);
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil API terjemahan.";
        toast.push({
          status: "error",
          title: "Gagal Menerjemahkan",
          description: message,
        });
      } finally {
        setIsTranslating(false);
      }
    },
  };
}
