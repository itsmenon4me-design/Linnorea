import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ProductCard } from "@/components/sections/ProductCard";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { productListQuery } from "@/lib/sanity/queries";
import { localizedValue, plainText, type Product } from "@/lib/sanity/types";

export const revalidate = 60;
type ProductProps = { params: Promise<{ locale: string }> };
type ProductWithSlug = Product & { slug?: { current?: string } };
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
  const products = await sanityClient.fetch<ProductWithSlug[]>(productListQuery, {}, { next: { revalidate } });
  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-48">
        <p className="normal-case border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/75">Linnorea living</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.product}</h1>
      </header>
      {products.length ? <div className={`mx-auto grid justify-items-center gap-x-8 gap-y-16 px-5 pb-24 md:px-8 ${products.length === 1 ? "max-w-xl md:grid-cols-1" : products.length === 2 ? "max-w-4xl md:grid-cols-2" : "max-w-7xl md:grid-cols-2"}`}>
        {products.map((product) => {
          const name = localizedValue(product.name, safeLocale) || dictionary.ui.untitledProduct;
          const description = plainText(localizedValue(product.description, safeLocale)) || dictionary.ui.placeholderProductDescription;
          const imageUrls = (product.images ?? [])
            .filter((image) => Boolean(image.asset?._ref))
            .slice(0, 2)
            .map((image) => urlFor(image).width(1400).height(1400).fit("crop").auto("format").quality(78).url());
          return <ScrollReveal key={product._id} className="w-full max-w-xl">
            <ProductCard
              name={name}
              description={description}
              imageUrls={imageUrls}
              detailHref={product.slug?.current ? `/${safeLocale}/product/${product.slug.current}` : undefined}
              discoverLabel={dictionary.home.discover}
            />
          </ScrollReveal>;
        })}
      </div> : <p className="mx-auto max-w-7xl border-t border-white/15 px-5 py-20 text-sm text-white/65 md:px-8">{dictionary.ui.productEmpty}</p>}
    </main>
  );
}
