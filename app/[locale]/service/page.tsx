import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { serviceListQuery } from "@/lib/sanity/queries";
import { localizedValue, type Service } from "@/lib/sanity/types";

export const revalidate = 60;
type ServiceProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: ServiceProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return { title: getDictionary(safeLocale).nav.service };
}

export default async function ServicePage({ params }: ServiceProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const services = await sanityClient.fetch<Service[]>(serviceListQuery, {}, { next: { revalidate } });
  return (
    <main className="bg-[#07080a] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-48">
        <p className="text-[10px] uppercase tracking-[0.38em] text-[#c8a875]">Linnorea Design Works</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.service}</h1>
      </header>
      {services.length ? services.map((service, index) => {
        const title = localizedValue(service.title, safeLocale) || "Untitled service";
        const description = localizedValue(service.description, safeLocale) || "[Placeholder service description]";
        const imageUrl = service.image ? urlFor(service.image).width(1800).height(1200).fit("crop").auto("format").url() : null;
        return (
          <ScrollReveal key={service._id} as="section" className="border-t border-white/15">
            <div data-reveal className={`mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-20 ${index % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#17191c]">
                {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-center text-[10px] uppercase tracking-[0.3em] text-white/40">[Placeholder service image]</div>}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-[#c8a875]">0{index + 1}</p>
                <h2 className="mt-6 text-2xl font-medium tracking-[-0.04em] md:text-3xl">{title}</h2>
                <p className="mt-7 max-w-lg whitespace-pre-line text-sm md:text-base leading-6 text-white/65">{description}</p>
              </div>
            </div>
          </ScrollReveal>
        );
      }) : <p className="mx-auto max-w-7xl border-t border-white/15 px-5 py-20 text-sm text-white/65 md:px-8">Belum ada service yang dipublikasikan di Sanity.</p>}
    </main>
  );
}
