import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { projectListQuery, siteSettingsQuery, teamMembersQuery } from "@/lib/sanity/queries";
import { plainText, portableTextToPlainText, type Project, type SiteSettings, type TeamMember } from "@/lib/sanity/types";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.about} | ${seo.title}` }, description: seo.description };
}

export default async function AboutPage() {
  const [settings, projects, teamMembers] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<TeamMember[]>(teamMembersQuery, {}, { next: { revalidate } }),
  ]);
  const established = plainText(settings?.aboutEstablished) || dictionary.about.establishedPlaceholder;
  const description = plainText(settings?.aboutDescription) || dictionary.about.descriptionPlaceholder;
  const keyItems = settings?.aboutKey ?? [];
  const missionItems = settings?.aboutMission ?? [];
  const processItems = settings?.aboutProcess ?? [];
  const selectedProjects = projects.filter((project) => project.coverImage?.asset?._ref).slice(0, 4);
  const leadership = teamMembers.filter((member) => member.name && member.photo?.asset?._ref);
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
        @media (min-width: 1024px) {
          .about-card-list {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            column-gap: 32px;
            row-gap: 56px;
          }
          .about-card-item {
            display: block;
            padding-block: 0;
            border-bottom: 0;
          }
          .about-card-copy { margin-top: 20px; }
        }
      `}</style>
      <Header dictionary={dictionary} />
      <section className="bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-20 pt-36 md:px-8 md:pb-32 md:pt-52">
          <div className="grid gap-10 md:grid-cols-[0.78fr_1.22fr] md:gap-x-20 md:gap-y-8">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/55">Linnorea design works</p>
              <h1 className="mt-6 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-[6.5rem]">{dictionary.nav.about}</h1>
            </div>
            <div className="relative row-start-2 aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)] md:row-span-2 md:row-start-1 md:aspect-[1.2/1]">
              <StudioVisual image={settings?.studioVisualImage} video={settings?.studioVisualVideo} videoLabel={dictionary.ui.studioVideo} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            <p className="max-w-md text-base leading-7 text-white/75 md:row-start-2 md:text-lg md:leading-8">{description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 md:px-8 md:pt-14">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55">
          {dictionary.about.establishedLabel.replace("{date}", established)}
        </p>
      </div>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div data-reveal className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.ourKey}</p>
          <ul className="mt-12 grid min-w-0 gap-x-8 gap-y-10 text-left text-xl leading-8 tracking-[-0.03em] text-white/90 md:mt-20 md:grid-cols-3 md:gap-x-12 md:gap-y-16 md:text-3xl md:leading-tight">
            {keyItems.length ? keyItems.map((item, index) => (
              <li key={`${plainText(item.label)}-${index}`} className="border-t border-white/15 pt-5">
                {plainText(item.label)}
              </li>
            )) : <li>{dictionary.about.keyPlaceholder}</li>}
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
       <div className="border-t border-white/15 pt-6">
         <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{dictionary.about.vision}</p>
         <div data-reveal className="mt-12 max-w-4xl text-3xl leading-[1.05] tracking-[-0.045em] text-white md:mt-20 md:text-[3.75rem] md:leading-[1.02]">
           <p>{plainText(settings?.aboutVision) || dictionary.about.visionPlaceholder}</p>
         </div>
       </div>
      </ScrollReveal>

      <section className="border-y border-white/15 bg-[#0c0e10]">
       <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
        <div className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.mission}</p>
          <ul className="mt-12 grid min-w-0 max-w-6xl gap-x-16 gap-y-10 text-left text-base leading-7 tracking-[-0.01em] text-white/90 md:mt-20 md:grid-cols-2 md:gap-y-16 md:text-lg md:leading-8">
            {missionItems.length ? missionItems.map((item, index) => (
              <li key={`${plainText(item)}-${index}`} className="border-b border-white/15 pb-10">
                <span className="mb-7 block h-px w-12 bg-white/45" />
                {plainText(item)}
              </li>
            )) : <li>{dictionary.about.missionPlaceholder}</li>}
          </ul>
        </div>
       </div>
      </section>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div data-reveal className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.process}</p>
          <div className="mt-14 min-w-0 space-y-16 md:mt-24 md:space-y-32">
            {processItems.length ? processItems.map((item, index) => {
              const title = plainText(item.title) || dictionary.about.processStage;
              const subtitle = plainText(item.subtitle);
              const imageUrl = item.image ? urlFor(item.image).width(1200).height(800).fit("crop").auto("format").quality(78).url() : null;
              return (
                <article key={`${title}-${index}`} data-reveal className="grid min-w-0 gap-10 border-b border-white/15 pb-16 md:grid-cols-2 md:items-center md:gap-20 md:pb-32">
                  <div data-reveal-item className={`min-w-0 text-left ${index % 2 === 1 ? "md:order-2" : ""}`}>
                    <div className="min-w-0 pl-0 text-left"><h2 className="text-4xl font-medium leading-[0.92] tracking-[-0.06em] md:text-6xl">{title}</h2>{subtitle ? <p className="mt-5 max-w-xl text-base text-white/80">{subtitle}</p> : null}<p className="mt-5 max-w-xl text-sm leading-6 text-white/60 md:text-base md:leading-7">{plainText(item.description) || dictionary.about.processDescriptionPlaceholder}</p></div>
                  </div>
                  <div data-reveal-image className={`relative min-w-0 aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#17191c,#07080a)] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /> : null}
                  </div>
                </article>
              );
            }) : <p className="text-sm leading-6 text-white/60">{dictionary.about.processPlaceholder}</p>}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-y border-white/15 bg-[#0c0e10]">
        <div className="mx-auto max-w-[88rem] px-5 py-24 md:px-8 md:py-36">
          <div data-reveal className="border-t border-white/15 pt-6">
            <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Leadership</p>
            {leadership.length ? (
              <div className="about-card-list mt-14 md:mt-20">
                {leadership.map((member) => {
                  const imageUrl = urlFor(member.photo!).width(900).height(675).fit("crop").auto("format").quality(80).url();
                  return (
                    <article key={member._id} data-reveal-item className="about-card-item min-w-0">
                      <div className="about-card-media relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
                        <Image src={imageUrl} alt={member.name!} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover grayscale transition duration-700 hover:grayscale-0" />
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

      {selectedProjects.length ? (
        <ScrollReveal as="section" className="border-y border-white/15">
          <div className="mx-auto max-w-[88rem] px-5 py-24 md:px-8 md:py-36">
            <div data-reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Projects &amp; insights</p>
                <h2 className="mt-6 max-w-2xl text-4xl font-medium leading-[0.94] tracking-[-0.06em] md:text-6xl">Work that turns thinking into space.</h2>
              </div>
              <Link href="/project" className="inline-flex min-h-11 w-fit items-center border-b border-white/45 pb-2 text-[10px] uppercase tracking-[0.22em] text-white/80 transition hover:border-white hover:text-white">{dictionary.ui.viewProjects}</Link>
            </div>
            <div data-reveal className="about-card-list mt-16">
              {selectedProjects.map((project, index) => {
                const imageUrl = urlFor(project.coverImage!).width(1600).height(1100).fit("crop").auto("format").quality(80).url();
                const content = (
                  <>
                    <div className="about-card-media relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
                      <Image src={imageUrl} alt={plainText(project.title) || "Untitled project"} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 62vw" : "(max-width: 768px) 100vw, 42vw"} className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                    </div>
                    <div className="about-card-copy min-w-0">
                      <p className="text-xs tracking-[0.16em] text-white/55">{plainText(project.category) || dictionary.ui.projectCategory}</p>
                      <h3 className="mt-3 text-xl font-medium leading-tight tracking-[-0.04em] lg:text-2xl">{plainText(project.title) || "Untitled project"}</h3>
                      {plainText(project.location) ? <p className="mt-2 text-sm text-white/50">{plainText(project.location)}</p> : null}
                      {portableTextToPlainText(project.description) ? <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">{portableTextToPlainText(project.description)}</p> : null}
                    </div>
                  </>
                );
                return project.slug?.current ? <Link key={project._id} href={`/project/${project.slug.current}`} className="group about-card-item min-w-0">{content}</Link> : <article key={project._id} className="about-card-item min-w-0">{content}</article>;
              })}
            </div>
          </div>
        </ScrollReveal>
      ) : null}

      <section className="mx-auto flex max-w-7xl flex-col items-start gap-7 px-5 py-24 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="max-w-xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-6xl">Bring the next space into focus.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/project" className="inline-flex min-h-11 items-center border border-white/25 px-5 text-[10px] uppercase tracking-[0.22em] transition hover:bg-white hover:text-[var(--color-bg-base)]">{dictionary.ui.viewProjects}</Link>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-white/35 px-5 text-[10px] uppercase tracking-[0.22em] text-white/80 transition hover:border-white hover:bg-white hover:text-[var(--color-bg-base)]">{plainText(settings?.whatsappCtaText) || dictionary.home.cta}</a> : null}
        </div>
      </section>
    </main>
  );
}
