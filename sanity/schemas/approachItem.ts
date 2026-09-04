import { defineField, defineType } from "sanity";

export const approachItem = defineType({
  name: "approachItem",
  title: "Approach item",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "localeText", validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0, validation: (Rule) => Rule.required().integer() }),
  ],
  preview: { select: { title: "title.id", subtitle: "description.id" } },
});
