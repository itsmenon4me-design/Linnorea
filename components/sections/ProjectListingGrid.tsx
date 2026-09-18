"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { urlFor } from "@/lib/sanity/image";
import { normalizeProjectCategory } from "@/lib/sanity/projectCategories";
import { plainText, portableTextToParagraphs, type Project } from "@/lib/sanity/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ProjectListingGridProps = {
  projects: Project[];
  categories: string[];
  dictionary: Dictionary;
};

export function ProjectListingGrid({ projects, categories, dictionary }: ProjectListingGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeMarket, setActiveMarket] = useState<string | null>(null);
  const [openFilter, setOpenFilter] = useState<"location" | "status" | "market" | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [suppressCardHover, setSuppressCardHover] = useState(false);
  useEffect(() => {
    setActiveCategory(searchParams.get("category"));
    setActiveLocation(searchParams.get("location"));
    setActiveStatus(searchParams.get("status"));
    setActiveMarket(searchParams.get("market"));
    const projectKey = searchParams.get("project");
    setSelectedProject(
      projectKey
        ? projects.find((project) => getProjectQueryKey(project) === projectKey) ?? null
        : null,
    );
  }, [projects, searchParams]);

  const visibleProjects = useMemo(() => projects.filter((project) => {
    const matches = (value: string | undefined, selected: string | null) => !selected || value?.trim() === selected;
    return matches(normalizeProjectCategory(project.category), activeCategory)
      && matches(project.location, activeLocation)
      && matches(project.status, activeStatus)
      && matches(project.market, activeMarket);
  }), [activeCategory, activeLocation, activeStatus, activeMarket, projects]);

  const updateFilter = (key: "category" | "location" | "status" | "market", value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setOpenFilter(null);
  };

  const toggleView = () => {
    setIsListView((current) => !current);
  };

  const openProject = (project: Project) => {
    setSuppressCardHover(false);
    setSelectedProject(project);
    setIsDescriptionExpanded(false);
    const next = new URLSearchParams(searchParams.toString());
    next.set("project", getProjectQueryKey(project));
    next.delete("gallery");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const closeProject = () => {
    setSuppressCardHover(true);
    setSelectedProject(null);
    setIsDescriptionExpanded(false);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("project");
    next.delete("gallery");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      {categories.length > 0 ? (
        <div className="overflow-visible pb-8 pt-4" aria-label={dictionary.ui.filterProjects}>
          <div className="project-category-list flex flex-wrap items-start gap-x-10 gap-y-3">
            <ProjectFilterButton active={activeCategory === null} onClick={() => updateFilter("category", null)}>{dictionary.ui.allProjects}</ProjectFilterButton>
          {categories.map((category) => (
            <ProjectFilterButton key={category} active={activeCategory === category} onClick={() => updateFilter("category", category)}>{category}</ProjectFilterButton>
          ))}
          </div>
          <div className="project-archive-controls mt-8 flex flex-wrap items-start gap-3 border-t border-white/10 pt-5">
            <div className="project-secondary-controls flex w-full flex-wrap gap-3">
              <FilterControl label={dictionary.ui.location} value={activeLocation} options={uniqueProjectValues(projects.map((project) => project.location))} open={openFilter === "location"} onToggle={() => setOpenFilter(openFilter === "location" ? null : "location")} onSelect={(value) => updateFilter("location", value)} />
              <FilterControl label={dictionary.ui.status} value={activeStatus} options={uniqueProjectValues(projects.map((project) => project.status))} open={openFilter === "status"} onToggle={() => setOpenFilter(openFilter === "status" ? null : "status")} onSelect={(value) => updateFilter("status", value)} />
              <FilterControl label="Markets" value={activeMarket} options={uniqueProjectValues(projects.map((project) => project.market))} open={openFilter === "market"} onToggle={() => setOpenFilter(openFilter === "market" ? null : "market")} onSelect={(value) => updateFilter("market", value)} />
              <button type="button" aria-label={isListView ? "Switch to grid view" : "Switch to list view"} aria-pressed={isListView} onClick={toggleView} className="project-view-toggle flex min-h-11 items-center justify-center text-white transition hover:text-white/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <span aria-hidden="true" className={`grid gap-1 ${isListView ? "grid-flow-col auto-cols-max" : ""}`}>
                  <span className={`block bg-current ${isListView ? "h-4 w-px" : "h-px w-6"}`} />
                  <span className={`block bg-current ${isListView ? "h-4 w-px" : "h-px w-6"}`} />
                  <span className={`block bg-current ${isListView ? "h-4 w-px" : "h-px w-6"}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {visibleProjects.length > 0 ? (
        <div
          key={`${isListView ? "list" : "grid"}-${activeCategory ?? ""}-${activeLocation ?? ""}-${activeStatus ?? ""}-${activeMarket ?? ""}`}
          className={`project-archive-grid grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3 ${isListView ? "project-archive-grid--list" : ""} ${suppressCardHover ? "project-archive-grid--hover-suppressed" : ""}`}
          onPointerLeave={() => setSuppressCardHover(false)}
        >
          {visibleProjects.map((project, index) => (
            <ProjectGalleryItem key={project._id} project={project} index={index} dictionary={dictionary} onOpen={() => openProject(project)} onPointerEnter={() => setSuppressCardHover(false)} isListView={isListView} />
          ))}
        </div>
      ) : (
        <div className="border-b border-white/10 py-20 text-sm text-white/65">{dictionary.ui.filteredProjectEmpty}</div>
      )}
      {selectedProject ? (
        <ProjectViewer
          key={`${selectedProject._id}-${searchParams.get("gallery") === "true" ? "gallery" : "detail"}`}
          project={selectedProject}
          dictionary={dictionary}
          initialGalleryOpen={searchParams.get("gallery") === "true"}
          isDescriptionExpanded={isDescriptionExpanded}
          onToggleDescription={() => setIsDescriptionExpanded((expanded) => !expanded)}
          onClose={closeProject}
        />
      ) : null}
    </>
  );
}

function ProjectFilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`project-filter-button relative block min-h-11 w-full py-2 text-left font-light capitalize tracking-[-0.06em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${active ? "text-white" : "text-white/35 hover:text-white/65"}`}>
      {children}
      <span className={`absolute inset-x-0 bottom-1 h-px bg-white transition-all ${active ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

function uniqueProjectValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function FilterControl({ label, value, options, open, onToggle, onSelect }: { label: string; value: string | null; options: string[]; open: boolean; onToggle: () => void; onSelect: (value: string | null) => void }) {
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} aria-expanded={open} className="project-filter-control group flex min-h-16 w-full items-center justify-between border-b border-white/35 px-0 text-left text-[10px] uppercase tracking-[0.16em] text-white/75 transition hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <span className={value ? "text-white" : undefined}>{label}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open ? (
        <div className="project-filter-menu project-filter-menu--opening absolute left-0 top-[calc(100%+0.4rem)] z-20 grid max-h-56 min-w-full w-max max-w-[min(15rem,calc(100vw-2rem))] gap-0 overflow-y-auto rounded-lg border border-white/10 bg-[#17191c] p-1 shadow-2xl">
          <button type="button" onClick={() => onSelect(null)} className={`project-filter-option min-h-8 px-2.5 text-left text-[9px] tracking-[0.1em] transition hover:bg-white/10 ${value ? "text-white/60" : "text-white"}`}>All</button>
          {options.map((option) => <button key={option} type="button" onClick={() => onSelect(option)} className={`project-filter-option min-h-8 whitespace-normal px-2.5 text-left text-xs transition hover:bg-white/10 ${value === option ? "text-white" : "text-white/65"}`}>{value === option ? "• " : ""}{option}</button>)}
        </div>
      ) : null}
    </div>
  );
}

function ProjectGalleryItem({ project, index, dictionary, onOpen, onPointerEnter, isListView }: { project: Project; index: number; dictionary: Dictionary; onOpen: () => void; onPointerEnter: () => void; isListView: boolean }) {
  const [isImageEntering, setIsImageEntering] = useState(isListView);
  const itemRef = useRef<HTMLButtonElement>(null);
  const title = plainText(project.title) || dictionary.home.untitledProject;
  const imageUrl = project.coverImage
    ? urlFor(project.coverImage).width(1800).height(1200).fit("crop").auto("format").quality(90).url()
    : project.fallbackImageUrl ?? fallbackProjectImages[index % fallbackProjectImages.length];
  const aspectRatio = getImageAspectRatio(project.coverImage);

  useEffect(() => {
    if (isListView) {
      const item = itemRef.current;
      let revealFrame: number | undefined;
      if (!item || typeof IntersectionObserver === "undefined") {
        setIsImageEntering(false);
        return;
      }

      setIsImageEntering(true);
      const reveal = () => {
        revealFrame = window.requestAnimationFrame(() => setIsImageEntering(false));
      };
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      }, { threshold: 0.01 });
      observer.observe(item);
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) reveal();
      return () => {
        observer.disconnect();
        if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
      };
    }

    const item = itemRef.current;
    let entryTimer: number | undefined;
    if (!item || typeof IntersectionObserver === "undefined") {
      setIsImageEntering(!isListView);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsImageEntering(true);
        entryTimer = window.setTimeout(() => setIsImageEntering(false), 1100);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(item);
    return () => {
      observer.disconnect();
      if (entryTimer !== undefined) window.clearTimeout(entryTimer);
    };
  }, [isListView]);

  return (
    <button ref={itemRef} type="button" onClick={onOpen} onPointerEnter={onPointerEnter} className={`project-gallery-item group mb-4 block w-full break-inside-avoid text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isImageEntering && !isListView ? "project-gallery-item--image-entering" : ""} ${isListView ? `project-list-item grid gap-4 border-b border-white/10 pb-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] ${isImageEntering ? "project-list-item--entering" : ""}` : ""}`}>
      <div className={`project-gallery-media relative overflow-hidden rounded-[0.65rem] bg-[var(--color-bg-elevated)] ${isListView ? "project-list-thumb h-16 w-[5.5rem]" : ""}`} style={isListView ? undefined : { aspectRatio }}>
        <div className="project-gallery-image-hover absolute inset-0">
          {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="project-gallery-image object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
        </div>
        {!isListView ? (
          <div className="project-card-meta pointer-events-none absolute bottom-2 left-2 mr-2 flex max-w-[calc(100%-1rem)] items-end rounded-xl bg-black/20 p-4 text-white">
            <div>
              <p className="project-card-meta__title text-sm font-medium leading-tight transition-colors duration-200">{title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/75">{project.location || normalizeProjectCategory(project.category) || dictionary.ui.projectCategory}</p>
            </div>
          </div>
        ) : null}
      </div>
      {isListView ? <div className="grid items-center gap-3 py-2 text-sm text-white/65 sm:grid-cols-[1fr_1fr_auto]"><span className="project-list-item__title text-base text-white/80 transition-colors duration-200">{title}</span><span className="text-[10px] uppercase tracking-[0.14em]">{project.location || normalizeProjectCategory(project.category) || dictionary.ui.projectCategory}</span><span className="text-[10px] uppercase tracking-[0.14em]">{project.year || ""}</span></div> : null}
    </button>
  );
}

function ProjectViewer({ project, dictionary, initialGalleryOpen, isDescriptionExpanded, onToggleDescription, onClose }: { project: Project; dictionary: Dictionary; initialGalleryOpen: boolean; isDescriptionExpanded: boolean; onToggleDescription: () => void; onClose: () => void }) {
  const title = plainText(project.title) || dictionary.home.untitledProject;
  const descriptionParagraphs = portableTextToParagraphs(project.description);
  const hasDescription = descriptionParagraphs.length > 0;
  const hasExpandableContent = descriptionParagraphs.length > 1 || Boolean(project.team?.length);
  const visibleDescriptionParagraphs = isDescriptionExpanded ? descriptionParagraphs : descriptionParagraphs.slice(0, 1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(initialGalleryOpen);
  const [animateNormalImages, setAnimateNormalImages] = useState(true);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const gallerySwiperRef = useRef<SwiperInstance | null>(null);
  const viewerScrollRef = useRef<HTMLDivElement>(null);
  const descriptionScrollTopRef = useRef(0);
  const images = [
    ...(project.coverImage ? [{ image: project.coverImage, url: null }] : []),
    ...(project.gallery ?? []).map((image) => ({ image, url: null })),
    ...(!project.coverImage ? [{ image: null, url: project.fallbackImageUrl ?? null }] : []),
    ...(project.fallbackGalleryUrls?.length ? project.fallbackGalleryUrls : fallbackProjectImages).map((url) => ({ image: null, url })),
  ].filter((entry, index, all) => {
    const key = entry.image?.asset?._ref ?? entry.url;
    return key && all.findIndex((candidate) => (candidate.image?.asset?._ref ?? candidate.url) === key) === index;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggleGallery = () => {
    if (!isGalleryOpen) {
      setAnimateNormalImages(true);
    } else {
      setAnimateNormalImages(false);
    }
    setIsGalleryOpen((current) => !current);
  };

  const openGalleryAt = (index: number) => {
    setInitialGalleryIndex(index);
    setAnimateNormalImages(true);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setAnimateNormalImages(false);
    setIsGalleryOpen(false);
    const next = new URLSearchParams(window.location.search);
    next.delete("gallery");
    window.history.replaceState(null, "", `${window.location.pathname}${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const toggleDescription = () => {
    descriptionScrollTopRef.current = viewerScrollRef.current?.scrollTop ?? 0;
    onToggleDescription();
  };

  useLayoutEffect(() => {
    const viewer = viewerScrollRef.current;
    if (!viewer) return;
    const scrollTop = descriptionScrollTopRef.current;
    viewer.scrollTop = scrollTop;
    const frame = window.requestAnimationFrame(() => {
      viewer.scrollTop = scrollTop;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isDescriptionExpanded]);

  return (
    <div ref={viewerScrollRef} role="dialog" aria-modal="true" aria-labelledby="project-viewer-title" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }} tabIndex={-1} className={`project-viewer-scroll fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 backdrop-blur-sm md:p-6 ${isDescriptionExpanded ? "" : "project-viewer-scroll--hidden"}`}>
      <div className={`project-viewer-shell relative mx-auto grid max-w-[1440px] gap-3 rounded-[0.8rem] bg-[#111315] p-3 text-white md:h-[90vh] md:overflow-hidden md:p-4 ${isGalleryOpen ? "project-viewer-shell--gallery md:grid-cols-1" : "md:grid-cols-[30%_70%]"}`}>
        {!isGalleryOpen ? <aside className={`project-viewer-scroll order-2 relative flex min-h-0 min-w-0 flex-col overflow-visible p-4 md:order-none md:p-6 ${isDescriptionExpanded ? "project-viewer-scroll--expanded" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="min-h-11 px-3 text-xs uppercase tracking-[0.16em] text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{dictionary.ui.close}</button>
            <button type="button" aria-label={dictionary.ui.gallery} onClick={toggleGallery} className="inline-flex min-h-11 items-center text-[10px] uppercase tracking-[0.2em] text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {isGalleryOpen ? dictionary.ui.close : dictionary.ui.gallery}
            </button>
          </div>
          <div className="mt-12 flex min-h-0 flex-1 flex-col">
            <h2 id="project-viewer-title" className="max-w-xs text-3xl font-light leading-[0.95] tracking-[-0.06em] md:text-4xl">{title}</h2>
            <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] uppercase tracking-[0.16em] text-white/50">
              {project.location ? <div><dt>{dictionary.ui.location}</dt><dd className="mt-1 text-white">{project.location}</dd></div> : null}
              {normalizeProjectCategory(project.category) ? <div><dt>{dictionary.ui.projectCategory}</dt><dd className="mt-1 text-white">{normalizeProjectCategory(project.category)}</dd></div> : null}
              {project.market ? <div><dt>Market</dt><dd className="mt-1 text-white">{project.market}</dd></div> : null}
              {project.styleTag ? <div><dt>Style</dt><dd className="mt-1 text-white">{project.styleTag}</dd></div> : null}
              {project.status ? <div><dt>Status</dt><dd className="mt-1 text-white">{project.status}</dd></div> : null}
              {project.year ? <div><dt>{dictionary.ui.year}</dt><dd className="mt-1 text-white">{project.year}</dd></div> : null}
              {project.area ? <div><dt>{dictionary.ui.area}</dt><dd className="mt-1 text-white">{project.area}</dd></div> : null}
            </dl>
            {hasDescription ? (
              <div className="mt-7 text-sm leading-6 text-white/75">
                {visibleDescriptionParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`} className={`${index > 0 ? "mt-5" : ""} ${!isDescriptionExpanded && hasExpandableContent && index === 0 ? "project-viewer-description-preview" : ""}`}>{paragraph}</p>)}
              </div>
            ) : null}
            {!isDescriptionExpanded ? (
              <button
                type="button"
                disabled={!hasExpandableContent}
                aria-disabled={!hasExpandableContent}
                onMouseDown={(event) => event.preventDefault()}
                onClick={hasExpandableContent ? toggleDescription : undefined}
                className={`project-viewer-read-more mt-4 flex-none text-left text-[10px] uppercase tracking-[0.2em] underline decoration-white/25 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${hasExpandableContent ? "text-white/60 transition hover:text-white" : "cursor-not-allowed text-white/35"}`}
              >
                {dictionary.ui.readMore}
              </button>
            ) : null}
            {isDescriptionExpanded && project.team?.length ? (
              <section className="mt-12" aria-labelledby="project-team-title">
                <h3 id="project-team-title" className="text-2xl font-light tracking-[-0.05em]">Team</h3>
                <div className="mt-6 grid gap-5 text-sm leading-6">
                  {project.team.map((group) => (
                    <div key={group.role} className="grid grid-cols-[7rem_1fr] gap-4">
                      <div className="text-white/65">{group.role}</div>
                      <div className="text-white/75">{group.members.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {isDescriptionExpanded && hasDescription ? <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={toggleDescription} className="mt-10 text-left text-[10px] uppercase tracking-[0.2em] text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{dictionary.ui.readLess}</button> : null}
          </div>
        </aside> : null}
        <div className={`project-viewer-gallery-frame relative min-w-0 ${isGalleryOpen ? "" : "project-viewer-gallery-frame--mobile order-1 md:order-none"}`}>
          {isGalleryOpen ? (
            <button type="button" onClick={closeGallery} className="project-viewer-gallery-close absolute left-3 top-3 z-20 min-h-11 px-3 text-xs uppercase tracking-[0.16em] text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {dictionary.ui.close}
            </button>
          ) : null}
          {isGalleryOpen ? (
            <Swiper
              onSwiper={(swiper) => {
                gallerySwiperRef.current = swiper;
                swiper.slideTo(initialGalleryIndex, 0);
                revealVisibleGalleryImages(swiper);
              }}
              onProgress={revealVisibleGalleryImages}
              slidesPerView="auto"
              spaceBetween={12}
              speed={400}
              longSwipesRatio={0.25}
              longSwipesMs={300}
              threshold={6}
              touchRatio={0.8}
              resistanceRatio={0}
              watchSlidesProgress
              watchOverflow
              grabCursor
              allowTouchMove
              className="project-viewer-gallery project-viewer-gallery--open"
              style={{ touchAction: "pan-y" }}
              aria-label={dictionary.ui.gallery}
            >
              {images.map((entry, index) => (
                <SwiperSlide
                  key={entry.image?._key ?? entry.image?.asset?._ref ?? index}
                  className="project-viewer-gallery-item--strip"
                  style={{ width: `${getImageAspectRatio(entry.image) * 90}vh` }}
                >
                  <ProjectViewerImage image={entry.image} imageUrl={entry.url} title={title} index={index} isGalleryOpen />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div id="project-gallery-mobile" className="project-viewer-gallery project-viewer-gallery--normal project-viewer-gallery--mobile project-viewer-scroll min-h-0 min-w-0">
              {images.length > 0 ? <ProjectViewerImage image={images[0].image} imageUrl={images[0].url} title={title} index={0} isGalleryOpen={false} animateEntry={animateNormalImages} onClick={() => openGalleryAt(0)} /> : <div className="flex min-h-[60vh] items-center justify-center bg-white/5"><MediaPlaceholder className="h-48 w-48" /></div>}
            </div>
          )}
          {isGalleryOpen && images.length > 1 ? (
            <div className="project-viewer-gallery-controls" aria-label={dictionary.ui.gallery}>
              <button type="button" aria-label="Previous image" onClick={() => gallerySwiperRef.current?.slidePrev()} className="project-viewer-gallery-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">←</button>
              <button type="button" aria-label="Next image" onClick={() => gallerySwiperRef.current?.slideNext()} className="project-viewer-gallery-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">→</button>
            </div>
          ) : null}
        </div>
        {!isGalleryOpen ? (
          <div className="project-viewer-gallery-frame project-viewer-gallery-frame--desktop relative min-w-0 md:col-start-2 md:row-start-1">
            <div
              className="project-viewer-gallery project-viewer-gallery--normal project-viewer-gallery--desktop project-viewer-scroll min-h-0 min-w-0"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {images.map((entry, index) => (
                <ProjectViewerImage key={entry.image?._key ?? entry.image?.asset?._ref ?? index} image={entry.image} imageUrl={entry.url} title={title} index={index} isGalleryOpen={false} animateEntry={animateNormalImages} onClick={() => openGalleryAt(index)} />
              ))}
            </div>
          </div>
        ) : null}
        {!isGalleryOpen && images.length > 1 ? (
          <div className="project-viewer-gallery-frame project-viewer-gallery-frame--mobile-continuation order-3 relative min-w-0">
            <div className="project-viewer-gallery project-viewer-gallery--normal project-viewer-gallery--mobile-continuation min-h-0 min-w-0">
              {images.slice(1).map((entry, index) => {
                const imageIndex = index + 1;
                return (
                  <ProjectViewerImage
                    key={entry.image?._key ?? entry.image?.asset?._ref ?? imageIndex}
                    image={entry.image}
                    imageUrl={entry.url}
                    title={title}
                    index={imageIndex}
                    isGalleryOpen={false}
                    animateEntry={animateNormalImages}
                    onClick={() => openGalleryAt(imageIndex)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProjectViewerImage({ image, imageUrl: fallbackUrl, title, index, isGalleryOpen, animateEntry = true, onClick }: { image: Project["coverImage"] | null; imageUrl: string | null; title: string; index: number; isGalleryOpen: boolean; animateEntry?: boolean; onClick?: () => void }) {
  const [isInView, setIsInView] = useState(!isGalleryOpen);
  const [isGalleryZooming] = useState(isGalleryOpen);
  const imageRef = useRef<HTMLButtonElement>(null);
  const imageUrl = image ? urlFor(image).width(1800).height(1200).fit("crop").auto("format").quality(82).url() : fallbackUrl;

  useEffect(() => {
    if (isGalleryOpen) return;

    const item = imageRef.current;
    if (!item || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(item);
    return () => observer.disconnect();
  }, [isGalleryOpen]);

  if (!imageUrl) return null;
  return (
    <button
      type="button"
      ref={imageRef}
      onClick={onClick}
      aria-label={onClick ? `Open ${title} image ${index + 1} in gallery` : undefined}
      className={`project-viewer-gallery-item w-full min-w-0 overflow-hidden rounded-[0.65rem] bg-white/5 ${index === 0 ? "first" : ""} ${isGalleryOpen ? "project-viewer-gallery-item--strip" : ""}`}
      style={!isGalleryOpen ? { aspectRatio: getImageAspectRatio(image) } : undefined}
    >
      <Image src={imageUrl} alt={`${title} ${index + 1}`} fill draggable={false} sizes="(max-width: 768px) 100vw, 66vw" className={`project-viewer-gallery-image object-cover ${isGalleryOpen ? (isGalleryZooming ? "project-viewer-gallery-image--zooming" : "") : isInView && animateEntry ? "project-viewer-gallery-image--entry" : ""}`} />
    </button>
  );
}

function revealVisibleGalleryImages(swiper: SwiperInstance) {
  swiper.slides.forEach((slide) => {
    if (!slide.classList.contains("swiper-slide-visible")) return;
    slide.querySelector(".project-viewer-gallery-image--zooming")?.classList.remove("project-viewer-gallery-image--zooming");
  });
}

const fallbackProjectImages = [
  "/assets/project-dummy-01.svg",
  "/assets/project-dummy-02.svg",
  "/assets/project-dummy-03.svg",
  "/assets/project-dummy-04.svg",
];

function getProjectQueryKey(project: Project) {
  const slug = project.slug?.current?.trim();
  if (slug) return slug;

  return plainText(project.title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getImageAspectRatio(image: Project["coverImage"] | null) {
  const width = image?.asset?.metadata?.dimensions?.width;
  const height = image?.asset?.metadata?.dimensions?.height;
  return width && height ? width / height : 4 / 3;
}
