import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "ABOUT - Team member",
  type: "document",
  description: "Data orang yang ditampilkan pada bagian team halaman About.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "role", title: "Role", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0, validation: (Rule) => Rule.required().integer() }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
