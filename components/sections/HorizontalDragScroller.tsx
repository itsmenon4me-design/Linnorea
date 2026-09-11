"use client";

import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useRef, useState } from "react";

type HorizontalDragScrollerProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalDragScroller({ children, className = "" }: HorizontalDragScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, dragging: false, suppressClick: false, startX: 0, startY: 0, startScrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
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
        scroller.scrollTo({ left: nearestCard.offsetLeft, behavior: "smooth" });
      }
    }
  }

  function preventClickAfterDrag(event: MouseEvent<HTMLDivElement>) {
    if (pointerRef.current.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      pointerRef.current.suppressClick = false;
    }
  }

  return (
    <>
      <div
        ref={scrollerRef}
        className={`hidden touch-pan-y gap-8 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        } ${isDragging ? "snap-none" : ""} ${className}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClickCapture={preventClickAfterDrag}
      >
        {children}
      </div>
      <div className="mt-10 flex flex-col gap-10 md:hidden">{children}</div>
    </>
  );
}
