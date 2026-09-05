export const locales = ["id", "en", "ja", "fr", "de", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

export const localeLabels: Record<Locale, string> = {
  id: "ID",
  en: "EN",
  ja: "JP",
  fr: "FR",
  de: "DE",
  it: "IT",
};
