"use client";

type CarouselDotProps = {
  active: boolean;
  passed: boolean;
  progress?: number;
  reducedMotion?: boolean;
  resetKey?: string | number;
};

const RING_DIAMETER = 20.4;
const DOT_DIAMETER = 6.8;
const RING_RADIUS = 9.265;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TRACK_STROKE_WIDTH = 1.36;
const PROGRESS_STROKE_WIDTH = 1.87;

export function CarouselDot({ active, passed, progress = 0, reducedMotion = false, resetKey }: CarouselDotProps) {
  if (!active) {
    return <span className={`block rounded-full ${passed ? "bg-white" : "bg-white/35"}`} style={{ width: DOT_DIAMETER, height: DOT_DIAMETER }} />;
  }

  return (
    <span className="relative block" style={{ width: RING_DIAMETER, height: RING_DIAMETER }} aria-hidden="true">
      <svg key={resetKey} viewBox="0 0 20.4 20.4" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="10.2" cy="10.2" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={TRACK_STROKE_WIDTH} />
        <circle
          cx="10.2"
          cy="10.2"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-accent-progress)"
          strokeWidth={PROGRESS_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={reducedMotion ? 0 : RING_CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
    </span>
  );
}
