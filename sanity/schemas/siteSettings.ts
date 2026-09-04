import { defineField, defineType } from "sanity";

const localeMeta = [
  { name: "id", title: "Indonesian" },
  { name: "en", title: "English" },
  { name: "ja", title: "Japanese" },
  { name: "fr", title: "French" },
  { name: "de", title: "German" },
  { name: "it", title: "Italian" },
] as const;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "brandStatement",
      title: "Brand statement",
      type: "localeString",
    }),
    defineField({
      name: "officeAddress",
      title: "Office address",
      type: "localeText",
      initialValue: {
        id: "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430",
      },
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      description: "Use the full WhatsApp number or link destination.",
    }),
    defineField({
      name: "whatsappCtaText",
      title: "WhatsApp CTA text",
      type: "localeString",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: ["Instagram", "Threads", "LinkedIn", "Pinterest"],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "platform",
              subtitle: "url",
            },
          },
        },
      ],
    }),
    defineField({
      name: "seoDefaults",
      title: "SEO defaults",
      type: "object",
      fields: localeMeta.map((locale) => ({
        name: locale.name,
        title: locale.title,
        type: "object",
        fields: [
          defineField({
            name: "title",
            title: "Title",
            type: "string",
          }),
          defineField({
            name: "description",
            title: "Description",
            type: "text",
          }),
        ],
      })),
    }),
  ],
  preview: {
    select: {
      title: "brandStatement.id",
    },
  },
});
