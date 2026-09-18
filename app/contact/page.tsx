import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ContactInquiryForm } from "@/components/sections/ContactInquiryForm";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { plainText, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.contact} | ${seo.title}` }, description: seo.description };
}

export default async function ContactPage() {
  const settings = await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } });
  const officeAddress = plainText(settings?.officeAddress) || "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430";
  const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, "") || "6281919452042";
  const whatsappHref = `https://wa.me/${whatsappNumber}`;
  const socialLinks = settings?.socialLinks?.filter((link) => link.url) ?? [];

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />

      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-32 md:pt-48">
        <div className="grid gap-12 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/70">Contact</p>
          <div>
            <h1 className="max-w-5xl text-5xl font-medium leading-[0.9] tracking-[-0.08em] md:text-8xl">
              Let&apos;s shape what comes next.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              Tell us about the place, the ambition, and the people it is intended for. Our Jakarta studio welcomes considered conversations about new spaces and experiences.
            </p>
          </div>
        </div>
      </header>

      <section className="border-y border-white/15" aria-labelledby="studio-contact">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[0.55fr_1.45fr] md:gap-20 md:px-8 md:py-20">
          <p id="studio-contact" className="text-[10px] uppercase tracking-[0.22em] text-white/50">Jakarta studio</p>
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="max-w-xs text-lg leading-7 text-white/85">{officeAddress}</p>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-11 items-center border-b border-white/35 pb-2 text-sm text-white transition-colors hover:border-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)]">WhatsApp the studio</a>
            </div>
            <div className="flex flex-col gap-4 text-sm text-white/65">
              {socialLinks.map((link) => (
                <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="w-fit transition-colors hover:text-white">{link.platform}</a>
              ))}
              <Link href="/about" className="w-fit transition-colors hover:text-white">About Linnorea</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[0.55fr_1.45fr] md:gap-20 md:px-8 md:py-28" aria-labelledby="project-inquiry">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Project inquiry</p>
          <h2 id="project-inquiry" className="mt-6 max-w-xs text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-6xl">A clear brief is where meaningful work begins.</h2>
        </div>
        <div>
          <p className="max-w-2xl text-base leading-7 text-white/65">Share the essentials and our studio will have a considered starting point for the conversation.</p>
          <ContactInquiryForm whatsappNumber={whatsappNumber} />
        </div>
      </section>
    </main>
  );
}
