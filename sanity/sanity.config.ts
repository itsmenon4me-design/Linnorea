import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
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
  schema: {
    types: [
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
