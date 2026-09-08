import type { Locale } from "@/lib/i18n/config";

export type LocalizedString = Partial<Record<Locale, string>> & {
  id?: string;
  en?: string;
};

export type SanityImage = {
  _key?: string;
  _type?: string;
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

export type MuxVideo = {
  asset?: {
    playbackId?: string;
    status?: string;
  };
};

export type LocalizedSeo = Partial<Record<Locale, {
  title?: string;
  description?: string;
}>>;

export type SocialLink = {
  platform?: string;
  url?: string;
};

export type HeroSlide = {
  _id: string;
  _type?: string;
  image?: SanityImage;
  eyebrow?: LocalizedString;
  headline?: LocalizedString;
  subheadline?: LocalizedString;
  heroVideo?: MuxVideo;
  order?: number;
};

export type VisionSlide = {
  _id: string;
  _type?: string;
  label?: LocalizedString;
  headline?: LocalizedString;
  description?: LocalizedString;
  image?: SanityImage;
  order?: number;
};

export type PortableTextBlock = {
  _key?: string;
  _type?: string;
  children?: Array<{ text?: string }>;
};

export type Project = {
  _id: string;
  title?: LocalizedString;
  slug?: { current?: string };
  coverImage?: SanityImage;
  gallery?: SanityImage[];
  heroVideo?: { asset?: { _ref?: string; url?: string } };
  category?: string;
  status?: string;
  styleTag?: LocalizedString;
  homeTagline?: LocalizedString;
  location?: LocalizedString;
  year?: string;
  area?: string;
  description?: Partial<Record<Locale, PortableTextBlock[]>>;
  scopeOfWork?: LocalizedString;
  featured?: boolean;
  order?: number;
};

export type SiteSettings = {
  projectHighlightImages?: SanityImage[];
  brandStatement?: LocalizedString;
  aboutEstablished?: LocalizedString;
  aboutDescription?: LocalizedString;
  aboutKey?: Array<{ label?: LocalizedString; order?: number }>;
  aboutVision?: LocalizedString;
  aboutMission?: LocalizedString[];
  aboutProcess?: Array<{ title?: LocalizedString; subtitle?: LocalizedString; description?: LocalizedString; image?: SanityImage; order?: number }>;
  studioVisualImage?: SanityImage;
  studioVisualVideo?: MuxVideo;
  officeAddress?: Partial<Record<Locale, string>>;
  googleMapsUrl?: string;
  whatsappNumber?: string;
  whatsappCtaText?: LocalizedString;
  socialLinks?: SocialLink[];
  seoDefaults?: LocalizedSeo;
};

export type ApproachItem = {
  _id: string;
  title?: LocalizedString;
  description?: LocalizedString;
  order?: number;
};

export type TeamMember = {
  _id: string;
  name?: string;
  role?: LocalizedString;
  bio?: LocalizedString;
  photo?: SanityImage;
  order?: number;
};

export type Service = {
  _id: string;
  title?: LocalizedString;
  image?: SanityImage;
  description?: LocalizedString;
  order?: number;
};

export type Product = {
  _id: string;
  name?: LocalizedString;
  images?: SanityImage[];
  description?: LocalizedString;
  order?: number;
};

export function localizedValue(value: LocalizedString | undefined, locale: Locale) {
  return value?.[locale] ?? value?.en ?? value?.id ?? "";
}

export function localizedSeoValue(value: LocalizedSeo | undefined, key: "title" | "description", locale: Locale) {
  return value?.[locale]?.[key] ?? value?.en?.[key] ?? value?.id?.[key] ?? "";
}

export function plainText(value: string | undefined) {
  return (value ?? "")
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

export function portableTextToPlainText(blocks: PortableTextBlock[] | undefined) {
  return blocks
    ?.map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .filter(Boolean)
    .join("\n\n") ?? "";
}
