import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project title",
      type: "string",
      description: "Single project title. Write in the preferred editorial language.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description: "Primary image for the project listing and detail page hero.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Additional project photos for the story narrative.",
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video",
      type: "file",
      description: "Optional video for an immersive project hero.",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Architecture", value: "Architecture" },
          { title: "Art", value: "Art" },
          { title: "Design", value: "Design" },
        ],
        layout: "radio",
      },
      description: "Choose one primary archive category for the project.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Free-text project status. Use Ongoing for current work; blank values are treated as completed.",
    }),
    defineField({
      name: "styleTag",
      title: "Typology",
      type: "string",
      description: "Filter label for the project typology, for example Residential, Commercial, or Hospitality.",
    }),
    defineField({
      name: "homeTagline",
      title: "Home highlight tagline",
      type: "string",
      description: "Short supporting line shown under this project when it appears in the Home highlights.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Project location.",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: "Project completion year or period.",
    }),
    defineField({
      name: "area",
      title: "Area",
      type: "string",
      description: "Project size such as 120 m².",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Narrative description for the concept/design story.",
    }),
    defineField({
      name: "scopeOfWork",
      title: "Scope of work",
      type: "string",
      description: "Optional summary of scope.",
    }),
    defineField({
      name: "team",
      title: "Project team",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "role", title: "Role", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "members", title: "Members", type: "array", of: [{ type: "string" }], validation: (Rule) => Rule.min(1) }),
        ],
        preview: {
          select: { title: "role" },
        },
      }],
      description: "People or companies involved in this project, grouped by role.",
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Used to define listing and next/previous project browsing order.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
    },
  },
});
