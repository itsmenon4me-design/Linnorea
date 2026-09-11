import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedValue, type SiteSettings } from "@/lib/sanity/types";

type FooterProps = {
  currentLocale: Locale;
  dictionary: Dictionary;
};

type SocialPlatform = "WhatsApp" | "Instagram" | "Threads" | "LinkedIn" | "Pinterest" | "TikTok" | "Facebook" | "X" | "Twitch" | "YouTube";

function SocialIcon({ platform, className }: { platform?: string; className?: string }) {
  const iconProps = {
    "aria-hidden": true,
    className: `${className ?? ""} shrink-0 fill-current`,
    style: { width: "1rem", height: "1rem" },
    viewBox: "0 0 24 24",
  };

  switch (platform as SocialPlatform) {
    case "WhatsApp":
      return <svg {...iconProps}><path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A9.8 9.8 0 1 0 12 2Zm0 2a7.8 7.8 0 0 1 6.8 11.7l-.3.5.8 2.8-2.9-.7-.5.3A7.8 7.8 0 1 1 12 4Zm-2.2 3.1c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.6 4 3.5 2 .8 2.4.6 2.8.6.4 0 1.3-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.3-.2-.7-.4l-1.4-.7c-.3-.1-.5-.2-.7.2-.2.3-.5.7-.7.9-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2-1.2-.7-.6-1.2-1.4-1.3-1.7-.1-.3 0-.4.1-.5l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.6-1.5c-.2-.4-.4-.6-.6-.6Z" /></svg>;
    case "Facebook":
      return <svg {...iconProps}><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2V10H7.3v3h2.8v8h3.4Z" /></svg>;
    case "Instagram":
      return <svg {...iconProps}><path fillRule="evenodd" d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm9.7 1.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
    case "LinkedIn":
      return <svg {...iconProps}><path d="M5.2 7.3A2 2 0 1 1 5.2 3a2 2 0 0 1 0 4.3ZM3.4 21V9h3.6v12H3.4Zm5.8 0V9h3.4v1.6h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.6v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.2Z" /></svg>;
    case "Threads":
      return <svg {...iconProps}><path d="M12.2 2C6.7 2 3.2 5.7 3.2 11.7c0 6.6 3.7 10.3 9.3 10.3 4.9 0 8.3-2.8 8.3-7 0-3.3-2.1-5.6-5.5-6.4-.4-2.3-1.8-3.5-4.2-3.5-2.1 0-3.8 1.2-4.4 3.1l2 .7c.3-1 1.1-1.6 2.3-1.6 1.2 0 2 .5 2.3 1.6-.4 0-.8-.1-1.2-.1-3.9 0-6.3 2-6.3 5 0 2.7 2 4.5 4.9 4.5 2.7 0 4.5-1.5 4.9-3.9 1.3.7 2 1.7 2 3.1 0 2.8-2.3 4.8-5.9 4.8-4.3 0-7.1-2.7-7.1-8.1 0-4.7 2.4-7.2 6.7-7.2 3.1 0 5.1 1.5 5.9 4.6l2-.5C18.1 4.6 15.9 2 12.2 2Zm-.7 12.4c-1.7 0-2.7-.8-2.7-2.1 0-1.7 1.4-2.7 3.9-2.7.6 0 1.3.1 1.9.2 0 3-1 4.6-3.1 4.6Z" /></svg>;
    case "Pinterest":
      return <svg {...iconProps}><path d="M12.4 2C6.7 2 3 5.7 3 10.5c0 3.5 2 5.9 4.5 6.9-.1-.6-.1-1.6 0-2.3l1-4.1s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.7 0 1-.6 2.5-.9 3.8-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5 2.4-5 4.9 0 1 .4 2.1.9 2.7.1.1.1.2.1.4l-.3 1.1c-.1.4-.4.5-.8.3-1.5-.7-2.4-2.7-2.4-4.4 0-3.6 2.6-6.9 7.6-6.9 4 0 7.1 2.9 7.1 6.7 0 4-2.5 7.2-5.9 7.2-1.2 0-2.3-.6-2.7-1.3l-.7 2.8c-.3 1-.9 2.2-1.3 2.9.9.3 1.8.5 2.8.5 5.7 0 9.4-3.7 9.4-9.5C21.8 5.7 18.1 2 12.4 2Z" /></svg>;
    case "TikTok":
      return <svg {...iconProps}><path d="M16.6 2h3.1c.2 1.7 1.2 3.2 2.8 4.1v3.2a8.4 8.4 0 0 1-2.8-1V15a6.8 6.8 0 1 1-6.8-6.8c.4 0 .8 0 1.2.1v3.5a3.3 3.3 0 1 0 2.5 3.2V2Z" /></svg>;
    case "X":
      return <svg {...iconProps}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.2 22H3.1l7.2-8.3L2.8 2h6.4l4.5 5.9L18.9 2Zm-1.1 17.8h1.7L8.3 4H6.5l11.3 15.8Z" /></svg>;
    default:
      return null;
  }
}

export async function Footer({ currentLocale, dictionary }: FooterProps) {
  const settings = (await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery)) ?? null;
  const brandText = localizedValue(settings?.brandStatement, currentLocale) || "Linnorea Design Works";
  const officeAddress = localizedValue(settings?.officeAddress, currentLocale) || "Sovereign Plaza 12th Floor - Jl. TB Simatupang No.36, Cilandak, Jakarta 12430";
  const whatsappText = localizedValue(settings?.whatsappCtaText, currentLocale) || dictionary.home.cta;
  const socialOrder = ["WhatsApp", "Instagram", "Threads", "LinkedIn", "Pinterest"];
  const socialLinks = socialOrder.flatMap((platform) => {
    const configuredLink = settings?.socialLinks?.find((link) => link.platform === platform && link.url);
    if (!configuredLink?.url) return [];
    return [{
      icon: (props: { className?: string }) => <SocialIcon platform={platform} {...props} />,
      label: platform,
      platform,
      url: configuredLink.url,
    }];
  });

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
                  className="flex w-full md:w-auto items-center justify-between md:justify-start gap-3 border-none py-4 md:py-0"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm md:text-base">{link.label}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section
            className="min-w-0 w-full border-b border-white/25 pt-8 pb-10 text-center md:pt-10 md:pb-12"
            aria-labelledby="footer-brand"
          >
            <Image
              src="/assets/logo-mark.png"
              alt=""
              width={48}
              height={48}
              className="mx-auto h-10 w-10 object-contain"
            />

            <p id="footer-brand" className="mt-5 text-sm leading-6 text-white/75">{brandText}</p>

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
