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

const insightSeeds = [
  {
    _id: "insight-watg-wimberly-august-2026",
    title: "Design Works in Focus: August 2026",
    slug: { _type: "slug", current: "linnorea-design-works-in-focus" },
    category: "NEWS",
    publishedAt: "2026-08-31",
    excerpt: "A monthly view of hospitality design, responsible renovation, and the teams shaping meaningful places.",
    order: 0,
  },
  {
    _id: "insight-guardians-lagen-island",
    title: "The Guardians of Island Light",
    slug: { _type: "slug", current: "regional-detail" },
    category: "DESIGN + INNOVATION",
    publishedAt: "2026-08-30",
    excerpt: "How a legacy island retreat can evolve with care for place, memory, and the people who return to it.",
    order: 1,
  },
  {
    _id: "insight-wimberly-top-hospitality-firms",
    title: "A New Chapter for Hospitality Design",
    slug: { _type: "slug", current: "wimberly-interiors-press" },
    category: "NEWS",
    publishedAt: "2026-08-29",
    excerpt: "A closer look at the ideas and collaborations shaping the next generation of hospitality spaces.",
    order: 2,
  },
  {
    _id: "insight-hospitality-renovation",
    title: "Designing the Next Chapter of a Stay",
    slug: { _type: "slug", current: "hospitality-renovation" },
    category: "DESIGN + INNOVATION",
    publishedAt: "2026-08-28",
    excerpt: "Owners and developers are rethinking amenity strategy to create lasting value through renovation.",
    order: 3,
  },
  {
    _id: "insight-hualuxe-conversation",
    title: "In Conversation: A New Life for the City Hotel",
    slug: { _type: "slug", current: "city-hotel-new-life" },
    category: "PROJECT STORIES",
    publishedAt: "2026-08-27",
    excerpt: "How a former office tower became a welcoming hospitality destination shaped by local rhythms.",
    order: 4,
  },
  {
    _id: "insight-regional-growth",
    title: "Beyond Growth: Designing What Comes Next",
    slug: { _type: "slug", current: "beyond-growth-designing-whats-next" },
    category: "STRATEGY + RESEARCH",
    publishedAt: "2026-08-26",
    excerpt: "A place-based view of how hospitality can grow with stronger regional identity and care.",
    order: 5,
  },
  {
    _id: "insight-landscape-leads",
    title: "When the Landscape Leads",
    slug: { _type: "slug", current: "when-the-landscape-leads" },
    category: "PROJECT STORIES",
    publishedAt: "2026-08-25",
    excerpt: "A destination shaped by forest, lake, terrain, and the character of its setting.",
    order: 6,
  },
  {
    _id: "insight-designing-belonging",
    title: "Designing for Belonging",
    slug: { _type: "slug", current: "designing-for-belonging" },
    category: "DESIGN + INNOVATION",
    publishedAt: "2026-08-24",
    excerpt: "A place-based hospitality approach that makes arrival, gathering, and return feel connected.",
    order: 7,
  },
];

const serviceSeeds = [
  {
    _id: "service-spatial-planning",
    title: "Spatial planning",
    slug: { _type: "slug", current: "spatial-planning" },
    description: "We shape the relationship between rooms, movement, light, and daily use so every space feels clear from the first step inside.",
    order: 0,
  },
  {
    _id: "service-concept-development",
    title: "Concept development",
    slug: { _type: "slug", current: "concept-development" },
    description: "We turn the character of a place and the needs of its people into a focused design direction with a distinct sense of atmosphere.",
    order: 1,
  },
  {
    _id: "service-material-direction",
    title: "Material direction",
    slug: { _type: "slug", current: "material-direction" },
    description: "We bring surfaces, colour, furniture, lighting, and crafted details together into a material language that can endure.",
    order: 2,
  },
  {
    _id: "service-design-build",
    title: "Design and build",
    slug: { _type: "slug", current: "design-and-build" },
    description: "We stay close to the making, coordinating design intent and execution so the finished space remains faithful to the idea.",
    order: 3,
  },
];

async function seed() {
  await Promise.all(approachItems.map((item) => client.createIfNotExists(item)));
  const existingSettings = await client.fetch<{ _id: string } | null>(
    '*[_type == "siteSettings"][0]{_id}',
  );
  const settingsId = existingSettings?._id ?? "site-settings";
  await client.createIfNotExists({ _id: settingsId, _type: "siteSettings" });
  await client.patch(settingsId).set(aboutContent).commit();
  const projects = await client.fetch<Array<{ coverImage?: unknown }>>(
    '*[_type == "project"] | order(order asc, _createdAt asc)[0...4]{coverImage}',
  );
  await Promise.all(
    serviceSeeds.map((service, index) =>
      client.createIfNotExists({
        ...service,
        _type: "service",
        image: projects[index]?.coverImage,
      }),
    ),
  );
  const editorialContent = [
    { _key: "editorial-intro", _type: "block", children: [{ _key: "intro-text", _type: "span", text: "A closer look at how thoughtful renovation can protect the character of a place while making room for new rituals, new uses, and a longer future." }] },
    { _key: "editorial-place", _type: "block", children: [{ _key: "place-text", _type: "span", text: "The first reading is always the place itself. Climate, memory, craft, and the patterns of daily life become the material for a design that feels specific rather than applied." }] },
    projects[0]?.coverImage ? { _key: "editorial-place-image", _type: "image", ...projects[0].coverImage } : null,
    { _key: "editorial-quote", _type: "block", children: [{ _key: "quote-text", _type: "span", text: "The strongest spaces do not replace what was there. They make its meaning easier to feel." }] },
    { _key: "editorial-making", _type: "block", children: [{ _key: "making-text", _type: "span", text: "Preservation becomes a design opportunity when existing structures, local materials, and careful making guide the next chapter. The result is quieter, more durable, and more connected to its setting." }] },
    projects[1]?.coverImage ? { _key: "editorial-making-image", _type: "image", ...projects[1].coverImage } : null,
    { _key: "editorial-conclusion", _type: "block", children: [{ _key: "conclusion-text", _type: "span", text: "This is the work of making spaces that welcome change without losing their sense of belonging." }] },
  ].filter((block) => block !== null);
  await Promise.all(
    insightSeeds.map((insight, index) =>
      client.createIfNotExists({
        ...insight,
        _type: "insight",
        coverImage: projects[index % projects.length]?.coverImage,
        content: [],
      }),
    ),
  );
  await Promise.all(
    insightSeeds.slice(0, 4).map((insight) =>
      client.patch(insight._id).set({
        title: insight.title,
        category: insight.category,
        excerpt: insight.excerpt,
        ...(insight._id === "insight-watg-wimberly-august-2026" ? { content: editorialContent } : {}),
      }).commit(),
    ),
  );
  const verification = await client.fetch<{ approach: number; settings: number; insights: number; services: number; editorialBlocks: number }>(`
    {
      "approach": count(*[_type == "approachItem"]),
      "settings": count(*[_type == "siteSettings"]),
      "insights": count(*[_type == "insight"]),
      "services": count(*[_type == "service"]),
      "editorialBlocks": count(*[_type == "insight" && slug.current == "linnorea-design-works-in-focus"][0].content)
    }
  `);
  console.log(`Seeded ${approachItems.length} approach items, About content, ${serviceSeeds.length} Services, and ${insightSeeds.length} Insight entries. Verified counts: ${JSON.stringify(verification)}`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
