import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const items = [
  "Listen before designing.",
  "Let the room lead.",
  "Make daily rituals feel considered.",
].map((title, index) => ({
  _id: `approach-item-${index + 1}`,
  _type: "approachItem",
  title: { id: title },
  description: { id: "[Placeholder approach copy, awaiting final content]" },
  order: index,
}));

async function seed() {
  await Promise.all(items.map((item) => client.createIfNotExists(item)));
  console.log(`Seeded ${items.length} approach items.`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
