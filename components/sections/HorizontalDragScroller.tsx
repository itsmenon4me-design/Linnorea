"use client";

import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type HorizontalDragScrollerProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalDragScroller({ children, className = "" }: HorizontalDragScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, dragging: false, suppressClick: false, startX: 0, startY: 0, startScrollLeft: 0 });

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    pointerRef.current = {
      active: true,
      dragging: false,
      suppressClick: false,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    const scroller = scrollerRef.current;
    const pointer = pointerRef.current;
    if (!scroller || !pointer.active) return;

    const distance = event.clientX - pointer.startX;
    if (!pointer.dragging) {
      if (Math.abs(distance) < 8) return;
      if (Math.abs(distance) <= Math.abs(event.clientY - pointer.startY)) return;
      pointer.dragging = true;
    }

    event.preventDefault();
    scroller.scrollLeft = pointer.startScrollLeft - distance;
  }

  function stopDragging() {
    const wasDragging = pointerRef.current.dragging;
    pointerRef.current.active = false;
    pointerRef.current.suppressClick = wasDragging;
    if (wasDragging) {
      window.setTimeout(() => {
        pointerRef.current.dragging = false;
        pointerRef.current.suppressClick = false;
      }, 0);
    } else {
      pointerRef.current.dragging = false;
    }
  }

  function preventClickAfterDrag(event: MouseEvent<HTMLDivElement>) {
    if (pointerRef.current.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    pointerRef.current = {
      active: true,
      dragging: false,
      suppressClick: false,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
    };
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    const pointer = pointerRef.current;
    if (!scroller || !pointer.active) return;

    const distance = event.clientX - pointer.startX;
    if (!pointer.dragging) {
      if (Math.abs(distance) < 8 || Math.abs(distance) <= Math.abs(event.clientY - pointer.startY)) return;
      pointer.dragging = true;
    }

    event.preventDefault();
    scroller.scrollLeft = pointer.startScrollLeft - distance;
  }

  return (
    <div
      ref={scrollerRef}
      className={`flex touch-pan-y gap-8 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onClickCapture={preventClickAfterDrag}
    >
      {children}
    </div>
  );
}
