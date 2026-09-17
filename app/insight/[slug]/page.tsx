import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { Header } from "@/components/layout/Header";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { formatEditorialDate } from "@/lib/formatDate";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { insightBySlugQuery, insightListQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Insight, InsightContentBlock, PortableTextBlock, SanityImage } from "@/lib/sanity/types";

export const revalidate = 60;

type InsightDetailProps = { params: Promise<{ slug: string }> };

function isPortableTextBlock(block: InsightContentBlock): block is PortableTextBlock {
  return block._type === "block";
}

function isImageBlock(block: InsightContentBlock): block is SanityImage {
  return block._type === "image";
}

function ShareIcon({ type }: { type: "email" | "linkedin" | "instagram" }) {
  if (type === "email") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  }

  if (type === "linkedin") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M5.2 7.3A2 2 0 1 1 5.2 3a2 2 0 0 1 0 4.3ZM3.4 21V9h3.6v12H3.4Zm5.8 0V9h3.4v1.6h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.2Z" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>;
}

export async function generateMetadata({ params }: InsightDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await sanityClient.fetch<Insight | null>(insightBySlugQuery, { slug }, { next: { revalidate } });
  const seo = await getSiteSeo();
  return { title: { absolute: `${insight?.title ?? "Insight"} | ${seo.title}` }, description: insight?.excerpt ?? seo.description };
}

export default async function InsightDetailPage({ params }: InsightDetailProps) {
  const { slug } = await params;
  const [insight, allInsights] = await Promise.all([
    sanityClient.fetch<Insight | null>(insightBySlugQuery, { slug }, { next: { revalidate } }),
    sanityClient.fetch<Insight[]>(insightListQuery, {}, { next: { revalidate } }),
  ]);
  if (!insight) notFound();

  const title = insight.title ?? "Insight";
  const publishedDate = formatEditorialDate(insight.publishedAt);
  const coverUrl = insight.coverImage ? urlFor(insight.coverImage).width(2000).height(1200).fit("crop").auto("format").quality(82).url() : null;
  const relatedInsights = insight.relatedInsights?.length
    ? insight.relatedInsights.filter((item) => item._id !== insight._id)
    : allInsights.filter((item) => item._id !== insight._id).slice(0, 4);
  const additionalInsights = insight.relatedInsights?.length
    ? []
    : allInsights.filter((item) => item._id !== insight._id).slice(4);
  const contentBlocks = insight.content ?? [];
  const editorialSections = insight.sections ?? [];
  const renderBlocks = (blocks: InsightContentBlock[], keyPrefix: string) =>
    blocks.map((block, index) => {
      if (isImageBlock(block)) {
        const imageUrl = urlFor(block).width(1600).height(1000).fit("crop").auto("format").quality(80).url();
        return <Image key={block._key ?? `${keyPrefix}-image-${index}`} src={imageUrl} alt={`${title} image ${index + 1}`} width={1600} height={1000} className="my-14 h-auto w-full object-cover" />;
      }
      if (!isPortableTextBlock(block)) return null;
      const text = block.children?.map((child) => child.text ?? "").join("") ?? "";
      return text ? <p key={block._key ?? `${keyPrefix}-paragraph-${index}`}>{text}</p> : null;
    });

  return (
    <ScrollReveal className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <style>{`
        .insight-detail-hero,
        .insight-detail-grid {
          display: grid;
          gap: 2.5rem;
        }
        .insight-detail-content {
          width: min(1002px, 100%);
          margin-inline: auto;
        }
        .insight-detail-media {
          aspect-ratio: 16 / 9;
        }
        .insight-related-item {
          display: grid;
          grid-template-columns: 192px minmax(0, 539px);
          gap: 40px;
        }
        .insight-related-more {
          display: flex;
          flex-direction: column;
        }
        .insight-related-more summary {
          order: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: fit-content;
          min-height: 44px;
          margin: 24px auto 0;
          padding: 8px 24px;
          border: 1px solid rgb(255 255 255 / 50%);
          border-radius: 999px;
          cursor: pointer;
          list-style: none;
        }
        .insight-related-more summary::-webkit-details-marker {
          display: none;
        }
        .insight-related-more summary::after {
          content: "+";
          font-size: 20px;
          line-height: 1;
        }
        .insight-related-more[open] summary::after {
          content: "−";
        }
        .insight-related-more .insight-related-list {
          order: 1;
        }
        @media (max-width: 47.99rem) {
          .insight-related-item {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
      `}</style>
      <Header dictionary={dictionary} />
      <article className="mx-auto max-w-[88rem] px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32">
        <div className="insight-detail-hero md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
          <Link href="/insight" className="text-xs uppercase tracking-[0.18em] text-white/55 underline decoration-white/25 underline-offset-4">Insights</Link>
          <div className="min-w-0">
            <h1 className="max-w-[720px] font-serif text-5xl font-normal leading-[0.94] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">{title}</h1>
            <div className="mt-6 grid gap-8 text-base leading-7 md:mt-8 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
              <div>
                {publishedDate ? <p className="font-serif text-xl leading-tight text-white md:text-2xl">{publishedDate}</p> : null}
                <div className="mt-5 flex gap-3" aria-label="Share article">
                  <a href={`mailto:?subject=${encodeURIComponent(title)}`} aria-label="Share by email" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="email" /></a>
                  <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="linkedin" /></a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Share on Instagram" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="instagram" /></a>
                </div>
              </div>
              <div className="md:pt-1">
                <p className="text-white/55">By</p>
                <p className="mt-2">{insight.author || "Linnorea"}</p>
                {insight.contributors?.length ? (
                  <div className="mt-8">
                    <p className="text-white/55">With contributions by:</p>
                    <ul className="mt-2 space-y-2">
                      {insight.contributors.map((contributor, index) => {
                        if (!contributor.name) return null;
                        const label = contributor.role ? `${contributor.name} / ${contributor.role}` : contributor.name;
                        return (
                          <li key={`${contributor.name}-${index}`}>
                            {contributor.profileUrl ? (
                              <a href={contributor.profileUrl} target="_blank" rel="noreferrer" className="underline decoration-white/35 underline-offset-4 transition hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                {label}
                              </a>
                            ) : label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 min-w-0 md:mt-36">
          <div className="insight-detail-content">
            <div className="insight-detail-media overflow-hidden bg-[var(--color-bg-elevated)]">
              {coverUrl ? <Image src={coverUrl} alt={title} width={2000} height={1200} className="h-full w-full object-cover" priority /> : <MediaPlaceholder className="h-full w-full" />}
            </div>
            <div className="mt-3 text-xs text-white/50">{title}</div>
            <div className="insight-detail-grid mt-20 border-t border-white/15 pt-8 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{insight.atAGlanceLabel || "At a glance"}</p>
              <div className="max-w-2xl space-y-6 text-lg leading-8 text-white/75">
                {insight.excerpt ? <p>{insight.excerpt}</p> : <p>This insight is ready for its editorial introduction to be added in Sanity Studio.</p>}
              </div>
            </div>

            <div className="mt-24 border-t border-white/15 pt-8">
              <div className="insight-detail-grid md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{insight.category || "Insight"}</p>
                <div className="max-w-2xl space-y-8 text-lg leading-8 text-white/75">
                  {editorialSections.length ? editorialSections.map((section, sectionIndex) => (
                    <section key={`${section.label ?? "section"}-${sectionIndex}`} className="space-y-6">
                      {section.label ? <p className="text-xs uppercase tracking-[0.18em] text-white/55">{section.label}</p> : null}
                      {section.heading ? <h2 className="font-serif text-4xl leading-tight text-white md:text-5xl">{section.heading}</h2> : null}
                      {renderBlocks(section.body ?? [], `section-${sectionIndex}`)}
                    </section>
                  )) : renderBlocks(contentBlocks, "content")}
                  {!editorialSections.length && !contentBlocks.length ? <p className="text-white/60">The full article will appear here after the editorial content is added in Sanity Studio.</p> : null}
                </div>
              </div>
            </div>

            {relatedInsights.length ? (
              <div className="mt-24 border-t border-white/15 pt-8">
                <div className="insight-detail-grid md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{insight.latestInsightsLabel || "Latest Insights"}</p>
                  <div>
                    <h2 className="font-serif text-5xl font-normal leading-[0.94] tracking-[-0.055em] md:text-7xl">{insight.latestInsightsHeading || "Perspectives, trends, news."}</h2>
                    <div className="mt-14 insight-related-list">
                      {relatedInsights.map((item) => {
                        const imageUrl = item.coverImage ? urlFor(item.coverImage).width(600).height(400).fit("crop").auto("format").quality(80).url() : null;
                        return (
                          <Link key={item._id} href={`/insight/${item.slug?.current}`} className="insight-related-item min-w-0 border-b border-white/25 py-8 text-white transition hover:text-white/70">
                            <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]">
                              {imageUrl ? <Image src={imageUrl} alt={item.title ?? "Insight"} width={600} height={400} className="h-full w-full object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
                            </span>
                            <span className="block">
                              <span className="block text-xs uppercase tracking-[0.18em] text-white/45">{item.category}</span>
                              <span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">{item.title}</span>
                              {item.excerpt ? <span className="mt-5 block text-base leading-7 text-white/70">{item.excerpt}</span> : null}
                            </span>
                          </Link>
                        );
                      })}
                      {additionalInsights.length ? (
                        <details className="insight-related-more">
                          <summary className="text-sm text-white">Show more</summary>
                          <div className="insight-related-list">
                            {additionalInsights.map((item) => {
                              const imageUrl = item.coverImage ? urlFor(item.coverImage).width(600).height(400).fit("crop").auto("format").quality(80).url() : null;
                              return (
                                <Link key={item._id} href={`/insight/${item.slug?.current}`} className="insight-related-item min-w-0 border-b border-white/25 py-8 text-white transition hover:text-white/70">
                                  <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]">
                                    {imageUrl ? <Image src={imageUrl} alt={item.title ?? "Insight"} width={600} height={400} className="h-full w-full object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
                                  </span>
                                  <span className="block">
                                    <span className="block text-xs uppercase tracking-[0.18em] text-white/45">{item.category}</span>
                                    <span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">{item.title}</span>
                                    {item.excerpt ? <span className="mt-5 block text-base leading-7 text-white/70">{item.excerpt}</span> : null}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
