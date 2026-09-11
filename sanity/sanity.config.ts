import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { localeBlock, localeString, localeText } from "./schemas/localeString";
import { muxInput } from "sanity-plugin-mux-input";
import { heroSlide } from "./schemas/hero-slide";
import { visionSlide } from "./schemas/vision-slide";
import { project } from "./schemas/project";
import { product } from "./schemas/product";
import { service } from "./schemas/service";
import { siteSettings } from "./schemas/siteSettings";
import { socialLink } from "./schemas/socialLink";
import { approachItem } from "./schemas/approachItem";
import { teamMember } from "./schemas/teamMember";
import { structure } from "./structure";
import { AutoTranslateAction } from "./actions/autoTranslate";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "stol8iwq";
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "linnorea-studio",
  title: "Linnorea Design Works",
  projectId,
  dataset,
  plugins: [
    muxInput({
      acceptedMimeTypes: ["video/*"],
      maxAssetDuration: 60,
      max_resolution_tier: "1080p",
    }),
    structureTool({ structure }),
    visionTool(),
  ],
  document: {
    actions: (prev, context) => {
      // Add AutoTranslate action to all supported document types
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
      if (supportedTypes.includes(context.schemaType)) {
        return [AutoTranslateAction, ...prev];
      }
      return prev;
    },
  },
  schema: {
    types: [
      localeString,
      localeText,
      localeBlock,
      heroSlide,
      visionSlide,
      project,
      service,
      product,
      siteSettings,
      socialLink,
      approachItem,
      teamMember,
    ],
  },
});
