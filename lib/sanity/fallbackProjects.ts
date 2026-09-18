import type { Project } from "@/lib/sanity/types";

const fallbackImage = (name: string) => `/assets/${name}.svg`;

function description(...paragraphs: string[]): Project["description"] {
  return paragraphs.map((text) => ({ _type: "block", children: [{ text }] }));
}

const previewTeam: NonNullable<Project["team"]> = [
  { role: "Principal Partner", members: ["Dummy preview team"] },
  { role: "Associate Partner", members: ["Dummy preview team"] },
  { role: "Design Team", members: ["Dummy preview team", "Content to be replaced from Sanity"] },
];

export const fallbackProjects: Project[] = [
  {
    _id: "fallback-project-01",
    title: "Northline House",
    category: "Architecture",
    market: "Residential",
    styleTag: "Modern Tropical",
    status: "Completed",
    location: "Jakarta",
    year: "2025",
    area: "420 m2",
    coverImage: undefined,
    fallbackImageUrl: fallbackImage("project-dummy-01"),
    fallbackGalleryUrls: [
      `${fallbackImage("project-dummy-01")}?preview=gallery-2`,
      `${fallbackImage("project-dummy-01")}?preview=gallery-3`,
    ],
    team: previewTeam,
    description: description(
      "A compact family residence shaped around shaded courtyards, cross ventilation, and a quiet connection to the garden. The sequence moves from a sheltered entry to a double-height living room, then out toward a planted rear terrace. Its rooms open gradually to planted edges, allowing the family to move from shade to light while keeping the garden present throughout the day.",
      "The house is arranged as a series of calm transitions between enclosure and openness. Deep thresholds temper the tropical light, while planted courts bring air and greenery into the daily path through the home. Living spaces remain visually connected without losing the quiet scale expected of a family retreat.",
      "Material choices keep the atmosphere grounded: warm timber, pale mineral surfaces, and carefully framed views of the garden. Each room is given a distinct relationship to shade, breeze, and landscape so the house feels generous without relying on excess.",
      "This preview content is intentionally split into several paragraphs so the Read More, Read Less, Team, and internal scrolling states can be checked before production content is entered in Sanity."
    ),
  },
  {
    _id: "fallback-project-02",
    title: "Cendana Courtyard",
    category: "Architecture",
    market: "Residential",
    styleTag: "American Classic",
    status: "In Design",
    location: "Bandung",
    year: "2024",
    area: "310 m2",
    fallbackImageUrl: fallbackImage("project-dummy-04"),
    fallbackGalleryUrls: [fallbackImage("project-dummy-01")],
    team: previewTeam,
    description: description("A residential study organized around a planted internal court, with warm timber, deep overhangs, and adaptable rooms for a growing family."),
  },
  {
    _id: "fallback-project-03",
    title: "Riverside Commons",
    category: "Architecture",
    market: "Commercial",
    styleTag: "Adaptive Reuse",
    status: "Under Construction",
    location: "Surabaya",
    year: "2026",
    area: "1,850 m2",
    fallbackImageUrl: fallbackImage("project-dummy-02"),
    fallbackGalleryUrls: [fallbackImage("project-dummy-03"), fallbackImage("project-dummy-04")],
    team: previewTeam,
    description: description("An adaptive reuse concept for a riverside warehouse, retaining the original structural rhythm while introducing a public market, studio spaces, and a shaded civic edge."),
  },
  {
    _id: "fallback-project-04",
    title: "Mawar Arts Pavilion",
    category: "Design",
    market: "Hospitality",
    styleTag: "Culture",
    status: "Proposed",
    location: "Yogyakarta",
    year: "2023",
    area: "760 m2",
    fallbackImageUrl: fallbackImage("project-dummy-03"),
    fallbackGalleryUrls: [],
    team: previewTeam,
    description: description("A small arts pavilion proposal with a flexible hall, outdoor performance steps, and a porous facade that lets the project remain open to the street."),
  },
];
