"use client";

import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type HorizontalDragScrollerProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalDragScroller({ children, className = "" }: HorizontalDragScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, dragging: false, suppressClick: false, startX: 0, startY: 0, startScrollLeft: 0 });
  const mouseRef = useRef({ active: false, dragging: false, suppressClick: false, startX: 0, startY: 0, startScrollLeft: 0, lastX: 0 });
  const mouseFrameRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    gsap.killTweensOf(event.currentTarget);
    pointerRef.current = {
      active: true,
      dragging: false,
      suppressClick: false,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    const pointer = pointerRef.current;
    if (!pointer.active) return;

    const distanceX = event.clientX - pointer.startX;
    const distanceY = event.clientY - pointer.startY;
    if (!pointer.dragging) {
      if (Math.abs(distanceX) < 8 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
      pointer.dragging = true;
      setIsDragging(true);
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = pointer.startScrollLeft - distanceX;
  }

  function stopDragging(event?: PointerEvent<HTMLDivElement>) {
    if (event?.pointerType === "mouse") return;
    const scroller = event?.currentTarget;
    const wasDragging = pointerRef.current.dragging;
    if (scroller && event && scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    pointerRef.current.active = false;
    pointerRef.current.suppressClick = wasDragging;
    pointerRef.current.dragging = false;
    setIsDragging(false);

    if (scroller && wasDragging) {
      const cards = Array.from(scroller.children) as HTMLElement[];
      const nearestCard = cards.reduce<HTMLElement | null>((nearest, card) => {
        if (!nearest) return card;
        return Math.abs(card.offsetLeft - scroller.scrollLeft) < Math.abs(nearest.offsetLeft - scroller.scrollLeft)
          ? card
          : nearest;
      }, null);

      if (nearestCard) {
        gsap.to(scroller, {
          scrollLeft: nearestCard.offsetLeft,
          duration: 0.65,
          ease: "power3.out",
          overwrite: true,
        });
      }
    }
  }

  function finishMouseDrag() {
    const scroller = scrollerRef.current;
    const wasDragging = mouseRef.current.dragging;
    mouseRef.current.active = false;
    mouseRef.current.suppressClick = wasDragging;
    mouseRef.current.dragging = false;
    setIsDragging(false);

    if (!scroller || !wasDragging) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    const nearestCard = cards.reduce<HTMLElement | null>((nearest, card) => {
      if (!nearest) return card;
      return Math.abs(card.offsetLeft - scroller.scrollLeft) < Math.abs(nearest.offsetLeft - scroller.scrollLeft) ? card : nearest;
    }, null);

    if (nearestCard) {
      gsap.to(scroller, { scrollLeft: nearestCard.offsetLeft, duration: 0.65, ease: "power3.out", overwrite: true });
    }
  }

  useEffect(() => {
    function handleMouseMove(event: globalThis.MouseEvent) {
      const scroller = scrollerRef.current;
      const mouse = mouseRef.current;
      if (!scroller || !mouse.active) return;

      const distanceX = event.clientX - mouse.startX;
      const distanceY = event.clientY - mouse.startY;
      if (!mouse.dragging) {
        if (Math.abs(distanceX) < 6 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
        mouse.dragging = true;
        setIsDragging(true);
      }

      mouse.lastX = event.clientX;
      event.preventDefault();
      if (mouseFrameRef.current !== null) return;
      mouseFrameRef.current = window.requestAnimationFrame(() => {
        scroller.scrollLeft = mouse.startScrollLeft - (mouse.lastX - mouse.startX);
        mouseFrameRef.current = null;
      });
    }

    function handleMouseUp() {
      if (!mouseRef.current.active) return;
      finishMouseDrag();
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (mouseFrameRef.current !== null) window.cancelAnimationFrame(mouseFrameRef.current);
    };
  }, []);

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const scroller = event.currentTarget;
    gsap.killTweensOf(scroller);
    mouseRef.current = {
      active: true,
      dragging: false,
      suppressClick: false,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
      lastX: event.clientX,
    };
    event.preventDefault();
  }

  function preventClickAfterDrag(event: MouseEvent<HTMLDivElement>) {
    if (pointerRef.current.suppressClick || mouseRef.current.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      pointerRef.current.suppressClick = false;
      mouseRef.current.suppressClick = false;
    }
  }

  return (
    <>
      <div
        ref={scrollerRef}
        className={`hidden touch-pan-y gap-8 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        } ${isDragging ? "snap-none" : ""} ${className}`}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={stopDragging}
        onPointerCancelCapture={stopDragging}
        onMouseDownCapture={handleMouseDown}
        onClickCapture={preventClickAfterDrag}
      >
        {children}
      </div>
      <div className="mt-10 flex flex-col gap-10 md:hidden">{children}</div>
    </>
  );
}
