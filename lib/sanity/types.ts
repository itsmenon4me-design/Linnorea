export type SanityImage = {
  _key?: string;
  _type?: string;
  asset?: {
    _ref?: string;
    _id?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
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
  category?: string;
  status?: string;
  market?: string;
  styleTag?: string;
  homeTagline?: string;
  location?: string;
  year?: string;
  area?: string;
  description?: PortableTextBlock[];
  scopeOfWork?: string;
  atAGlance?: PortableTextBlock[];
  editorialSections?: Array<{
    label?: string;
    heading?: string;
    body?: PortableTextBlock[];
    image?: SanityImage;
  }>;
  quote?: string;
  quoteAuthor?: string;
  featured?: boolean;
  order?: number;
  fallbackImageUrl?: string;
  fallbackGalleryUrls?: string[];
  team?: Array<{ role: string; members: string[] }>;
};

export type ServiceProjectCard = Pick<Project, "_id" | "title" | "slug" | "coverImage" | "category" | "location" | "homeTagline">;

export type SiteSettings = {
  logo?: SanityImage;
  projectHighlightImages?: SanityImage[];
  homeHighlightsLabel?: string;
  homeHighlightsTitle?: string;
  homeHighlightsEmpty?: string;
  homeDiscoverLabel?: string;
  brandStatement?: string;
  aboutEstablished?: string;
  aboutDescription?: string;
  aboutKey?: Array<{ label?: string; order?: number }>;
  aboutPrinciplesIntro?: string;
  aboutPrinciplesContext?: string;
  aboutPrinciples?: Array<{ title?: string; description?: string; image?: SanityImage; order?: number }>;
  aboutVision?: string;
  aboutVisionSupport?: string;
  aboutVisionImage?: SanityImage;
  aboutMission?: string[];
  aboutMissionLead?: string;
  aboutMissionSupport?: string;
  aboutMissionDetails?: Array<{ label?: string; description?: string; order?: number }>;
  aboutMissionImage?: SanityImage;
  aboutProcess?: Array<{ title?: string; subtitle?: string; description?: string; image?: SanityImage; order?: number }>;
  aboutPageLabel?: string;
  aboutPrinciplesLabel?: string;
  aboutVisionLabel?: string;
  aboutMissionLabel?: string;
  aboutProcessLabel?: string;
  aboutPrinciplesAside?: string;
  aboutVisionAside?: string;
  aboutMissionAside?: string;
  aboutProcessAside?: string;
  servicesPageLabel?: string;
  servicesPageHeading?: string;
  servicesPageDescription?: string;
  servicesProcessLabel?: string;
  servicesProcessHeading?: string;
  servicesProcessDescription?: string;
  servicesProcess?: Array<{ title?: string; description?: string; image?: SanityImage; order?: number }>;
  aboutCtaHeading?: string;
  studioVisualImage?: SanityImage;
  studioVisualVideo?: MuxVideo;
  officeAddress?: string;
  googleMapsUrl?: string;
  whatsappNumber?: string;
  whatsappCtaText?: string;
  socialLinks?: SocialLink[];
  seoDefaults?: SeoDefaults;
};

export type PrivacyNotice = {
  _id: string;
  title?: string;
  intro?: string;
  sections?: Array<{ title?: string; paragraphs?: string[] }>;
  _updatedAt?: string;
};

export type Insight = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  category?: string;
  publishedAt?: string;
  author?: string;
  excerpt?: string;
  atAGlanceLabel?: string;
  coverImage?: SanityImage;
  contributors?: Array<{ name?: string; role?: string; profileUrl?: string }>;
  content?: InsightContentBlock[];
  sections?: Array<{ label?: string; heading?: string; body?: InsightContentBlock[] }>;
  latestInsightsLabel?: string;
  latestInsightsHeading?: string;
  relatedProject?: Project;
  relatedInsights?: Insight[];
  order?: number;
};

export type InsightContentBlock = PortableTextBlock | SanityImage;

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
  return (typeof value === "string" ? value : "")
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

export function portableTextToPlainText(value: unknown): string {
  return portableTextToParagraphs(value).join("\n\n");
}

export function portableTextToParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return (value as PortableTextBlock[])
    .map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .filter(Boolean);
}
