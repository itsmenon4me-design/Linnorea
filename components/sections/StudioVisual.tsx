"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage, MuxVideo } from "@/lib/sanity/types";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type StudioVisualProps = {
  image?: SanityImage;
  video?: MuxVideo;
};

export function StudioVisual({ image, video }: StudioVisualProps) {
  const playbackId = video?.asset?.status === "ready" ? video.asset.playbackId : null;

  if (playbackId) {
    return (
      <MuxPlayer
        playbackId={playbackId}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`}
        aria-label="Linnorea studio visual video"
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
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (image) {
    return <Image src={urlFor(image).width(1920).height(1280).fit("crop").auto("format").url()} alt="Linnorea studio" fill priority sizes="100vw" className="object-cover" />;
  }

  return <div className="absolute inset-0 flex items-center justify-center text-center text-[10px] uppercase tracking-[0.32em] text-white/40">[Placeholder studio visual]</div>;
}
