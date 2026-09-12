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

export type SeoDefaults = {
  title?: string;
  description?: string;
};

export type SocialLink = {
  platform?: string;
  url?: string;
};

export type HeroSlide = {
  _id: string;
  _type?: string;
  image?: SanityImage;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  heroVideo?: MuxVideo;
  order?: number;
};

export type VisionSlide = {
  _id: string;
  _type?: string;
  label?: string;
  headline?: string;
  description?: string;
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
  title?: string;
  slug?: { current?: string };
  coverImage?: SanityImage;
  gallery?: SanityImage[];
  heroVideo?: { asset?: { _ref?: string; url?: string } };
  category?: string;
  status?: string;
  styleTag?: string;
  homeTagline?: string;
  location?: string;
  year?: string;
  area?: string;
  description?: PortableTextBlock[];
  scopeOfWork?: string;
  featured?: boolean;
  order?: number;
};

export type ServiceProjectCard = Pick<Project, "_id" | "title" | "slug" | "coverImage" | "category" | "location" | "homeTagline">;

export type SiteSettings = {
  projectHighlightImages?: SanityImage[];
  brandStatement?: string;
  aboutEstablished?: string;
  aboutDescription?: string;
  aboutKey?: Array<{ label?: string; order?: number }>;
  aboutVision?: string;
  aboutMission?: string[];
  aboutProcess?: Array<{ title?: string; subtitle?: string; description?: string; image?: SanityImage; order?: number }>;
  studioVisualImage?: SanityImage;
  studioVisualVideo?: MuxVideo;
  officeAddress?: string;
  googleMapsUrl?: string;
  whatsappNumber?: string;
  whatsappCtaText?: string;
  socialLinks?: SocialLink[];
  seoDefaults?: SeoDefaults;
};

export type ApproachItem = {
  _id: string;
  title?: string;
  description?: string;
  order?: number;
};

export type TeamMember = {
  _id: string;
  name?: string;
  role?: string;
  bio?: string;
  photo?: SanityImage;
  order?: number;
};

export type Service = {
  _id: string;
  title?: string;
  image?: SanityImage;
  description?: string;
  order?: number;
};

export type Product = {
  _id: string;
  name?: string;
  images?: SanityImage[];
  description?: string;
  order?: number;
};

export function plainText(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = value as Record<string, unknown>;
    for (const locale of ["id", "en", "ja", "fr", "de", "it"]) {
      const selected: string = plainText(localized[locale]);
      if (selected) return selected;
    }
    return "";
  }

  return (typeof value === "string" ? value : "")
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

export function portableTextToPlainText(value: unknown): string {
  if (value && !Array.isArray(value) && typeof value === "object") {
    const localized = value as Record<string, unknown>;
    for (const locale of ["id", "en", "ja", "fr", "de", "it"]) {
      const selected = portableTextToPlainText(localized[locale]);
      if (selected) return selected;
    }
    return "";
  }

  if (!Array.isArray(value)) return "";

  return (value as PortableTextBlock[])
    .map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .filter(Boolean)
    .join("\n\n") ?? "";
}
