import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { Header } from "@/components/layout/Header";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { dictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { projectBySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { plainText, type Project } from "@/lib/sanity/types";

type PreviewDetailPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

function ShareIcon({ type }: { type: "email" | "linkedin" | "instagram" }) {
  if (type === "email") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  }

  if (type === "linkedin") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M5.2 7.3A2 2 0 1 1 5.2 3a2 2 0 0 1 0 4.3ZM3.4 21V9h3.6v12H3.4Zm5.8 0V9h3.4v1.6h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.2Z" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>;
}

const previewContent = {
  project: {
    eyebrow: "PROJECTS",
    title: "Tropical Courtyard House",
    description: "A compact tropical home organised around a shaded courtyard, where daylight, planting, and cross-ventilation shape the rhythm of everyday life.",
    meta: "Bali, Indonesia",
  },
  insight: {
    eyebrow: "INSIGHTS",
    title: "Design Works in Focus: August 2026",
    description: "A press roundup covering responsible renovation, hospitality design, and the teams shaping meaningful places.",
    meta: "August 31, 2026",
  },
  profile: {
    eyebrow: "PEOPLE",
    title: "Preview profile 01",
    description: "Preview biography: the studio works across place, material, and cultural memory, building thoughtful relationships between the work and its setting.",
    meta: "Creative Director, Linnorea",
  },
} as const;

const previewInsightContent = {
  "preview-linnorea-design-works-in-focus": {
    title: "Design Works in Focus: August 2026",
    description: "A press roundup covering responsible renovation, hospitality design, and the teams shaping meaningful places.",
    meta: "August 31, 2026",
  },
  "preview-regional-detail": {
    title: "The Guardians of Island Light",
    description: "A closer look at how legacy properties can evolve responsibly through local knowledge and preservation.",
    meta: "Design + Innovation",
  },
  "preview-wimberly-interiors-press": {
    title: "A New Chapter for Hospitality Design",
    description: "A closer look at the ideas and collaborations shaping the next generation of hospitality spaces.",
    meta: "News",
  },
  "preview-hospitality-renovation": {
    title: "Bringing Hospitality Design to Renovation and Amenitization",
    description: "Owners and developers are rethinking amenity strategy. Hospitality design principles now turn renovation into lasting value.",
    meta: "Design + Innovation",
  },
} as const;

function getPreviewContent(type: string, slug: string) {
  if (type === "insight" && slug in previewInsightContent) {
    return { ...previewContent.insight, ...previewInsightContent[slug as keyof typeof previewInsightContent] };
  }

  return previewContent[type as keyof typeof previewContent] ?? previewContent.project;
}

export async function generateMetadata({ params }: PreviewDetailPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const content = getPreviewContent(type, slug);
  return { title: `${content.title} | Preview` };
}

export default async function PreviewDetailPage({ params }: PreviewDetailPageProps) {
  const { type, slug } = await params;
  const content = getPreviewContent(type, slug);
  const isInsight = type === "insight";
  const project = type === "project"
    ? await sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate: 60 } })
    : null;
  const projectImage = project?.coverImage ? urlFor(project.coverImage).width(1800).height(1100).fit("crop").auto("format").quality(82).url() : null;

  return (
    <ScrollReveal className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <style>{`
        .preview-detail-hero,
        .preview-detail-grid {
          display: grid;
          gap: 2.5rem;
        }
        .preview-detail-wide {
          width: 100%;
        }
        .preview-insight-content {
          width: min(1002px, 100%);
          margin-inline: auto;
        }
        .preview-detail-media {
          aspect-ratio: 3 / 2;
        }
        .preview-insight-media {
          aspect-ratio: 16 / 9;
        }
        .preview-latest-item {
          display: grid;
          grid-template-columns: 192px 539px;
          gap: 40px;
        }
        .preview-latest-section {
          width: min(1336px, calc(100vw - 88px));
          margin-left: 50%;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: 334px minmax(0, 1002px);
        }
        .preview-latest-label {
          padding-top: 14px;
        }
        .preview-latest-copy {
          display: block;
          width: min(100%, 420px);
        }
        .preview-latest-list {
          margin-top: 60px;
        }
        .preview-latest-more {
          display: flex;
          flex-direction: column;
          margin-top: 0;
        }
        .preview-latest-more summary {
          order: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: fit-content;
          min-height: 44px;
          margin-inline: auto;
          padding: 8px 24px;
          border: 1px solid rgb(255 255 255 / 50%);
          border-radius: 999px;
          margin-top: 24px;
          cursor: pointer;
          list-style: none;
        }
        .preview-latest-more summary::-webkit-details-marker {
          display: none;
        }
        .preview-latest-more summary::after {
          content: "+";
          font-size: 20px;
          line-height: 1;
        }
        .preview-latest-more[open] summary::after {
          content: "−";
        }
        .preview-latest-more .preview-latest-item {
          margin-top: 0;
          padding-top: 32px;
        }
        .preview-latest-more > .preview-latest-list {
          order: 1;
          margin-top: 0;
        }
        @keyframes preview-latest-item-reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .preview-latest-more[open] .preview-latest-list > [data-expandable-item] {
          animation: preview-latest-item-reveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .preview-latest-more[open] .preview-latest-list > [data-expandable-item]:nth-child(2) {
          animation-delay: 0.12s;
        }
        .preview-latest-more[open] .preview-latest-list > [data-expandable-item]:nth-child(3) {
          animation-delay: 0.24s;
        }
        .preview-latest-more[open] .preview-latest-list > [data-expandable-item]:nth-child(4) {
          animation-delay: 0.36s;
        }
        .preview-project-media {
          aspect-ratio: 16 / 9;
        }
        @media (max-width: 47.99rem) {
          .preview-latest-section {
            width: 100%;
            margin-left: 0;
            transform: none;
            display: block;
          }
          .preview-latest-label {
            padding-top: 0;
            margin-bottom: 24px;
          }
          .preview-latest-item {
            grid-template-columns: 112px minmax(0, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 48rem) {
          .preview-detail-hero,
          .preview-detail-grid {
            grid-template-columns: 264px minmax(0, 1fr);
            gap: 59px;
          }
          .preview-detail-wide {
            width: min(878px, calc(100% - 323px));
            margin-left: 323px;
          }
          .preview-detail-media {
            width: 100%;
          }
        }
      `}</style>
      <Header dictionary={dictionary} />
      <section data-reveal-item className="mx-auto max-w-[90rem] px-5 pb-24 pt-40 md:px-8 md:pb-40 md:pt-52">
        <div data-reveal-item className="preview-detail-hero min-w-0">
          <div className="pt-2">
            <p className="w-fit border-b border-white/60 pb-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80">{content.eyebrow}</p>
          </div>
          <div className="min-w-0">
            <h1 className={`min-w-0 font-serif text-5xl font-normal leading-[0.94] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[5.5rem] ${isInsight ? "max-w-[720px]" : "max-w-4xl"}`}>{content.title}</h1>
            <p className="mt-10 font-serif text-3xl leading-tight text-white md:mt-12 md:text-5xl">{content.meta}</p>
            {type === "profile" ? <p className="mt-8 text-xl leading-8 text-white/80">B.Arch, ARB, RIBA</p> : null}
            {type === "insight" ? <div className="mt-8 flex gap-3" aria-label="Preview sharing links">
              <a href="mailto:?subject=A shared approach to place" aria-label="Share by email" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="email" /></a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="linkedin" /></a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Share on Instagram" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ShareIcon type="instagram" /></a>
            </div> : null}
          </div>
        </div>
        {type === "profile" ? (
          <>
            <div data-reveal-item className="preview-detail-wide mt-20 md:mt-28 md:ml-auto md:w-2/3">
              <div className="preview-detail-media overflow-hidden bg-[var(--color-bg-elevated)]">
                <MediaPlaceholder className="h-full w-full" />
              </div>
            </div>
            <div data-reveal-item className="preview-detail-grid mt-24 grid gap-10 md:grid-cols-2 md:gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">About</p>
              <div className="max-w-2xl space-y-8 text-lg leading-8 text-white/75">
                <p>{content.description}</p>
                <p>Preview biography: the studio works across place, material, and cultural memory, building thoughtful relationships between the work and its setting.</p>
                <p>Our team brings together creative direction, spatial design, and material research to shape work that belongs to its context.</p>
              </div>
            </div>
            <div data-reveal-item className="preview-detail-grid mt-24 grid gap-10 border-t border-white/15 pt-8 md:grid-cols-2 md:gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Contact</p>
              <div className="text-lg leading-8 text-white/75">
                <p>Bali studio</p>
                <p className="text-white/55">Preview office details and contact information</p>
              </div>
            </div>
          </>
        ) : type === "insight" ? (
          <div data-reveal-item className="mt-24 min-w-0 md:mt-36">
            <div className="preview-insight-content">
              <div data-reveal-image className="preview-insight-media overflow-hidden bg-[var(--color-bg-elevated)]">
                <MediaPlaceholder className="h-full w-full" />
              </div>
              <div className="mt-3 text-xs text-white/50">Lagen Island Resort, El Nido — project image</div>
              <div className="preview-detail-grid mt-20 grid gap-10 border-t border-white/15 pt-8 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">At a glance</p>
                <div className="max-w-2xl space-y-6 text-lg leading-8 text-white/75">
                  <p>Design Works in Focus is a monthly press roundup documenting responsible renovation, hospitality design, and the teams shaping meaningful places.</p>
                  <p>An island retreat was the month&apos;s biggest story, picked up by several outlets following its reopening. Elsewhere, coverage included a heritage hotel, a hospitality design ranking, and a regional strategy study.</p>
                </div>
              </div>
              <div data-reveal-item className="mt-24 border-t border-white/15 pt-8">
                <div className="grid gap-10 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <span className="text-xs uppercase tracking-[0.18em] text-white/55">Island retreat</span>
                <div className="space-y-6 text-lg leading-8 text-white/75">
                  <p>The reopening brought attention to the collaborative work behind a renewed guest experience.</p>
                  <p>The design treats local culture as part of the experience, drawing from stories, craftsmanship, and philosophies rather than applying motifs as decoration.</p>
                </div>
                </div>
                <figure className="mt-14">
                  <div className="preview-insight-media overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></div>
                  <figcaption className="mt-3 text-xs text-white/50">Island retreat — interior design and arrival sequence</figcaption>
                </figure>
              </div>
              <blockquote data-reveal-item className="mt-24 border-t border-white/15 pt-8 font-serif text-4xl leading-[1.05] text-white md:text-6xl">
                “From the outset, we wanted local culture to shape the experience rather than simply decorate it.”
                <cite className="mt-8 block font-sans text-sm not-italic tracking-normal text-white/65">— Editorial perspective</cite>
              </blockquote>
              <div data-reveal-item className="mt-24 border-t border-white/15 pt-8">
                <div className="grid gap-10 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <a href="https://hospitalitydesign.com/projects/lagen-island-resort-the-philippines/635922" target="_blank" rel="noreferrer" className="text-xs uppercase tracking-[0.18em] text-white underline decoration-white/30 underline-offset-4">Hospitality Design</a>
                <div className="space-y-6 text-lg leading-8 text-white/75">
                  <p><a href="https://hospitalitydesign.com/projects/lagen-island-resort-the-philippines/635922" target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4">Hospitality Design</a> published an in-depth project feature covering the preservation-first approach across the arrival sequence, guestrooms, and new Sunset Bar.</p>
                  <p>Preservation became the catalyst for innovation: existing structures, local materials, and modular fabrication guide the resort&apos;s renewal while reducing unnecessary transport and demolition.</p>
                </div>
                </div>
                <figure className="mt-14">
                  <div className="preview-insight-media overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></div>
                  <figcaption className="mt-3 text-xs text-white/50">Island retreat — project image</figcaption>
                </figure>
              </div>
              <div data-reveal-item className="mt-24 border-t border-white/15 pt-8">
                <div className="grid gap-10 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <span className="text-xs uppercase tracking-[0.18em] text-white/55">Four Seasons Hotel &amp; Residences Cartagena</span>
                <p className="text-lg leading-8 text-white/75">A regional publication reported on the hotel&apos;s inclusion in a 2026 list of leading luxury hotels, naming the architecture and interiors teams behind the project.</p>
                </div>
                <figure className="mt-14">
                  <div className="preview-insight-media overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></div>
                  <figcaption className="mt-3 text-xs text-white/50">Four Seasons Hotel &amp; Residences Cartagena</figcaption>
                </figure>
              </div>
              <div className="mt-24 border-t border-white/15 pt-8">
                <div className="grid gap-10 md:grid-cols-[228px_minmax(0,1fr)] md:gap-8">
                <span className="text-xs uppercase tracking-[0.18em] text-white/55">Ras El Hekma</span>
                <p className="text-lg leading-8 text-white/75">A regional study examined how a coastal investment wave can become a year-round tourism economy.</p>
                </div>
                <figure className="mt-14">
                  <div className="preview-insight-media overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></div>
                  <figcaption className="mt-3 text-xs text-white/50">Ras El Hekma — project image</figcaption>
                </figure>
              </div>
              <div className="mt-24 border-t border-white/15 pt-8">
                <div className="preview-latest-section">
                  <p className="preview-latest-label text-xs uppercase tracking-[0.18em] text-white/55">Latest Insights</p>
                  <div>
                    <h2 className="font-serif text-5xl font-normal leading-[0.94] tracking-[-0.055em] md:text-7xl">Perspectives, trends, news.</h2>
                    <div className="preview-latest-list">
                  <Link href="/preview/insight/preview-regional-detail?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-0 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Design + Innovation</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">The Guardians of Island Light</span><span className="mt-5 block text-base leading-7 text-white/70">How a legacy island retreat can evolve with care for place, memory, and return.</span></span>
                  </Link>
                  <Link href="/preview/insight/preview-wimberly-interiors-press?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">News</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">A New Chapter for Hospitality Design</span><span className="mt-5 block text-base leading-7 text-white/70">Ideas and collaborations shaping the next generation of hospitality spaces.</span></span>
                  </Link>
                  <Link href="/preview/insight/preview-hospitality-renovation?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Design + Innovation</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">Bringing Hospitality Design to Renovation and Amenitization</span><span className="mt-5 block text-base leading-7 text-white/70">Owners and developers are rethinking amenity strategy. Hospitality design principles now turn renovation into lasting value.</span></span>
                  </Link>
                  <Link href="/preview/project/preview-the-river-rooms?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Project Stories</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">In Conversation: A New Life for the City Hotel</span><span className="mt-5 block text-base leading-7 text-white/70">A former office tower becomes a welcoming hospitality destination shaped by local rhythms.</span></span>
                  </Link>
                    </div>
                    <details data-reveal-expandable className="preview-latest-more">
                      <summary className="text-sm text-white">Show more</summary>
                      <div className="preview-latest-list">
                  <Link data-expandable-item href="/preview/insight/preview-regional-detail?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Project Stories</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">Design Works in Focus: July 2026</span><span className="mt-5 block text-base leading-7 text-white/70">A further press roundup covering recent hospitality work, research, and project partnerships.</span></span>
                  </Link>
                  <Link data-expandable-item href="/preview/insight/preview-wimberly-interiors-press?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Strategy + Research</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">Beyond Growth: Designing What&apos;s Next for the Sunbelt</span><span className="mt-5 block text-base leading-7 text-white/70">A place-based view of how hospitality can grow with stronger regional identity.</span></span>
                  </Link>
                  <Link data-expandable-item href="/preview/insight/preview-regional-detail?preview=1" className="preview-latest-item min-w-0 border-b border-white/25 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Project Stories</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">Thanh Xuan Valley: Why the Landscape Leads</span><span className="mt-5 block text-base leading-7 text-white/70">A destination shaped by forest, lake, terrain, and the character of its setting.</span></span>
                  </Link>
                  <Link data-expandable-item href="/preview/insight/preview-hospitality-renovation?preview=1" className="preview-latest-item min-w-0 pt-8 pb-9 text-white transition">
                    <span className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]"><MediaPlaceholder className="h-full w-full" /></span>
                    <span className="preview-latest-copy"><span className="block text-xs uppercase tracking-[0.18em] text-white/45">Design + Innovation</span><span className="mt-4 block text-xl font-medium leading-7 underline decoration-white/40 underline-offset-4">Designing for Belonging: A Place-Based Hospitality Approach</span><span className="mt-5 block text-base leading-7 text-white/70">A dummy insight reserved for the next client-published story.</span></span>
                  </Link>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-detail-wide mt-24 min-w-0 md:mt-36">
            <div className="preview-project-media relative overflow-hidden bg-[var(--color-bg-elevated)]">
              {projectImage ? <Image src={projectImage} alt={content.title} fill sizes="(min-width: 768px) 878px, 100vw" className="object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
            </div>
            <div className="preview-detail-grid mt-16 grid gap-10 md:grid-cols-2 md:gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Project overview</p>
              <div className="space-y-8 text-lg leading-8 text-white/75">
                <p>{plainText(project?.description) || content.description}</p>
                <p>The plan keeps the living spaces close to the garden, allowing the house to open and close with the weather. Deep thresholds temper the sun while giving each room a direct relationship with the planted centre.</p>
              </div>
            </div>
            <div className="preview-detail-grid mt-20 grid gap-10 border-t border-white/15 pt-8 md:grid-cols-2 md:gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Design approach</p>
              <div className="space-y-8 text-lg leading-8 text-white/75">
                <p>Local stone, warm timber, and quiet plaster surfaces form a restrained material palette that can weather naturally in the humid climate.</p>
                <p>Rooms are sequenced from the shaded arrival court to the brighter garden edge, making movement through the house part of the experience rather than a corridor between destinations.</p>
              </div>
            </div>
            <div className="preview-detail-grid mt-20 grid gap-10 border-t border-white/15 pt-8 md:grid-cols-2 md:gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Project details</p>
              <div className="grid gap-4 text-lg leading-8 text-white/75 sm:grid-cols-2">
                <p><span className="block text-xs uppercase tracking-[0.16em] text-white/45">Location</span>{project?.location || content.meta}</p>
                <p><span className="block text-xs uppercase tracking-[0.16em] text-white/45">Category</span>{project?.category || "Residential"}</p>
                {project?.year ? <p><span className="block text-xs uppercase tracking-[0.16em] text-white/45">Year</span>{project.year}</p> : null}
                {project?.scopeOfWork ? <p><span className="block text-xs uppercase tracking-[0.16em] text-white/45">Scope</span>{plainText(project.scopeOfWork)}</p> : null}
              </div>
            </div>
            <div className="mt-20 border-t border-white/15 pt-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Project gallery</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {(project?.gallery?.length ? project.gallery : [null, null]).map((image, index) => {
                  const galleryImage = image ? urlFor(image).width(1200).height(800).fit("crop").auto("format").quality(82).url() : null;
                  return (
                    <div key={image?._key ?? `gallery-placeholder-${index}`} className="relative aspect-[3/2] overflow-hidden bg-[var(--color-bg-elevated)]">
                      {galleryImage ? <Image src={galleryImage} alt={`${content.title} view ${index + 1}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <Link href="/about?preview=1" className="mt-10 inline-flex min-h-11 items-center border-b border-white/45 pb-2 text-[10px] uppercase tracking-[0.22em] text-white/80 transition hover:border-white hover:text-white">Back to About preview</Link>
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}
