import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { localizedSeoValue, type SiteSettings } from "@/lib/sanity/types";

const defaultSeoTitle = "Linnorea Design Works";
const defaultSeoDescription = "Placeholder foundation for the Linnorea Design Works website rebuild.";

export async function getSiteSeo(locale: Locale) {
  const settings = await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery);
  const safeLocale = locale || defaultLocale;

  return {
    title: localizedSeoValue(settings?.seoDefaults, "title", safeLocale) || defaultSeoTitle,
    description: localizedSeoValue(settings?.seoDefaults, "description", safeLocale) || defaultSeoDescription,
  };
}
