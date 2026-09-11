"use client";

import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type HorizontalDragScrollerProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalDragScroller({ children, className = "" }: HorizontalDragScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, dragging: false, suppressClick: false, startX: 0, startY: 0, startScrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

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

    const distanceX = event.clientX - pointer.startX;
    const distanceY = event.clientY - pointer.startY;
    if (!pointer.dragging) {
      if (Math.abs(distanceX) < 8 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
      pointer.dragging = true;
      setIsDragging(true);
    }

    event.preventDefault();
    scroller.scrollLeft = pointer.startScrollLeft - distanceX;
  }

  function stopDragging(event?: PointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    const wasDragging = pointerRef.current.dragging;
    if (scroller && event && scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    pointerRef.current.active = false;
    pointerRef.current.suppressClick = wasDragging;
    pointerRef.current.dragging = false;
    setIsDragging(false);
  }

  useEffect(() => {
    const element = scrollerRef.current;
    if (element === null) return;
    const dragElement: HTMLDivElement = element;

    function handleMouseDown(event: globalThis.MouseEvent) {
      if (event.button !== 0) return;
      const bounds = dragElement.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return;
      }
      pointerRef.current = {
        active: true,
        dragging: false,
        suppressClick: false,
        startX: event.clientX,
        startY: event.clientY,
        startScrollLeft: dragElement.scrollLeft,
      };
    }

    function handleMouseMove(event: globalThis.MouseEvent) {
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
      dragElement.scrollLeft = pointer.startScrollLeft - distanceX;
    }

    function handleMouseUp() {
      const pointer = pointerRef.current;
      if (!pointer.active) return;
      pointer.active = false;
      pointer.suppressClick = pointer.dragging;
      pointer.dragging = false;
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

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
        } ${className}`}
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
