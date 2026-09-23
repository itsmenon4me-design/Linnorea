import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "PRODUCTS - Product",
  type: "document",
  description: "One product shown in the Products listing and its detail page.",
  fieldsets: [
    { name: "content", title: "Product content", options: { collapsible: true, collapsed: false } },
    { name: "media", title: "Product images", options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Product name",
      type: "string",
      validation: (Rule) => Rule.required(),
      fieldset: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      fieldset: "content",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
      description: "Images shown on the product detail page. Add them in display order.",
      fieldset: "media",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Short product description shown on the listing and detail page.",
      fieldset: "content",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first in the Products listing.",
      fieldset: "content",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images.0",
    },
  },
});
