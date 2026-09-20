import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { dictionary } from "@/lib/i18n/dictionaries";
import { uniqueImageInsights } from "@/lib/sanity/insights";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { insightListQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Insight } from "@/lib/sanity/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `Insights | ${seo.title}` }, description: seo.description };
}

export default async function InsightListingPage() {
  const insights = await sanityClient.fetch<Insight[]>(insightListQuery, {}, { next: { revalidate } });
  const visibleInsights = uniqueImageInsights(insights);

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <section className="mx-auto max-w-[88rem] px-5 pb-24 pt-36 md:px-8 md:pb-36 md:pt-52">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55">Insights</p>
        <h1 className="mt-8 max-w-5xl font-serif text-5xl font-normal leading-[0.92] tracking-[-0.06em] md:text-8xl">Perspectives, trends, news.</h1>
        {visibleInsights.length ? (
          <div className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-4">
            {visibleInsights.map((insight) => {
              const imageUrl = insight.coverImage ? urlFor(insight.coverImage).width(3840).height(2562).fit("crop").auto("format").quality(80).url() : null;
              return (
                <Link key={insight._id} href={`/insight/${insight.slug?.current}`} className="group min-w-0">
                  <div className="relative aspect-[3/2] overflow-hidden bg-[var(--color-bg-elevated)]">
                    {imageUrl ? <Image src={imageUrl} alt={insight.title ?? "Insight"} fill quality={80} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : <MediaPlaceholder className="h-full w-full" />}
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/55">{insight.category}</p>
                  <h2 className="mt-4 text-xl font-medium leading-tight underline decoration-transparent underline-offset-4 transition group-hover:decoration-white/40">{insight.title}</h2>
                  {insight.excerpt ? <p className="mt-4 text-base leading-7 text-white/70">{insight.excerpt}</p> : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-20 border-t border-white/15 pt-8 text-lg text-white/60">No insights have been published yet.</p>
        )}
      </section>
    </main>
  );
}
