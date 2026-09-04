import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "role", title: "Role", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "bio", title: "Bio", type: "localeText" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0, validation: (Rule) => Rule.required().integer() }),
  ],
  preview: { select: { title: "name", subtitle: "role.id", media: "photo" } },
});
