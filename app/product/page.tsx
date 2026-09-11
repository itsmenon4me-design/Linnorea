import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ProductCard } from "@/components/sections/ProductCard";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { productListQuery } from "@/lib/sanity/queries";
import { plainText, type Product } from "@/lib/sanity/types";

export const revalidate = 60;
type ProductWithSlug = Product & { slug?: { current?: string } };
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.product} | ${seo.title}` }, description: seo.description };
}

export default async function ProductPage() {
  const products = await sanityClient.fetch<ProductWithSlug[]>(productListQuery, {}, { next: { revalidate } });
  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-48">
        <p className="normal-case border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/75">Linnorea living</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.product}</h1>
      </header>
      {products.length ? <div className="product-grid mx-auto grid max-w-7xl gap-x-8 gap-y-16 px-5 pb-24 md:px-8">
        {products.map((product) => {
          const name = plainText(product.name) || dictionary.ui.untitledProduct;
          const description = plainText(product.description) || dictionary.ui.placeholderProductDescription;
          const imageUrl = (product.images ?? [])
            .filter((image) => Boolean(image.asset?._ref))
            .slice(0, 1)
            .map((image) => urlFor(image).width(1400).height(1400).fit("crop").auto("format").quality(78).url());
          return <ScrollReveal key={product._id} className="w-full">
            <ProductCard
              name={name}
              description={description}
              imageUrl={imageUrl[0]}
              detailHref={product.slug?.current ? `/product/${product.slug.current}` : undefined}
              discoverLabel={dictionary.home.discover}
            />
          </ScrollReveal>;
        })}
      </div> : <p className="mx-auto max-w-7xl border-t border-white/15 px-5 py-20 text-sm text-white/65 md:px-8">{dictionary.ui.productEmpty}</p>}
    </main>
  );
}
