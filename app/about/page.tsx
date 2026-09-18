import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { AboutInsightCards } from "@/components/sections/AboutInsightCards";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { uniqueImageInsights } from "@/lib/sanity/insights";
import { urlFor } from "@/lib/sanity/image";
import { insightListQuery, projectListQuery, siteSettingsQuery, teamMembersQuery } from "@/lib/sanity/queries";
import { plainText, type Insight, type Project, type SiteSettings, type TeamMember } from "@/lib/sanity/types";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.about} | ${seo.title}` }, description: seo.description };
}

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const [settings, projects, teamMembers, insights] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<TeamMember[]>(teamMembersQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<Insight[]>(insightListQuery, {}, { next: { revalidate } }),
  ]);
  const established = isPreview ? "Preview studio timeline" : plainText(settings?.aboutEstablished) || dictionary.about.establishedPlaceholder;
  const description = isPreview
    ? "Preview introduction: Linnorea is a design studio shaping places, objects, and experiences through a close reading of landscape, culture, and everyday life."
    : plainText(settings?.aboutDescription) || dictionary.about.descriptionPlaceholder;
  const processItems = settings?.aboutProcess ?? [];
  const fallbackPrinciples = [
    { title: "Place", description: "We begin with climate, memory, ritual, and the way a site belongs to the people who use it. The existing story sets the direction.", image: undefined },
    { title: "Material", description: "We choose surfaces and textures for the atmosphere they create, and for the way they gather patina, warmth, and permanence over time.", image: undefined },
    { title: "Experience", description: "Every room, threshold, and view is shaped around the way people move, gather, pause, and return to a place.", image: undefined },
  ];
  const principles = isPreview ? fallbackPrinciples : settings?.aboutPrinciples?.length ? settings.aboutPrinciples : fallbackPrinciples;
  const fallbackMissionDetails = [
    { label: "With context", description: "Every decision begins with the place, its conditions, and the lives that will unfold there." },
    { label: "With care", description: "We stay close to the making, refining the details that turn an idea into an enduring experience." },
  ];
  const missionDetails = isPreview ? fallbackMissionDetails : settings?.aboutMissionDetails?.length ? settings.aboutMissionDetails : fallbackMissionDetails;
  const selectedProjects = projects.filter((project) => project.coverImage?.asset?._ref).slice(0, 4);
  const previewProjects: Project[] = [
    { _id: "preview-project-01", title: "Tropical Courtyard House", slug: { current: "preview-tropical-courtyard-house" }, category: "Residential", location: "Bali, Indonesia", homeTagline: "A quieter relationship between home and landscape.", coverImage: selectedProjects[0]?.coverImage },
    { _id: "preview-project-02", title: "Marea House", slug: { current: "preview-marea-house" }, category: "Residential", location: "Lombok, Indonesia", homeTagline: "Material warmth shaped around coastal light.", coverImage: selectedProjects[1]?.coverImage },
    { _id: "preview-project-03", title: "The River Rooms", slug: { current: "preview-the-river-rooms" }, category: "Hospitality", location: "Ubud, Indonesia", homeTagline: "A stay designed as a sequence of calm thresholds.", coverImage: selectedProjects[2]?.coverImage },
    { _id: "preview-project-04", title: "Linnorea Objects", slug: { current: "preview-linnorea-objects" }, category: "Product", location: "Jakarta, Indonesia", homeTagline: "Small pieces with a sense of place.", coverImage: selectedProjects[3]?.coverImage },
  ];
  const previewInsights = [
    { ...previewProjects[2], category: "NEWS", title: "Design Works in Focus: August 2026", slug: { current: "preview-linnorea-design-works-in-focus" }, homeTagline: "A monthly view of hospitality design, responsible renovation, and the teams shaping meaningful places.", coverImage: selectedProjects[2]?.coverImage },
    { ...previewProjects[3], category: "DESIGN + INNOVATION", title: "The Guardians of Island Light", slug: { current: "preview-regional-detail" }, homeTagline: "How a legacy island retreat can evolve with care for place, memory, and return.", coverImage: selectedProjects[0]?.coverImage },
    { ...previewProjects[1], category: "NEWS", title: "A New Chapter for Hospitality Design", slug: { current: "preview-wimberly-interiors-press" }, homeTagline: "Ideas and collaborations shaping the next generation of hospitality spaces.", coverImage: selectedProjects[1]?.coverImage },
    { ...previewProjects[0], category: "DESIGN + INNOVATION", title: "Bringing Hospitality Design to Renovation and Amenitization", slug: { current: "preview-hospitality-renovation" }, homeTagline: "Owners and developers are rethinking amenity strategy. Hospitality design principles now turn renovation into lasting value.", coverImage: selectedProjects[3]?.coverImage },
  ];
  const aboutInsights = isPreview ? previewInsights : uniqueImageInsights(insights);
  const insightCards = aboutInsights.map((insight) => ({
    ...insight,
    slug: insight.slug?.current ?? "",
    summary: "homeTagline" in insight ? insight.homeTagline : insight.excerpt,
  }));
  const aboutCards = isPreview
    ? insightCards.map((item) => ({
        _id: item._id,
        title: item.title,
        category: item.category,
        coverImage: item.coverImage,
        summary: item.summary,
        href: `/insight/${item.slug}`,
      }))
    : insightCards.length
      ? insightCards.map((item) => ({
          _id: item._id,
          title: item.title,
          category: item.category ?? "Insight",
          coverImage: item.coverImage,
          summary: item.summary,
          href: `/insight/${item.slug}`,
        }))
      : [
          ...selectedProjects.map((project) => ({
          _id: project._id,
          title: project.title,
          category: project.category ?? project.styleTag ?? "Project",
          coverImage: project.coverImage,
          summary: project.homeTagline || plainText(project.location),
          href: project.slug?.current ? `/project/${project.slug.current}` : "/project",
          })),
        ];
  const leadership = teamMembers.filter((member) => member.name && member.photo?.asset?._ref);
  const previewProcessItems = [
    { title: "Listen first", subtitle: "Preview process stage", description: "We begin with the character of a place, the people around it, and the everyday rituals the work should support.", image: selectedProjects[0]?.coverImage },
    { title: "Shape the idea", subtitle: "Preview process stage", description: "References, material studies, and spatial sketches become one clear direction that can be tested together.", image: selectedProjects[1]?.coverImage },
    { title: "Make it real", subtitle: "Preview process stage", description: "The final work is refined through details, prototypes, and close collaboration from first drawing to handover.", image: selectedProjects[2]?.coverImage },
  ];
  const previewLeadership = [
    { name: "Preview profile 01", role: "Creative direction", office: "Bali studio", slug: "preview-profile-01" },
    { name: "Preview profile 02", role: "Spatial design", office: "Jakarta studio", slug: "preview-profile-02" },
    { name: "Preview profile 03", role: "Project leadership", office: "Singapore studio", slug: "preview-profile-03" },
    { name: "Preview profile 04", role: "Material research", office: "Yogyakarta studio", slug: "preview-profile-04" },
  ];
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <style>{`
        .about-card-list { display: grid; }
        .about-card-item {
          display: grid;
          grid-template-columns: clamp(120px, 28vw, 184px) minmax(0, 1fr);
          gap: 24px;
          min-width: 0;
          padding-block: 36px;
          border-bottom: 1px solid rgb(255 255 255 / 0.2);
        }
        .about-card-item:first-child { padding-top: 0; }
        .about-card-item:last-child { border-bottom: 0; }
        .about-card-copy { margin-top: 0; }
        .about-process-copy,
        .about-process-section [data-reveal-image] {
          transform: none !important;
          translate: none !important;
          scale: none !important;
          rotate: none !important;
        }
        .about-process-section {
          margin-top: 0 !important;
          opacity: 1 !important;
          transform: none !important;
        }
        .about-card-list--editorial {
          grid-template-columns: minmax(0, 1fr) !important;
          column-gap: 0;
          row-gap: 48px;
        }
        .about-card-list--editorial .about-card-item {
          display: block;
          padding-block: 0;
          border-bottom: 0;
        }
        .about-card-list--editorial .about-card-copy {
          margin-top: 20px;
        }
        @media (min-width: 1024px) {
          .about-card-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 32px;
            row-gap: 0;
          }
          .about-card-item {
            grid-template-columns: minmax(140px, 0.42fr) minmax(0, 0.58fr);
            gap: 24px;
            padding-block: 28px;
            border-bottom: 1px solid rgb(255 255 255 / 0.2);
          }
          .about-card-item:nth-child(-n + 2) { padding-top: 0; }
          .about-card-item:nth-last-child(-n + 2) { border-bottom: 0; }
          .about-card-copy { margin-top: 0; }
          .about-card-list--leadership {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            column-gap: 32px;
            row-gap: 56px;
          }
          .about-card-list--leadership .about-card-item {
            display: block;
            padding-block: 0;
            border-bottom: 0;
          }
          .about-card-list--leadership .about-card-item:nth-child(-n + 2) {
            padding-top: 0;
          }
          .about-card-list--leadership .about-card-item:nth-last-child(-n + 2) {
            border-bottom: 0;
          }
          .about-card-list--leadership .about-card-copy {
            margin-top: 20px;
          }
          .about-card-list--editorial {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            column-gap: 40px;
            row-gap: 64px;
          }
        }
      `}</style>
      <Header dictionary={dictionary} />
      <section className="bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-20 pt-36 md:px-8 md:pb-32 md:pt-52">
          <div className="max-w-6xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">{plainText(settings?.aboutPageLabel) || dictionary.nav.home}</p>
            <h1 className="mt-8 max-w-5xl font-serif text-5xl font-normal leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-[5.25rem]">
              {dictionary.nav.about}
            </h1>
            <p className="mt-10 max-w-4xl text-xl leading-[1.15] tracking-[-0.03em] text-white/85 md:mt-14 md:text-[28px] md:leading-[1.15]">
              {description}
            </p>
          </div>
          <div className="relative mt-16 aspect-[16/9] w-full overflow-hidden bg-[var(--color-bg-elevated)] md:mt-24">
            <StudioVisual image={settings?.studioVisualImage} video={settings?.studioVisualVideo} videoLabel={dictionary.ui.studioVideo} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 md:px-8 md:pt-14">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55">
          {dictionary.about.establishedLabel.replace("{date}", established)}
        </p>
      </div>

      <ScrollReveal as="section" className="mx-auto max-w-[88rem] px-5 pb-28 md:px-8 md:pb-44">
        <div data-reveal className="min-w-0 pt-6">
          <div className="flex items-start justify-between gap-8">
            <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{plainText(settings?.aboutPrinciplesLabel) || "Principles"}</p>
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{plainText(settings?.aboutPrinciplesAside) || "A way of looking"}</span>
          </div>
          <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div className="flex flex-col justify-between gap-12">
              <p className="max-w-xl font-serif text-[2.9rem] leading-[0.9] tracking-[-0.065em] text-white md:text-[4.6rem] md:leading-[0.88] lg:max-w-md lg:text-[5.1rem]">
                {plainText(settings?.aboutPrinciplesIntro) || "The character of a place is already there. Our work begins by noticing it."}
              </p>
              <p className="max-w-[15rem] border-l border-[var(--color-accent-gold)] pl-4 text-sm leading-6 text-white/45">
                {plainText(settings?.aboutPrinciplesContext) || "Context is not a constraint. It is the material that gives a space its own voice."}
              </p>
            </div>
            <div className="space-y-14 md:space-y-20">
              {principles.map((item, index) => {
                const imageUrl = item.image ? urlFor(item.image).width(900).height(600).fit("crop").auto("format").quality(80).url() : null;
                return (
                  <div key={`${item.title}-${index}`} className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr] lg:gap-14">
                    <div>
                      <h2 className="font-serif text-3xl leading-none tracking-[-0.05em] text-white md:text-4xl">{item.title}</h2>
                      {imageUrl ? <div className="relative mt-6 aspect-[3/2] overflow-hidden bg-[var(--color-bg-elevated)]"><Image src={imageUrl} alt={item.title ?? "Principle"} fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" /></div> : null}
                    </div>
                    <p className="max-w-xl text-base leading-7 text-white/70 md:text-[1.08rem] md:leading-8">{plainText(item.description)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="mx-auto max-w-[88rem] border-t border-white/15 bg-[#0c0e10] px-5 pb-12 pt-0 md:px-8 md:pb-20 md:pt-0">
        <div className="pt-6">
          <div className="flex items-start justify-between gap-8">
            <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{plainText(settings?.aboutVisionLabel) || dictionary.about.vision}</p>
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{plainText(settings?.aboutVisionAside) || "A long view"}</span>
          </div>
          <div data-reveal className="mt-16 md:mt-24">
            <p className="max-w-6xl font-serif text-[2.75rem] leading-[0.92] tracking-[-0.07em] text-white md:text-[4.25rem] md:leading-[0.9] lg:text-[5rem] lg:leading-[0.86]">
              {isPreview ? "We design places that deepen the relationship between people, place, and time." : plainText(settings?.aboutVision) || dictionary.about.visionPlaceholder}
            </p>
            <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-10 lg:mt-20 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
              <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)]">
                {(settings?.aboutVisionImage ?? selectedProjects[0]?.coverImage) ? (
                  <Image src={urlFor(settings?.aboutVisionImage ?? selectedProjects[0].coverImage!).width(1600).height(1200).fit("crop").auto("format").quality(80).url()} alt="Linnorea project atmosphere" fill sizes="(max-width: 768px) 100vw, 65vw" className="object-cover" />
                ) : <MediaPlaceholder className="h-full w-full" />}
              </div>
              <p className="max-w-sm pt-2 text-base leading-7 text-white/65 md:text-lg md:leading-8">{plainText(settings?.aboutVisionSupport) || "To make spaces that do not ask for attention, but reward it: spaces with an atmosphere that grows more meaningful through use, memory, and time."}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-t border-white/15 bg-[#0c0e10]">
       <div className="mx-auto max-w-[88rem] px-5 pb-24 pt-0 md:px-8 md:pb-28 md:pt-0">
        <div data-reveal className="min-w-0 pt-6">
          <div className="flex items-start justify-between gap-8">
            <p className="text-left text-sm text-white/60">{dictionary.about.mission}</p>
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{plainText(settings?.aboutMissionAside) || "What we pursue"}</span>
          </div>
          <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <p className="max-w-xl font-serif text-[2.9rem] leading-[0.9] tracking-[-0.065em] text-white md:text-[4.6rem] md:leading-[0.88] lg:max-w-md lg:text-[5rem]">
                {plainText(settings?.aboutMissionLead) || "We create spaces that feel grounded, generous, and deeply lived in."}
              </p>
              <p className="mt-12 max-w-xs text-sm leading-6 text-white/45">
                {plainText(settings?.aboutMissionSupport) || "A practice of care, from first reading to final detail."}
              </p>
            </div>
            <div className="lg:pt-16">
              <p className="max-w-2xl text-xl leading-8 text-white/80 md:text-2xl md:leading-10">{plainText(settings?.aboutMission?.[0]) || "We work with the rhythms of daily life, the intelligence of materials, and the people who bring a place into being."}</p>
              <div className="mt-12 grid border-t border-white/15 lg:grid-cols-2 lg:gap-x-10">
                {missionDetails.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="border-b border-white/15 py-7">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                    <p className="mt-4 text-base leading-7 text-white/65">{plainText(item.description)}</p>
                  </div>
                ))}
              </div>
              {settings?.aboutMissionImage ? (
                <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)]">
                  <Image src={urlFor(settings.aboutMissionImage).width(1400).height(900).fit("crop").auto("format").quality(80).url()} alt="Linnorea mission" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
       </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="about-process-section mx-auto max-w-[88rem] px-5 pb-24 md:px-8 md:pb-36">
        <div className="min-w-0 border-t border-white/15 pt-6">
          <div className="flex items-start justify-between gap-8">
            <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{plainText(settings?.aboutProcessLabel) || dictionary.about.process}</p>
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{plainText(settings?.aboutProcessAside) || "From reading to making"}</span>
          </div>
          <div className="mt-16 min-w-0 space-y-20 md:mt-24 md:space-y-36">
            {(isPreview ? previewProcessItems : processItems).length ? (isPreview ? previewProcessItems : processItems).map((item, index) => {
              const title = plainText(item.title) || dictionary.about.processStage;
              const subtitle = plainText(item.subtitle);
              const imageUrl = item.image ? urlFor(item.image).width(1200).height(800).fit("crop").auto("format").quality(78).url() : null;
              return (
                <article key={`${title}-${index}`} data-reveal className={`grid min-w-0 gap-8 pb-20 md:grid-cols-2 md:items-center md:gap-10 md:pb-36 ${index < (isPreview ? previewProcessItems : processItems).length - 1 ? "border-b border-white/15" : ""}`}>
                  <div className={`about-process-copy min-w-0 text-left ${index % 2 === 1 ? "md:order-2" : ""}`}>
                    <div className="min-w-0 pl-0 text-left"><h2 className="text-4xl font-medium leading-[0.92] tracking-[-0.06em] md:text-5xl">{title}</h2>{subtitle && !isPreview ? <p className="mt-5 max-w-xl text-base text-white/80">{subtitle}</p> : null}<p className="mt-5 max-w-xl text-sm leading-6 text-white/60 md:text-base md:leading-7">{plainText(item.description) || dictionary.about.processDescriptionPlaceholder}</p></div>
                  </div>
                  <div className={`relative min-w-0 aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#17191c,#07080a)] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" /> : <div className="absolute inset-0 flex items-end justify-between p-6 text-[10px] uppercase tracking-[0.2em] text-white/40"><span>{title}</span><span>Material study</span></div>}
                  </div>
                </article>
              );
            }) : <p className="text-sm leading-6 text-white/60">{dictionary.about.processPlaceholder}</p>}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-y border-white/15 bg-[#0c0e10]">
        <div className="mx-auto max-w-[88rem] px-5 pb-24 pt-0 md:px-8 md:pb-36 md:pt-0">
          <div id="leadership" data-reveal className="pt-6">
            <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Leadership</p>
            {isPreview ? (
              <div className="about-card-list about-card-list--leadership mt-14 md:mt-20">
                {previewLeadership.map((member) => (
                  <Link key={member.name} href={`/preview/profile/${member.slug}?preview=1`} className="group about-card-item min-w-0">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
                      <MediaPlaceholder className="h-full w-full" />
                      <span className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-white/75">Preview</span>
                    </div>
                    <div className="about-card-copy min-w-0">
                      <h2 className="text-xl font-medium leading-tight tracking-[-0.04em] lg:text-2xl">{member.name}</h2>
                      <p className="mt-3 text-sm leading-6 text-white/65">{member.role}</p>
                      <span className="mt-2 inline-flex min-h-11 items-center text-sm leading-6 text-white/45 underline decoration-white/25 underline-offset-4">Preview office: {member.office}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : leadership.length ? (
              <div className="about-card-list about-card-list--leadership mt-14 md:mt-20">
                {leadership.map((member) => {
                  const imageUrl = urlFor(member.photo!).width(900).height(675).fit("crop").auto("format").quality(80).url();
                  return (
                    <article key={member._id} data-reveal-item className="about-card-item min-w-0">
                      <div className="about-card-media relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
                        <Image src={imageUrl} alt={member.name!} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover grayscale" />
                      </div>
                      <div className="about-card-copy min-w-0">
                        <h2 className="text-xl font-medium leading-tight tracking-[-0.04em] lg:text-2xl">{member.name}</h2>
                        {member.role ? <p className="mt-3 text-sm leading-6 text-white/65">{member.role}</p> : null}
                        {member.bio ? <p className="mt-3 text-sm leading-6 text-white/50">{member.bio}</p> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-14 max-w-xl text-lg leading-8 text-white/60 md:mt-20">
                {dictionary.ui.teamPending}
              </p>
            )}
          </div>
      </div>
      </ScrollReveal>

      {aboutCards.length ? (
        <ScrollReveal as="section" className="border-y border-white/15">
          <div className="mx-auto max-w-[88rem] px-5 pb-24 pt-6 md:px-8 md:pb-36 md:pt-6">
            <div data-reveal className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Projects and Insights</p>
              </div>
              <Link href="/project" className="inline-flex min-h-11 w-fit items-center border-b border-transparent pb-2 text-[10px] uppercase tracking-[0.22em] text-white/80 transition hover:border-white hover:text-white focus-visible:border-white">{dictionary.ui.viewProjects}</Link>
            </div>
            <AboutInsightCards cards={aboutCards} />
          </div>
        </ScrollReveal>
      ) : null}

      <section className="mx-auto flex max-w-7xl flex-col items-start gap-7 px-5 py-24 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="max-w-xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-6xl">Bring the next space into focus.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/project" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{dictionary.ui.viewProjects}</Link>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{plainText(settings?.whatsappCtaText) || dictionary.home.cta}</a> : null}
        </div>
      </section>
    </main>
  );
}
