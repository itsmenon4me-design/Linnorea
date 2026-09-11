import Image from "next/image";
import Link from "next/link";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { urlFor } from "@/lib/sanity/image";
import type { Locale } from "@/lib/i18n/config";
import { localizedValue, type Project } from "@/lib/sanity/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  dictionary: Dictionary;
};

export function ProjectCard({ project, locale, dictionary }: ProjectCardProps) {
  const title = localizedValue(project.title, locale) || dictionary.home.untitledProject;
  const style = localizedValue(project.styleTag, locale);
  const slug = project.slug?.current;
  const imageUrl = project.coverImage ? urlFor(project.coverImage).width(1200).height(900).fit("crop").auto("format").quality(78).url() : null;

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
            <MediaPlaceholder className="h-full w-full" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-5 pb-5 pt-20">
            <p className="text-lg font-medium tracking-[-0.02em] text-white">{title}</p>
            <p className="mt-1 text-xs text-white/75">{project.category || dictionary.ui.projectCategory}</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-white/15 py-4">
          <h2 className="text-sm font-medium tracking-[0.02em] text-white/75 md:text-base">{project.category || dictionary.ui.projectCategory}</h2>
          {style ? <p className="max-w-[45%] text-right text-[10px] uppercase tracking-[0.2em] text-white/55">{style}</p> : null}
        </div>
      </article>
    </Link>
  );
}
