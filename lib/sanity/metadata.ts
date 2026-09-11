import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { type SiteSettings } from "@/lib/sanity/types";

const defaultSeoTitle = "Linnorea Design Works";
const defaultSeoDescription = "Placeholder foundation for the Linnorea Design Works website rebuild.";

export async function getSiteSeo() {
  const settings = await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery);

  return {
    title: settings?.seoDefaults?.title || defaultSeoTitle,
    description: settings?.seoDefaults?.description || defaultSeoDescription,
  };
}
