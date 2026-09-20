"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

type AboutCard = {
  _id: string;
  title?: string;
  category?: string;
  coverImage?: SanityImage;
  summary?: string;
  href: string;
};

const INITIAL_COUNT = 8;
const LOAD_COUNT = 12;

export function AboutInsightCards({ cards }: { cards: AboutCard[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleCards = cards.slice(0, visibleCount);
  const hasMore = visibleCount < cards.length;
  const isExpanded = visibleCount > INITIAL_COUNT;

  function toggleCards() {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + LOAD_COUNT, cards.length));
      return;
    }

    setVisibleCount(INITIAL_COUNT);
  }

  return (
    <>
      <div data-reveal className="about-card-list about-card-list--editorial mt-16 md:mt-20">
        {visibleCards.map((card) => {
          const imageUrl = card.coverImage
            ? urlFor(card.coverImage).width(1600).height(1100).fit("crop").auto("format").quality(80).url()
            : null;

          return (
            <Link key={card._id} href={card.href} className="group about-card-item min-w-0">
              <div className="about-card-media relative aspect-[3/2] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={card.title ?? "Project or insight"}
                    fill
                    quality={80}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <MediaPlaceholder className="h-full w-full" />
                )}
              </div>
              <div className="about-card-copy min-w-0">
                <p className="text-xs tracking-[0.16em] text-white/55">{card.category}</p>
                <h3 className="mt-5 text-xl font-medium leading-tight tracking-[-0.04em] underline decoration-transparent underline-offset-4 transition group-hover:decoration-white/40 lg:text-2xl">{card.title}</h3>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{card.summary}</p>
              </div>
            </Link>
          );
        })}
      </div>
      {cards.length > INITIAL_COUNT ? (
        <button
          type="button"
          onClick={toggleCards}
          className="mx-auto mt-16 flex min-h-11 items-center gap-5 rounded-full border border-white/60 px-8 py-3 text-base text-white transition hover:border-white hover:bg-white hover:text-[var(--color-bg-base)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-expanded={isExpanded}
        >
          <span>{hasMore ? "Show more" : "Show less"}</span>
          <span aria-hidden="true" className="text-3xl font-light leading-none">{hasMore ? "+" : "−"}</span>
        </button>
      ) : null}
    </>
  );
}
