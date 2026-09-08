import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const approachItems = [
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

const aboutContent = {
  aboutEstablished: { id: "23 Agustus 2023", en: "Established 23 August 2023" },
  aboutDescription: {
    id: "Linnorea Design Works adalah studio Arsitektur & Desain Interior yang berbasis di Jakarta, fokus menciptakan ruang yang jelas, fungsional, dan bermakna.",
    en: "Linnorea Design Works is an Architectural & Interior Design studio based in Jakarta, focused on creating spaces that are clear, functional, and meaningful.",
  },
  aboutKey: [
    { label: { id: "Presisi", en: "Precision" }, order: 0 },
    { label: { id: "Kejelasan", en: "Clarity" }, order: 1 },
    { label: { id: "Terintegrasi", en: "Integrated" }, order: 2 },
  ],
  aboutVision: {
    id: "Mendefinisikan ulang pengalaman desain dengan menghadirkan ruang yang timeless, purposeful, dan dieksekusi dengan presisi tanpa kompromi.",
    en: "Redefining the design experience by creating spaces that are timeless, purposeful, and executed with uncompromising precision.",
  },
  aboutMission: [
    {
      id: "Menerjemahkan kebutuhan klien menjadi solusi desain yang thoughtful, presisi, dan bertahan lama.",
      en: "Translate each client's needs into design solutions that are thoughtful, precise, and built to last.",
    },
    {
      id: "Memecahkan masalah melalui desain yang meningkatkan cara orang mengalami ruangnya.",
      en: "Solve problems through design that improves how people experience their environment.",
    },
    {
      id: "Menghadirkan ruang yang fungsional, enduring, dan bermakna.",
      en: "Deliver spaces that are functional, enduring, and meaningful.",
    },
    {
      id: "Menjaga kejelasan dan presisi dari konsep hingga eksekusi.",
      en: "Maintain clarity and precision from concept through execution.",
    },
    {
      id: "Membangun solusi secara profesional melalui proses yang terintegrasi.",
      en: "Build solutions professionally through an integrated process.",
    },
  ],
  aboutProcess: [
    {
      title: { id: "Temukan", en: "Discover" },
      description: {
        id: "Memahami kebutuhan, konteks, dan cara klien menjalani ruangnya.",
        en: "Understand the client's needs, context, and the way they experience their space.",
      },
      order: 0,
    },
    {
      title: { id: "Definisikan", en: "Define" },
      description: {
        id: "Merumuskan arah, prioritas, dan parameter proyek sebagai dasar keputusan desain.",
        en: "Define the direction, priorities, and project parameters that guide every design decision.",
      },
      order: 1,
    },
    {
      title: { id: "Rancang", en: "Design" },
      description: {
        id: "Mengembangkan solusi ruang yang jelas, fungsional, dan sesuai tujuan.",
        en: "Develop spatial solutions that are clear, functional, and purposeful.",
      },
      order: 2,
    },
    {
      title: { id: "Eksekusi", en: "Execute" },
      description: {
        id: "Menerjemahkan rancangan ke dalam detail dan pekerjaan lapangan dengan presisi.",
        en: "Translate the design into detailed, precise work on site.",
      },
      order: 3,
    },
    {
      title: { id: "Serah Terima", en: "Handover" },
      description: {
        id: "Menyerahkan ruang yang siap digunakan dengan memastikan hasil akhir sesuai rancangan.",
        en: "Hand over a ready-to-use space while ensuring the final result reflects the design.",
      },
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
