"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SanityImage } from "@/lib/sanity/types";
import { LangSwitcher } from "./LangSwitcher";

gsap.registerPlugin(ScrollTrigger);

type HeaderProps = {
  dictionary: Dictionary;
  currentLocale: Locale;
};

const headerContentClassName = "relative z-10 m-0 mt-[7px] mb-[8px] flex h-[25px] max-w-7xl items-center px-6";

export function Header({ dictionary, currentLocale }: HeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState<SanityImage | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    sanityClient
      .fetch<{ logo?: SanityImage } | null>(siteSettingsQuery)
      .then((settings) => {
        if (isMounted) {
          setLogo(settings?.logo ?? null);
        }
      })
      .catch((error: unknown) => {
        console.warn("Sanity logo could not be loaded. Using the static fallback.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const hero = document.querySelector("[data-home-hero]");
    if (!hero) return;

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: "bottom top",
      onEnter: () => setIsHidden(true),
      onLeaveBack: () => setIsHidden(false),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const navItems = [
    { label: dictionary.nav.home, href: `/${currentLocale}` },
    { label: dictionary.nav.about, href: `/${currentLocale}/about` },
    { label: dictionary.nav.project, href: `/${currentLocale}/project` },
    { label: dictionary.nav.service, href: `/${currentLocale}/service` },
    { label: dictionary.nav.product, href: `/${currentLocale}/product` },
  ];
  const isNavItemActive = (href: string, index: number) => {
    if (index === 0) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const navLinkClass = (isActive: boolean) =>
    `relative inline-flex transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
      isActive ? "opacity-100 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-white after:transition-transform after:duration-300" : "opacity-80"
    }`;

  return (
    <header
      className={[
        "header-site fixed inset-x-0 top-0 z-50 bg-[var(--color-bg-elevated)] text-white transition-[transform,opacity] duration-500 ease-out",
        isHidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div className={headerContentClassName}>
        <Link href={`/${currentLocale}`} aria-label={dictionary.ui.linnoreaHome} className="inline-flex h-6 w-6 shrink-0">
          <Image src={logo ? urlFor(logo).width(48).height(48).fit("crop").auto("format").url() : "/assets/logo-mark.png"} alt="Linnorea" width={24} height={24} priority className="block h-6 w-6 object-contain" />
        </Link>

        <nav className="header-desktop-nav ml-8 hidden items-center gap-7 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
          {navItems.map((item, index) => (
            <Link key={item.href} href={item.href} className={navLinkClass(isNavItemActive(item.href, index))}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-desktop-language ml-auto hidden">
          <LangSwitcher currentLocale={currentLocale} dictionary={dictionary} />
        </div>

        <button
          type="button"
          aria-label={dictionary.ui.toggleNavigation}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="header-mobile-toggle inline-flex h-11 w-11 items-center justify-center text-white transition-opacity hover:opacity-70 active:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="h-px w-[14px] bg-current" />
            <span className="h-px w-[14px] bg-current" />
            <span className="h-px w-[14px] bg-current" />
          </span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="header-mobile-menu border-t border-white/10 bg-[#0b0b0d]/90 px-5 py-5 backdrop-blur-md">
          <nav className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em] text-white/80">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={navLinkClass(isNavItemActive(item.href, index))}>
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <LangSwitcher currentLocale={currentLocale} dictionary={dictionary} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
