import { defineField, defineType } from "sanity";

export const visionSlide = defineType({
  name: "visionSlide",
  title: "Vision / goals slide",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "localeString",
      description: 'Editorial label, for example "VISION / 01" or "GOALS / 02".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localeText",
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
      title: "headline.id",
      subtitle: "label.id",
      media: "image",
    },
  },
});
