"use client";

import { useEffect, useRef, useState } from "react";
import { videoPoster } from "@/lib/media";

export function ProductVideo({
  src,
  poster,
  className = "",
  autoPlay = true,
  controls = true,
  label = "Vue 3D",
}: {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (autoPlay) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [src, autoPlay]);

  return (
    <div className={`product-video relative overflow-hidden bg-[#14110C] ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster || videoPoster(src)}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        controls={controls}
        autoPlay={autoPlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <span className="badge-3d pointer-events-none absolute left-3 top-3">
        {label}
      </span>
      {!playing && !controls ? (
        <button
          type="button"
          aria-label="Lire la vidéo 3D"
          className="absolute inset-0 grid place-items-center bg-black/20"
          onClick={() => {
            ref.current?.play().catch(() => {});
          }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#C5A059] text-[#1A1612]">
            ▶
          </span>
        </button>
      ) : null}
    </div>
  );
}
