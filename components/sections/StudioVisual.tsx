"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage, MuxVideo } from "@/lib/sanity/types";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type StudioVisualProps = {
  image?: SanityImage;
  video?: MuxVideo;
  videoLabel: string;
};

export function StudioVisual({ image, video, videoLabel }: StudioVisualProps) {
  const playbackId = video?.asset?.status === "ready" ? video.asset.playbackId : null;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!playbackId) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [playbackId]);

  useEffect(() => {
    setVideoFailed(false);
  }, [playbackId]);

  if (playbackId) {
    const imageUrl = image ? urlFor(image).width(1920).height(1280).fit("crop").auto("format").quality(80).url() : null;

    return (
      <div ref={containerRef} className="absolute inset-0">
        {imageUrl ? (
          <Image src={imageUrl} alt="Linnorea studio" fill quality={80} sizes="100vw" className="object-cover" />
        ) : null}
        {isNearViewport && !videoFailed ? (
          <MuxPlayer
            playbackId={playbackId}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=1920&height=1280&fit_mode=crop`}
            aria-label={videoLabel}
            theme="microvideo"
            nohotkeys
            defaultHiddenCaptions
            noVolumePref
            disablePictureInPicture
            style={{
              "--controls": "none",
              "--media-control-display": "none",
              "--media-control-bar-display": "none",
            }}
            onError={() => setVideoFailed(true)}
            onStalled={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : !imageUrl ? (
          <div aria-hidden="true" className="absolute inset-0 bg-[var(--color-bg-elevated)]" />
        ) : null}
      </div>
    );
  }

  if (image) {
    return <Image src={urlFor(image).width(1920).height(1280).fit("crop").auto("format").quality(80).url()} alt="Linnorea studio" fill quality={80} sizes="100vw" className="object-cover" />;
  }

  return <MediaPlaceholder className="absolute inset-0" />;
}
