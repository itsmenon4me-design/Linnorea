import type { Locale } from "./config";
import { defaultLocale } from "./config";
import id from "./dictionaries/id.json";
import en from "./dictionaries/en.json";
import ja from "./dictionaries/ja.json";
import fr from "./dictionaries/fr.json";
import de from "./dictionaries/de.json";
import it from "./dictionaries/it.json";

export type Dictionary = typeof id;

export const dictionaries = {
  id,
  en,
  ja,
  fr,
  de,
  it,
} as const;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
