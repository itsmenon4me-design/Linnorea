import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "SERVICES - Service",
  type: "document",
  description: "Satu layanan yang tampil sebagai kartu pada halaman Services.",
  fieldsets: [
    { name: "content", title: "Service content", options: { collapsible: true, collapsed: false } },
    { name: "media", title: "Service media", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Service title",
      type: "string",
      validation: (Rule) => Rule.required(),
      fieldset: "content",
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
      fieldset: "content",
    }),
    defineField({
      name: "image",
      title: "Service image",
      type: "image",
      options: { hotspot: true },
      description: "Visual representation for the service tile or hero.",
      fieldset: "media",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
      fieldset: "content",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      fieldset: "content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
