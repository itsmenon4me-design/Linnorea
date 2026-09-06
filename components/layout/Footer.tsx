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

type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn" | "TikTok" | "Twitch" | "X" | "YouTube";

function SocialIcon({ platform }: { platform?: string }) {
  const iconProps = {
    "aria-hidden": true,
    className: "h-4 w-[14px] shrink-0 fill-current",
    viewBox: "0 0 24 24",
  };

  switch (platform as SocialPlatform) {
    case "Facebook":
      return <svg {...iconProps}><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2V10H7.3v3h2.8v8h3.4Z" /></svg>;
    case "Instagram":
      return <svg {...iconProps}><path fillRule="evenodd" d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm9.7 1.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
    case "LinkedIn":
      return <svg {...iconProps}><path d="M5.2 7.3A2 2 0 1 1 5.2 3a2 2 0 0 1 0 4.3ZM3.4 21V9h3.6v12H3.4Zm5.8 0V9h3.4v1.6h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.2Z" /></svg>;
    case "TikTok":
      return <svg {...iconProps}><path d="M16.6 2h3.1c.2 1.7 1.2 3.2 2.8 4.1v3.2a8.4 8.4 0 0 1-2.8-1V15a6.8 6.8 0 1 1-6.8-6.8c.4 0 .8 0 1.2.1v3.5a3.3 3.3 0 1 0 2.5 3.2V2Z" /></svg>;
    case "Twitch":
      return <svg {...iconProps}><path fillRule="evenodd" d="M3 2h18v13.2l-5.4 5.4h-3.8L9 21.4V20H3V2Zm2 2v14h5v1.6l1.6-1.6H15l4-4V4H5Zm3 3h2v5H8V7Zm6 0h2v5h-2V7Z" /></svg>;
    case "X":
      return <svg {...iconProps}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.2 22H3.1l7.2-8.3L2.8 2h6.4l4.5 5.9L18.9 2Zm-1.1 17.8h1.7L8.3 4H6.5l11.3 15.8Z" /></svg>;
    case "YouTube":
      return <svg {...iconProps}><path fillRule="evenodd" d="M21.6 6.2a2.8 2.8 0 0 0-2-2C17.8 3.7 12 3.7 12 3.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8 2 12 2 12s0 4 .4 5.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.8.4-5.8.4-5.8s0-4-.4-5.8ZM10 15.8V8.2l6 3.8-6 3.8Z" /></svg>;
    default:
      return null;
  }
}

export async function Footer({ currentLocale, dictionary }: FooterProps) {
  const settings = (await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery)) ?? null;
  const brandText = localizedValue(settings?.brandStatement, currentLocale) || "Linnorea Design Works";
  const officeAddress = localizedValue(settings?.officeAddress, currentLocale) || "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430";
  const whatsappNumber = settings?.whatsappNumber ?? "+621234567890";
  const whatsappText = localizedValue(settings?.whatsappCtaText, currentLocale) || dictionary.home.cta;
  const defaultSocialLinks = [
    { platform: "Facebook", url: "https://www.facebook.com" },
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "LinkedIn", url: "https://www.linkedin.com" },
    { platform: "TikTok", url: "https://www.tiktok.com" },
    { platform: "Twitch", url: "https://www.twitch.tv" },
    { platform: "X", url: "https://x.com" },
    { platform: "YouTube", url: "https://www.youtube.com" },
  ];
  const configuredSocialLinks = new Map(
    (settings?.socialLinks ?? []).map((link) => [link.platform, link.url]),
  );
  const socialLinks = defaultSocialLinks.map((link) => ({
    platform: link.platform,
    url: configuredSocialLinks.get(link.platform) || link.url,
  }));

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
                  <span className="inline-flex items-center gap-2">
                    <SocialIcon platform={link.platform} />
                    {link.platform}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-6 text-center md:px-8">
        {settings?.googleMapsUrl ? (
          <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs leading-5 text-white/60 transition-colors hover:text-white">
            {officeAddress}
          </a>
        ) : (
          <p className="text-xs leading-5 text-white/60">{officeAddress}</p>
        )}
        <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/55">
          © {new Date().getFullYear()} Linnorea Design Works
        </p>
      </div>
    </footer>
  );
}
