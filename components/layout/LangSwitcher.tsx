"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type LangSwitcherProps = {
  currentLocale: Locale;
  dictionary: Dictionary;
};

export function LangSwitcher({ currentLocale, dictionary }: LangSwitcherProps) {
  const pathname = usePathname();
  const optionsId = useId();
  const isTouchRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const routePath = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "") || "/";
  const normalizedRoute = routePath === "/" ? "" : routePath;
  const otherLocales = locales.filter((locale) => locale !== currentLocale);

  return (
    <div
      className="flex w-fit items-center rounded-full border border-white/10 bg-white/5 p-1 text-[10px] tracking-[0.2em] text-white/80 backdrop-blur-sm"
      onPointerDown={(event) => {
        isTouchRef.current = event.pointerType === "touch";
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isTouchRef.current) {
          setIsExpanded(false);
        }
      }}
      onFocus={() => setIsExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsExpanded(false);
        }
      }}
      role="group"
      aria-label={dictionary.ui.languageSelection}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={optionsId}
        aria-label={`${dictionary.ui.currentLanguage}: ${localeLabels[currentLocale]}. ${isExpanded ? dictionary.ui.collapse : dictionary.ui.expand} ${dictionary.ui.languageSelection}`}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="rounded-full bg-white px-2 py-1 text-[#0b0b0d] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-accent-gold)]"
      >
        {localeLabels[currentLocale]}
      </button>

      <div
        id={optionsId}
        className={[
          "flex items-center overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out",
          isExpanded ? "ml-1 max-w-[280px] opacity-100" : "max-w-0 opacity-0",
        ].join(" ")}
        aria-hidden={!isExpanded}
      >
        {otherLocales.map((locale) => {
        const href = `/${locale}${normalizedRoute}`;

        return (
          <Link
            key={locale}
            href={href}
            tabIndex={isExpanded ? 0 : -1}
            className={[
              "rounded-full px-2 py-1 text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-accent-gold)]",
            ].join(" ")}
          >
            {localeLabels[locale]}
          </Link>
        );
        })}
      </div>
    </div>
  );
}
