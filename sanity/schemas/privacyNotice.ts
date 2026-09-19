import { defineField, defineType } from "sanity";

export const privacyNotice = defineType({
  name: "privacyNotice",
  title: "GLOBAL - Privacy Notice",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      initialValue: "Privacy Notice",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Notice sections",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Section title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "paragraphs", title: "Paragraphs", type: "array", of: [{ type: "text" }], validation: (Rule) => Rule.min(1) }),
        ],
        preview: {
          select: { title: "title" },
        },
      }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title", updatedAt: "_updatedAt" },
    prepare: ({ title, updatedAt }) => ({
      title: title || "Privacy Notice",
      subtitle: updatedAt ? `Last updated ${updatedAt.slice(0, 10)}` : "Not published yet",
    }),
  },
});
