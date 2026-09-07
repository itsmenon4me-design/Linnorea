import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedValue, type SiteSettings } from "@/lib/sanity/types";

type FooterProps = {
  currentLocale: Locale;
  dictionary: Dictionary;
};

type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn" | "TikTok" | "X";

function SocialIcon({ platform, className }: { platform?: string; className?: string }) {
  const iconProps = {
    "aria-hidden": true,
    className: `${className ?? ""} shrink-0 fill-current`,
    style: { width: "1rem", height: "1rem" },
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
    case "X":
      return <svg {...iconProps}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.2 22H3.1l7.2-8.3L2.8 2h6.4l4.5 5.9L18.9 2Zm-1.1 17.8h1.7L8.3 4H6.5l11.3 15.8Z" /></svg>;
    default:
      return null;
  }
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      +
    </span>
  );
}

export async function Footer({ currentLocale, dictionary }: FooterProps) {
  const settings = (await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery)) ?? null;
  const brandText = localizedValue(settings?.brandStatement, currentLocale) || "Linnorea Design Works";
  const officeAddress = localizedValue(settings?.officeAddress, currentLocale) || "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430";
  const whatsappText = localizedValue(settings?.whatsappCtaText, currentLocale) || dictionary.home.cta;
  const defaultSocialLinks = [
    { platform: "Facebook", url: "https://www.facebook.com" },
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "LinkedIn", url: "https://www.linkedin.com" },
    { platform: "TikTok", url: "https://www.tiktok.com" },
    { platform: "X", url: "https://x.com" },
  ];
  const configuredSocialLinks = new Map(
    (settings?.socialLinks ?? []).map((link) => [link.platform, link.url]),
  );
  const socialLinks = defaultSocialLinks.map((link) => ({
    icon: (props: { className?: string }) => <SocialIcon platform={link.platform} {...props} />,
    label: link.platform,
    platform: link.platform,
    url: configuredSocialLinks.get(link.platform) || link.url,
  }));

  return (
    <footer className="bg-[var(--color-bg-base)] text-white">
      <div className="Footer_content mx-auto max-w-7xl px-5 md:px-8">
        <div className="min-w-0">
          <section
            className="min-w-0 border-t border-b border-white/10 py-10 md:py-12"
            aria-label="Connect"
          >
            <div className="flex flex-col md:flex-row md:flex-wrap gap-x-16 gap-y-2 md:gap-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full md:w-auto items-center justify-between md:justify-start gap-3 border-b border-white/10 md:border-none py-4 md:py-0"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm md:text-base">{link.label}</span>
                  </span>
                  <PlusIcon className="w-4 h-4 p-2.5" />
                </a>
              ))}
            </div>
          </section>

          <section
            className="min-w-0 w-full border-b border-white/25 pt-8 pb-10 text-center md:pt-10 md:pb-12"
            aria-labelledby="footer-brand"
          >
            <p
              id="footer-brand"
              className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/60"
            >
              Linnorea
            </p>

            <p className="mt-5 text-sm leading-6 text-white/75">{brandText}</p>

            <a
              href="https://wa.me/6281919452042"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[var(--color-bg-base)]"
            >
              {whatsappText}
            </a>

            {settings?.googleMapsUrl ? (
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mx-auto mt-7 block max-w-md text-xs leading-5 text-white/60 transition-colors hover:text-white"
              >
                {officeAddress}
              </a>
            ) : (
              <p className="mx-auto mt-7 max-w-md text-xs leading-5 text-white/60">
                {officeAddress}
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="px-5 py-6 text-center md:px-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
          © {new Date().getFullYear()} Linnorea Design Works
        </p>
      </div>
    </footer>
  );
}
