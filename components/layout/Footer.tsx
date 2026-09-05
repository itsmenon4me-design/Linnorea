import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedValue, type SiteSettings } from "@/lib/sanity/types";

type FooterProps = {
  currentLocale: Locale;
  dictionary: Dictionary;
};
export async function Footer({ currentLocale, dictionary }: FooterProps) {
  const settings = (await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery)) ?? null;
  const brandText = localizedValue(settings?.brandStatement, currentLocale) || "Linnorea Design Works";
  const officeAddress = localizedValue(settings?.officeAddress, currentLocale) || "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430";
  const whatsappNumber = settings?.whatsappNumber ?? "+621234567890";
  const whatsappText = localizedValue(settings?.whatsappCtaText, currentLocale) || dictionary.home.cta;
  const socialLinks = settings?.socialLinks ?? [
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "Threads", url: "https://www.threads.net" },
    { platform: "LinkedIn", url: "https://www.linkedin.com" },
    { platform: "Pinterest", url: "https://www.pinterest.com" },
  ];

  const secondaryLinks = [
    { label: dictionary.nav.about, href: `/${currentLocale}/about` },
    { label: dictionary.nav.project, href: `/${currentLocale}/project` },
    { label: dictionary.nav.service, href: `/${currentLocale}/service` },
    { label: dictionary.nav.product, href: `/${currentLocale}/product` },
  ];

  return (
    <footer className="border-t border-white/10 bg-[var(--color-bg-base)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
        <div className="space-y-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/60">Linnorea</div>
          <p className="max-w-md text-sm leading-6 text-white/75">{brandText}</p>
          {settings?.googleMapsUrl ? (
            <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" className="block max-w-md text-sm leading-6 text-white/70 transition-opacity hover:text-white">{officeAddress}</a>
          ) : (
            <p className="max-w-md text-sm leading-6 text-white/70">{officeAddress}</p>
          )}
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[var(--color-bg-base)]"
          >
            {whatsappText}
          </a>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">{dictionary.ui.navigate}</p>
          <nav className="mt-5 flex flex-col gap-3 text-sm text-white/70">
            {secondaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-opacity hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">{dictionary.ui.connect}</p>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            {socialLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                <a href={link.url} target="_blank" rel="noreferrer" className="transition-opacity hover:text-white">
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-[10px] uppercase tracking-[0.28em] text-white/55 md:px-8">
        © {new Date().getFullYear()} Linnorea Design Works
      </div>
    </footer>
  );
}
