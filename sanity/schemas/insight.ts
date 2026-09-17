import { defineField, defineType } from "sanity";

export const insight = defineType({
  name: "insight",
  title: "ABOUT - Insight",
  type: "document",
  description: "Artikel atau insight yang dapat tampil di About dan Services.",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "publishedAt", title: "Published date", type: "date" }),
    defineField({ name: "author", title: "By", type: "string", initialValue: "Linnorea" }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text" }),
    defineField({ name: "atAGlanceLabel", title: "At a glance label", type: "string", initialValue: "At a glance" }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "contributors",
      title: "Contributors",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({ name: "profileUrl", title: "Profile URL", type: "url" }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        },
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "sections",
      title: "Editorial sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Section label", type: "string" }),
            defineField({ name: "heading", title: "Section heading", type: "string" }),
            defineField({
              name: "body",
              title: "Section content",
              type: "array",
              of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
            }),
          ],
          preview: { select: { title: "heading", subtitle: "label" } },
        },
      ],
    }),
    defineField({ name: "latestInsightsLabel", title: "Latest Insights label", type: "string", initialValue: "Latest Insights" }),
    defineField({ name: "latestInsightsHeading", title: "Latest Insights heading", type: "string", initialValue: "Perspectives, trends, news." }),
    defineField({
      name: "relatedInsights",
      title: "Related Insights",
      type: "array",
      of: [{ type: "reference", to: [{ type: "insight" }] }],
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
