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
  aboutEstablished: { id: "23 Agustus 2023", en: "23 August 2023" },
  aboutDescription: {
    id: "Linnorea Design Works adalah studio Arsitektur & Desain Interior yang berbasis di Jakarta, fokus menciptakan ruang yang jelas, fungsional, dan bermakna. Di Linnorea, desain lebih dari sekadar menciptakan ruang yang indah. Ini soal memecahkan masalah, meningkatkan cara orang mengalami lingkungannya, dan memberikan solusi yang fungsional, tahan lama, dan dieksekusi secara profesional. Karya kami mencakup proyek residensial dan komersial, menerjemahkan kebutuhan setiap klien menjadi solusi desain yang matang, presisi, dan dibangun untuk bertahan lama.",
    en: "Linnorea Design Works is an Architectural & Interior Design and Build based in Jakarta, focused on creating spaces that are clear, functional, and meaningful. At Linnorea, design is more than creating beautiful spaces. It is about solving problems, improving the way people experience their environment, and delivering solutions that are functional, enduring, and professionally executed. Our work across residential and commercial projects, translating each client’s needs into design solutions that are thoughtful, precise, and built to last.",
  },
  aboutKey: [
    { label: { id: "Presisi", en: "Precision" }, order: 0 },
    { label: { id: "Kejelasan", en: "Clarity" }, order: 1 },
    { label: { id: "Terintegrasi", en: "Integrated" }, order: 2 },
  ],
  aboutVision: {
    id: "Mendefinisikan ulang pengalaman desain dengan menghadirkan ruang yang timeless, purposeful, dan dieksekusi dengan presisi tanpa kompromi.",
    en: "To redefine the design experience by delivering spaces that are timeless, purposeful, and executed with uncompromising precision.",
  },
  aboutMission: [
    {
      id: "Menghadirkan solusi desain yang matang, menyeimbangkan estetika, fungsionalitas, dan nilai jangka panjang.",
      en: "Deliver thoughtful design solutions that balance aesthetics, functionality, and long-term value.",
    },
    {
      id: "Menjaga standar presisi tertinggi melalui proses yang terstruktur, akurasi teknis, dan perhatian yang cermat terhadap detail.",
      en: "Maintain the highest standards of precision through structured processes, technical accuracy, and meticulous attention to detail.",
    },
    {
      id: "Membangun kolaborasi yang transparan dengan klien, konsultan, dan kontraktor di setiap tahap proyek.",
      en: "Build transparent collaboration with clients, consultants, and contractors throughout every stage of the project.",
    },
    {
      id: "Memastikan setiap desain dapat dibangun dengan memadukan visi kreatif, kelayakan teknis, dan pelaksanaan di dunia nyata.",
      en: "Ensure every design is buildable by integrating creative vision with technical feasibility and real-world execution.",
    },
    {
      id: "Terus berinovasi dan meningkatkan metodologi desain, teknologi, serta standar profesional untuk menciptakan dampak yang berkelanjutan.",
      en: "Continuously innovate and improve our design methodology, technology, and professional standards to create lasting impact.",
    },
  ],
  aboutProcess: [
    {
      title: { id: "TEMUKAN", en: "DISCOVER" },
      subtitle: { id: "Memahami sebelum merancang.", en: "Understanding before designing." },
      description: {
        id: "Kami mulai dengan memahami kebutuhan, gaya hidup, kondisi tapak, preferensi, jadwal, dan anggaran Anda. Setiap proyek dimulai dengan pertanyaan yang tepat sebelum keputusan desain dibuat.",
        en: "We begin by understanding your needs, lifestyle, site conditions, preferences, timeline, and budget. Every project starts with the right questions before any design decisions are made.",
      },
      order: 0,
    },
    {
      title: { id: "DEFINISIKAN", en: "DEFINE" },
      subtitle: { id: "Mengubah wawasan menjadi arah.", en: "Turning insights into direction." },
      description: {
        id: "Kami menerjemahkan informasi menjadi arah desain yang jelas, menetapkan prioritas ruang, konsep, fungsionalitas, pendekatan material, dan karakter keseluruhan ruang.",
        en: "We translate the information into a clear design direction—establishing spatial priorities, concept, functionality, material approach, and overall character of the space.",
      },
      order: 1,
    },
    {
      title: { id: "RANCANG", en: "DESIGN" },
      subtitle: { id: "Mengembangkan gagasan secara detail.", en: "Developing the idea in detail." },
      description: {
        id: "Konsep dikembangkan menjadi desain lengkap melalui perencanaan ruang, visualisasi 3D, pemilihan material, gambar teknis, dan keputusan desain yang terperinci.",
        en: "The concept is developed into a complete design through spatial planning, 3D visualization, material selection, technical drawings, and detailed design decisions.",
      },
      order: 2,
    },
    {
      title: { id: "EKSEKUSI", en: "EXECUTE" },
      subtitle: { id: "Mewujudkan desain menjadi kenyataan.", en: "Bringing the design into reality." },
      description: {
        id: "Tim kami mengoordinasikan pelaksanaan dengan memperhatikan dimensi, material, pengerjaan, dan finishing, untuk memastikan hasil terbangun tetap sesuai dengan desain yang telah disetujui.",
        en: "Our team coordinates the execution with attention to dimensions, materials, workmanship, and finishing—ensuring the built result stays aligned with the approved design.",
      },
      order: 3,
    },
    {
      title: { id: "SERAH TERIMA", en: "HANDOVER" },
      subtitle: { id: "Ruang siap dihuni.", en: "A space made ready to live in." },
      description: {
        id: "Kami melakukan pemeriksaan akhir, menyelesaikan detail, dan memastikan ruang yang telah selesai memenuhi standar yang diperlukan sebelum menyerahkannya kepada klien.",
        en: "We conduct final checks, resolve details, and ensure the completed space meets the required standards before handing it over to the client.",
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
