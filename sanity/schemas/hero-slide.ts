import { defineField, defineType } from "sanity";

export const heroSlide = defineType({
  name: "heroSlide",
  title: "Hero slide",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow label",
      type: "string",
      description: "Optional small label shown above the headline.",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      description: "Optional supporting copy shown below the headline.",
    }),
    defineField({
      name: "image",
      title: "Image / poster",
      type: "image",
      options: { hotspot: true },
      description: "Fallback or poster image. Keep this populated when using video.",
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video",
      type: "mux.video",
      description: "Optional Mux upload. Use a 1920x1080 H.264 source up to 60 seconds.",
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
      media: "image",
    },
  },
});
