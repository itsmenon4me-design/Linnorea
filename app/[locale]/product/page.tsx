import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { productListQuery } from "@/lib/sanity/queries";
import { localizedValue, plainText, type Product } from "@/lib/sanity/types";

export const revalidate = 60;
type ProductProps = { params: Promise<{ locale: string }> };
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: ProductProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const seo = await getSiteSeo(safeLocale);
  return { title: { absolute: `${getDictionary(safeLocale).nav.product} | ${seo.title}` }, description: seo.description };
}

export default async function ProductPage({ params }: ProductProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const products = await sanityClient.fetch<Product[]>(productListQuery, {}, { next: { revalidate } });
  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-48">
        <p className="text-[10px] uppercase tracking-[0.38em] text-[var(--color-accent-gold)]">Linnorea Living</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.product}</h1>
      </header>
      {products.length ? <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-16 px-5 pb-24 md:grid-cols-2 md:px-8">
        {products.map((product) => {
          const name = localizedValue(product.name, safeLocale) || dictionary.ui.untitledProduct;
          const description = plainText(localizedValue(product.description, safeLocale)) || dictionary.ui.placeholderProductDescription;
          const image = product.images?.find((item) => Boolean(item.asset?._ref));
          const imageUrl = image ? urlFor(image).width(1400).height(1400).fit("crop").auto("format").url() : null;
          return <ScrollReveal key={product._id}><article data-reveal className="border-b border-white/15 pb-6">
            <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-elevated)]">{imageUrl ? <Image src={imageUrl} alt={name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 hover:scale-105" /> : <div className="flex h-full items-center justify-center text-center text-[10px] uppercase tracking-[0.3em] text-white/40">{dictionary.ui.placeholderProductImage}</div>}</div>
            <h2 className="mt-5 text-2xl font-medium tracking-[-0.04em] md:text-3xl">{name}</h2>
            <p className="mt-3 max-w-md text-sm md:text-base leading-6 text-white/60">{description}</p>
          </article></ScrollReveal>;
        })}
      </div> : <p className="mx-auto max-w-7xl border-t border-white/15 px-5 py-20 text-sm text-white/65 md:px-8">{dictionary.ui.productEmpty}</p>}
    </main>
  );
}
