import type { Insight } from "@/lib/sanity/types";

export function uniqueImageInsights(insights: Insight[]): Insight[] {
  const seenAssets = new Set<string>();

  return insights.filter((insight) => {
    const assetRef = insight.coverImage?.asset?._ref;
    if (!assetRef || seenAssets.has(assetRef)) return false;

    seenAssets.add(assetRef);
    return true;
  });
}
