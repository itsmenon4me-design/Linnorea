import { defineField, defineType } from "sanity";

export const visionSlide = defineType({
  name: "visionSlide",
  title: "HOME - Vision / goals slide",
  type: "document",
  description: "Satu slide untuk bagian vision atau goals pada halaman Home.",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'Editorial label, for example "VISION / 01" or "GOALS / 02".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  preview: {
    select: {
      title: "headline",
      subtitle: "label",
      media: "image",
    },
  },
});
