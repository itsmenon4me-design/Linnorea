export const projectMarkets = [
  "Hospitality",
  "Residential",
  "Commercial",
  "Workplace",
  "Cultural",
  "Civic & Public",
] as const;

export type ProjectMarket = (typeof projectMarkets)[number];
