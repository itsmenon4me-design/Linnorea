import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ProductDetailImage } from "@/components/sections/ProductDetailImage";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { localizedValue, plainText, type Product, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

type ProductDetail = Product & { slug?: { current?: string } };
type ProductDetailProps = { params: Promise<{ locale: string; slug: string }> };

const productListQuery = `*[_type == "product"] | order(order asc, _createdAt asc) {
  _id, name, slug, images, description, order
}`;

const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id, name, slug, images, description, order
}`;

const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  whatsappNumber
}`;

export async function generateStaticParams() {
  const products = await sanityClient.fetch<ProductDetail[]>(productListQuery, {}, { next: { revalidate } });
  return locales.flatMap((locale) => products.flatMap((product) => product.slug?.current ? [{ locale, slug: product.slug.current }] : []));
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const seo = await getSiteSeo(safeLocale);
  const product = await sanityClient.fetch<ProductDetail | null>(productBySlugQuery, { slug }, { next: { revalidate } });
  const title = product ? localizedValue(product.name, safeLocale) || dictionary.ui.untitledProduct : dictionary.nav.product;
  return { title: { absolute: `${title} | ${seo.title}` }, description: seo.description };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { locale, slug } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const [product, settings] = await Promise.all([
    sanityClient.fetch<ProductDetail | null>(productBySlugQuery, { slug }, { next: { revalidate } }),
    sanityClient.fetch<Pick<SiteSettings, "whatsappNumber"> | null>(siteSettingsQuery, {}, { next: { revalidate } }),
  ]);

  if (!product) notFound();

  const name = localizedValue(product.name, safeLocale) || dictionary.ui.untitledProduct;
  const description = plainText(localizedValue(product.description, safeLocale)) || dictionary.ui.placeholderProductDescription;
  const imageUrls = (product.images ?? [])
    .filter((image) => Boolean(image.asset?._ref))
    .map((image) => urlFor(image).width(2200).height(1650).fit("crop").auto("format").quality(78).url());
  const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo Linnorea, saya ingin menanyakan produk ${name}.`)}`
    : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pb-20 md:pt-48">
        <Link href={`/${safeLocale}/product`} className="inline-flex text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-gold)]">
          <ArrowAction label={dictionary.nav.product} direction="left" className="text-[10px] uppercase tracking-[0.25em]" />
        </Link>
        <p className="mt-12 normal-case border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/75">Linnorea living</p>
        <h1 className="mt-6 max-w-5xl text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{name}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/75 md:text-2xl md:leading-9">{description}</p>
      </section>

      {imageUrls.length ? (
        <section className="space-y-4 px-3 md:space-y-8 md:px-8">
          {imageUrls.map((imageUrl, index) => (
            <ScrollReveal key={`${product._id}-${index}`} as="div">
              <div data-reveal>
                {index === 0 ? (
                  <ProductDetailImage src={imageUrl} alt={`${name} ${index + 1}`} />
                ) : (
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)] md:aspect-[16/9]">
                    <Image src={imageUrl} alt={`${name} ${index + 1}`} fill sizes="100vw" className="object-cover" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </section>
      ) : (
        <MediaPlaceholder className="mx-5 min-h-40 border-y border-white/15 md:mx-8" />
      )}

      {whatsappHref ? (
        <section className="mx-5 border-y border-white/15 py-20 md:mx-8 md:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.home.cta}</h2>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">
              {dictionary.home.cta}
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
