import { defineField, defineType } from "sanity";

export const heroSlide = defineType({
  name: "heroSlide",
  title: "HOME - Hero slide",
  type: "document",
  description: "Satu slide utama yang tampil pada bagian paling atas halaman Home.",
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
      description: "Optional Mux upload. Use a 3840x2160 4K H.264 master up to 60 seconds; Mux will deliver adaptive quality per device.",
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
