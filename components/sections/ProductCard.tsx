"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ArrowAction } from "@/components/ui/ArrowAction";

type ProductCardProps = {
  name: string;
  description: string;
  imageUrls: string[];
  detailHref?: string;
  discoverLabel: string;
};

export function ProductCard({ name, description, imageUrls, detailHref, discoverLabel }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasHoverImage = imageUrls.length > 1;

  function canHover() {
    return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  return (
    <article data-reveal className="border-b border-white/15 pb-6">
      <div
        className="relative aspect-square overflow-hidden bg-[var(--color-bg-elevated)]"
        onMouseEnter={() => {
          if (hasHoverImage && canHover()) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (hasHoverImage && canHover()) setIsHovered(false);
        }}
      >
        {imageUrls.length ? (
          <>
            <Image
              src={imageUrls[0]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-opacity duration-[250ms] ease-out ${isHovered ? "opacity-0" : "opacity-100"}`}
            />
            {hasHoverImage ? (
              <Image
                src={imageUrls[1]}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                aria-hidden="true"
                className={`object-cover transition-opacity duration-[250ms] ease-out ${isHovered ? "opacity-100" : "opacity-0"}`}
              />
            ) : null}
          </>
        ) : (
          <MediaPlaceholder className="h-full w-full" />
        )}
      </div>
      <h2 className="mt-5 text-2xl font-medium tracking-[-0.04em] md:text-3xl">{name}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/60 md:text-base">{description}</p>
      {detailHref ? (
        <Link href={detailHref} className="mt-5 inline-flex text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-gold)]">
          <ArrowAction label={discoverLabel} className="text-[10px] uppercase tracking-[0.25em]" />
        </Link>
      ) : null}
    </article>
  );
}
