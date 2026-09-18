import { defineField, defineType } from "sanity";

export const insight = defineType({
  name: "insight",
  title: "ABOUT - Insight",
  type: "document",
  description: "Artikel atau insight yang dapat tampil di About dan Services.",
  fieldsets: [
    { name: "basic", title: "Basic information", options: { collapsible: true, collapsed: false } },
    { name: "media", title: "Cover and contributors", options: { collapsible: true, collapsed: false } },
    { name: "article", title: "Article content", options: { collapsible: true, collapsed: false } },
    { name: "related", title: "Related content", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required(), fieldset: "basic" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      fieldset: "basic",
    }),
    defineField({ name: "category", title: "Category", type: "string", fieldset: "basic" }),
    defineField({ name: "publishedAt", title: "Published date", type: "date", fieldset: "basic" }),
    defineField({ name: "author", title: "Author", type: "string", initialValue: "Linnorea", fieldset: "basic" }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", description: "Short summary used on insight cards and page metadata.", fieldset: "basic" }),
    defineField({ name: "atAGlanceLabel", title: "At a glance label", type: "string", initialValue: "At a glance", fieldset: "article" }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true }, description: "Main image shown on insight cards and at the top of the detail page.", fieldset: "media" }),
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
      fieldset: "media",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      fieldset: "article",
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
      fieldset: "article",
    }),
    defineField({ name: "latestInsightsLabel", title: "Latest Insights label", type: "string", initialValue: "Latest Insights", fieldset: "related" }),
    defineField({ name: "latestInsightsHeading", title: "Latest Insights heading", type: "string", initialValue: "Perspectives, trends, news.", fieldset: "related" }),
    defineField({
      name: "relatedProject",
      title: "Related project",
      type: "reference",
      to: [{ type: "project" }],
      description: "Choose the project card shown above Latest Insights on this insight's detail page.",
      fieldset: "related",
    }),
    defineField({
      name: "relatedInsights",
      title: "Related Insights",
      type: "array",
      of: [{ type: "reference", to: [{ type: "insight" }] }],
      description: "Choose the insight cards shown in the Latest Insights section. Leave empty to use the latest insights automatically.",
      fieldset: "related",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0, fieldset: "basic" }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
