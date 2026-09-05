import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project title",
      type: "localeString",
      description: "Title in Indonesian, English, Japanese, French, German, and Italian.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.id",
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
      description: "Example: Residential, Commercial, Hospitality, etc.",
    }),
    defineField({
      name: "styleTag",
      title: "Style tag",
      type: "localeString",
      description: "Example: Modern Tropical, Compact Tropical, American Classic.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "localeString",
      description: "Project location in each language.",
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
      type: "localeBlock",
      description: "Narrative description for the concept/design story.",
    }),
    defineField({
      name: "scopeOfWork",
      title: "Scope of work",
      type: "localeString",
      description: "Optional summary of scope for each locale.",
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
      title: "title.id",
      media: "coverImage",
    },
  },
});
