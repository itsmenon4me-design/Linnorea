import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fieldsets: [
    {
      name: "studioVisual",
      title: "Studio Visual (About page)",
      description: "Isi salah satu, video akan diprioritaskan jika keduanya diisi.",
    },
  ],
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "projectHighlightImages",
      title: "Project highlight images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.max(4),
      description: "Optional images shown in the carousel at the top of the Projects page. Maximum 4 images.",
    }),
    defineField({
      name: "brandStatement",
      title: "Brand statement",
      type: "string",
    }),
    defineField({
      name: "aboutEstablished",
      title: "About established tagline",
      type: "string",
    }),
    defineField({
      name: "aboutDescription",
      title: "About brand description",
      type: "text",
    }),
    defineField({
      name: "aboutKey",
      title: "About Our Key",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Keyword", type: "string" }),
          defineField({ name: "order", title: "Display order", type: "number" }),
        ],
      }],
    }),
    defineField({
      name: "aboutVision",
      title: "About vision",
      type: "text",
    }),
    defineField({
      name: "aboutMission",
      title: "About mission points",
      type: "array",
      of: [{ type: "text" }],
    }),
    defineField({
      name: "aboutProcess",
      title: "About process",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Stage title", type: "string" }),
          defineField({ name: "subtitle", title: "Stage subtitle", type: "string" }),
          defineField({ name: "description", title: "Stage description", type: "text" }),
          defineField({ name: "image", title: "Stage image", type: "image", options: { hotspot: true } }),
          defineField({ name: "order", title: "Display order", type: "number" }),
        ],
      }],
    }),
    defineField({
      name: "studioVisualImage",
      title: "Studio visual image",
      type: "image",
      options: { hotspot: true },
      fieldset: "studioVisual",
    }),
    defineField({
      name: "studioVisualVideo",
      title: "Studio visual video",
      type: "mux.video",
      fieldset: "studioVisual",
    }),
    defineField({
      name: "officeAddress",
      title: "Office address",
      type: "text",
      initialValue: "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430",
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
      type: "string",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [{ type: "socialLink" }],
    }),
    defineField({
      name: "seoDefaults",
      title: "SEO defaults",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "text" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "brandStatement",
    },
  },
});
