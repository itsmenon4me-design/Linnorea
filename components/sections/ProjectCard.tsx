import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import type { Locale } from "@/lib/i18n/config";
import { localizedValue, type Project } from "@/lib/sanity/types";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
};

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const title = localizedValue(project.title, locale) || "Untitled project";
  const style = localizedValue(project.styleTag, locale);
  const slug = project.slug?.current;
  const imageUrl = project.coverImage ? urlFor(project.coverImage).width(1200).height(900).fit("crop").auto("format").url() : null;

  if (!slug) return null;

  return (
    <Link href={`/${locale}/project/${slug}`} className="group block rounded-[1.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-gold)]">
      <article>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--color-bg-elevated)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/45">
              [Placeholder cover image]
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-sm text-white/80">{project.category || "Project"}</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-white/15 py-4">
          <h2 className="text-2xl font-medium tracking-[-0.03em] text-white md:text-3xl">{title}</h2>
          {style ? <p className="max-w-[45%] text-right text-[10px] uppercase tracking-[0.2em] text-white/55">{style}</p> : null}
        </div>
      </article>
    </Link>
  );
}
