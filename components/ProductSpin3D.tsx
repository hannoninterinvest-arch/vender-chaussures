"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

/** Vue 3D de la paire : rotation à la souris (comme un plateau 360°). */
export function ProductSpin3D({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [angle, setAngle] = useState(12);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const auto = useRef(true);

  useEffect(() => {
    if (!auto.current) return;
    const timer = window.setInterval(() => {
      if (dragging.current || !auto.current) return;
      setAngle((n) => (n + 0.35) % 360);
    }, 32);
    return () => window.clearInterval(timer);
  }, []);

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    auto.current = false;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setAngle((n) => n + delta * 0.55);
  }

  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      className={`product-stage-3d relative select-none ${className}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      role="img"
      aria-label={`${alt} — vue 3D`}
    >
      <div className="product-stage-3d-floor" />
      <div
        className="product-stage-3d-item"
        style={{ transform: `rotateY(${angle}deg)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
      </div>
      <span className="badge-3d pointer-events-none absolute left-3 top-3">Vue 3D</span>
      <p className="pointer-events-none absolute bottom-3 left-3 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#F3EDE2]/80">
        Glisse pour tourner
      </p>
    </div>
  );
}
