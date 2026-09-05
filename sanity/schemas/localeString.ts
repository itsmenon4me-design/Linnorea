import { defineType } from "sanity";

const localeFields = [
  { name: "id", title: "Indonesian", type: "string" },
  { name: "en", title: "English", type: "string" },
  { name: "ja", title: "Japanese", type: "string" },
  { name: "fr", title: "French", type: "string" },
  { name: "de", title: "German", type: "string" },
  { name: "it", title: "Italian", type: "string" },
] as const;

export const localeString = defineType({
  name: "localeString",
  title: "Locale string",
  type: "object",
  fields: localeFields.map((field) => ({
    name: field.name,
    title: field.title,
    type: field.type,
  })),
});

export const localeText = defineType({
  name: "localeText",
  title: "Locale text",
  type: "object",
  fields: localeFields.map((field) => ({
    name: field.name,
    title: field.title,
    type: "text",
  })),
});

export const localeBlock = defineType({
  name: "localeBlock",
  title: "Locale block",
  type: "object",
  fields: localeFields.map((field) => ({
    name: field.name,
    title: field.title,
    type: "array",
    of: [{ type: "block" }],
  })),
});
