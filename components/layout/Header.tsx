"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SanityImage } from "@/lib/sanity/types";

type HeaderProps = {
  dictionary: Dictionary;
};

const headerContentClassName = "relative z-10 m-0 mt-[7px] mb-[8px] flex h-[25px] max-w-7xl items-center px-6";

export function Header({ dictionary }: HeaderProps) {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState<SanityImage | null>(null);
  const previousScrollYRef = useRef(0);

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
    const scrollThreshold = 8;
    previousScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - previousScrollYRef.current;

      if (currentScrollY <= 0) {
        setIsHidden(false);
      } else if (Math.abs(scrollDelta) >= scrollThreshold) {
        setIsHidden(scrollDelta > 0);
        previousScrollYRef.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: dictionary.nav.home, href: "/" },
    { label: dictionary.nav.about, href: "/about" },
    { label: dictionary.nav.project, href: "/project" },
    { label: dictionary.nav.service, href: "/service" },
    { label: dictionary.nav.product, href: "/product" },
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
        <Link href="/" aria-label={dictionary.ui.linnoreaHome} className="inline-flex min-h-11 items-center text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Image src={logo ? urlFor(logo).width(48).height(48).fit("crop").auto("format").quality(78).url() : "/assets/logo-mark.png"} alt="" width={22} height={22} priority className="block h-[22px] w-[22px] object-contain" />
        </Link>

        <nav className="header-desktop-nav ml-8 hidden items-center gap-7 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
          {navItems.map((item, index) => (
            <Link key={item.href} href={item.href} className={navLinkClass(isNavItemActive(item.href, index))}>
              {item.label}
            </Link>
          ))}
        </nav>

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
        <div className="header-mobile-menu border-t border-white/10 bg-[#0b0b0d] px-5 py-5">
          <nav className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em] text-white/80">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={navLinkClass(isNavItemActive(item.href, index))}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
