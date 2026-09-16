import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { insightBySlugQuery } from "@/lib/sanity/queries";
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

export async function generateMetadata({ params }: InsightDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await sanityClient.fetch<Insight | null>(insightBySlugQuery, { slug }, { next: { revalidate } });
  const seo = await getSiteSeo();
  return { title: { absolute: `${insight?.title ?? "Insight"} | ${seo.title}` }, description: insight?.excerpt ?? seo.description };
}

export default async function InsightDetailPage({ params }: InsightDetailProps) {
  const { slug } = await params;
  const insight = await sanityClient.fetch<Insight | null>(insightBySlugQuery, { slug }, { next: { revalidate } });
  if (!insight) notFound();

  const title = insight.title ?? "Insight";
  const coverUrl = insight.coverImage ? urlFor(insight.coverImage).width(2000).height(1200).fit("crop").auto("format").quality(82).url() : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <article className="mx-auto max-w-[88rem] px-5 pb-24 pt-36 md:px-8 md:pb-36 md:pt-52">
        <Link href="/insight" className="text-xs uppercase tracking-[0.2em] text-white/55 underline decoration-white/25 underline-offset-4">Insights</Link>
        <div className="mt-10 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">{insight.category}</p>
          <h1 className="mt-6 font-serif text-5xl font-normal leading-[0.92] tracking-[-0.06em] md:text-8xl">{title}</h1>
          {insight.publishedAt ? <p className="mt-8 text-sm text-white/55">{insight.publishedAt}</p> : null}
        </div>
        <div className="mt-16 overflow-hidden bg-[var(--color-bg-elevated)] md:mt-24">
          {coverUrl ? <Image src={coverUrl} alt={title} width={2000} height={1200} className="h-auto w-full object-cover" priority /> : <MediaPlaceholder className="aspect-[16/9] w-full" />}
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-8 text-lg leading-8 text-white/80 md:mt-24 md:text-xl md:leading-9">
          {insight.excerpt ? <p className="text-2xl leading-tight text-white md:text-4xl">{insight.excerpt}</p> : null}
          {insight.content?.map((block, index) => {
            if (isImageBlock(block)) {
              const imageUrl = urlFor(block).width(1600).height(1000).fit("crop").auto("format").quality(80).url();
              return <Image key={block._key ?? `image-${index}`} src={imageUrl} alt={`${title} image ${index + 1}`} width={1600} height={1000} className="my-12 h-auto w-full object-cover" />;
            }
            if (!isPortableTextBlock(block)) return null;
            const text = block.children?.map((child) => child.text ?? "").join("") ?? "";
            return text ? <p key={block._key ?? `paragraph-${index}`}>{text}</p> : null;
          })}
          {!insight.excerpt && !insight.content?.length ? <p className="text-white/60">This insight is ready for the editorial content to be added in Sanity Studio.</p> : null}
        </div>
      </article>
    </main>
  );
}
