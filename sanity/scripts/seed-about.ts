import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const approachItems = [
  "Listen before designing.",
  "Let the room lead.",
  "Make daily rituals feel considered.",
].map((title, index) => ({
  _id: `approach-item-${index + 1}`,
  _type: "approachItem",
  title,
  description: "[Placeholder approach copy, awaiting final content]",
  order: index,
}));

const aboutContent = {
  aboutEstablished: "23 August 2023",
  aboutDescription: "Linnorea Design Works is an Architectural & Interior Design and Build based in Jakarta, focused on creating spaces that are clear, functional, and meaningful. At Linnorea, design is more than creating beautiful spaces. It is about solving problems, improving the way people experience their environment, and delivering solutions that are functional, enduring, and professionally executed. Our work across residential and commercial projects, translating each client’s needs into design solutions that are thoughtful, precise, and built to last.",
  aboutKey: [
    { label: "Precision", order: 0 },
    { label: "Clarity", order: 1 },
    { label: "Integrated", order: 2 },
  ],
  aboutPrinciplesIntro: "The character of a place is already there. Our work begins by noticing it.",
  aboutPrinciplesContext: "Context is not a constraint. It is the material that gives a space its own voice.",
  aboutPrinciples: [
    {
      title: "Place",
      description: "We begin with climate, memory, ritual, and the way a site belongs to the people who use it. The existing story sets the direction.",
      order: 0,
    },
    {
      title: "Material",
      description: "We choose surfaces and textures for the atmosphere they create, and for the way they gather patina, warmth, and permanence over time.",
      order: 1,
    },
    {
      title: "Experience",
      description: "Every room, threshold, and view is shaped around the way people move, gather, pause, and return to a place.",
      order: 2,
    },
  ],
  aboutVision: "To redefine the design experience by delivering spaces that are timeless, purposeful, and executed with uncompromising precision.",
  aboutVisionSupport: "To make spaces that do not ask for attention, but reward it: spaces with an atmosphere that grows more meaningful through use, memory, and time.",
  aboutMission: [
    "Deliver thoughtful design solutions that balance aesthetics, functionality, and long-term value.",
    "Maintain the highest standards of precision through structured processes, technical accuracy, and meticulous attention to detail.",
    "Build transparent collaboration with clients, consultants, and contractors throughout every stage of the project.",
    "Ensure every design is buildable by integrating creative vision with technical feasibility and real-world execution.",
    "Continuously innovate and improve our design methodology, technology, and professional standards to create lasting impact.",
  ],
  aboutMissionLead: "We create spaces that feel grounded, generous, and deeply lived in.",
  aboutMissionSupport: "A practice of care, from first reading to final detail.",
  aboutMissionDetails: [
    {
      label: "With context",
      description: "Every decision begins with the place, its conditions, and the lives that will unfold there.",
      order: 0,
    },
    {
      label: "With care",
      description: "We stay close to the making, refining the details that turn an idea into an enduring experience.",
      order: 1,
    },
  ],
  aboutProcess: [
    {
      title: "DISCOVER",
      subtitle: "Understanding before designing.",
      description: "We begin by understanding your needs, lifestyle, site conditions, preferences, timeline, and budget. Every project starts with the right questions before any design decisions are made.",
      order: 0,
    },
    {
      title: "DEFINE",
      subtitle: "Turning insights into direction.",
      description: "We translate the information into a clear design direction, establishing spatial priorities, concept, functionality, material approach, and overall character of the space.",
      order: 1,
    },
    {
      title: "DESIGN",
      subtitle: "Developing the idea in detail.",
      description: "The concept is developed into a complete design through spatial planning, 3D visualization, material selection, technical drawings, and detailed design decisions.",
      order: 2,
    },
    {
      title: "EXECUTE",
      subtitle: "Bringing the design into reality.",
      description: "Our team coordinates the execution with attention to dimensions, materials, workmanship, and finishing, ensuring the built result stays aligned with the approved design.",
      order: 3,
    },
    {
      title: "HANDOVER",
      subtitle: "A space made ready to live in.",
      description: "We conduct final checks, resolve details, and ensure the completed space meets the required standards before handing it over to the client.",
      order: 4,
    },
  ],
};

async function seed() {
  await Promise.all(approachItems.map((item) => client.createIfNotExists(item)));
  const existingSettings = await client.fetch<{ _id: string } | null>(
    '*[_type == "siteSettings"][0]{_id}',
  );
  const settingsId = existingSettings?._id ?? "site-settings";
  await client.createIfNotExists({ _id: settingsId, _type: "siteSettings" });
  await client.patch(settingsId).set(aboutContent).commit();
  console.log(`Seeded ${approachItems.length} approach items and About content.`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
