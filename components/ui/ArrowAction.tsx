import { ArrowIcon } from "@/components/ui/ArrowIcon";

type ArrowActionProps = {
  label: React.ReactNode;
  direction?: "left" | "right";
  size?: "sm" | "md";
  className?: string;
};

export function ArrowAction({ label, direction = "right", size = "sm", className = "" }: ArrowActionProps) {
  const labelClassName =
    "hero-discover-label border-b border-transparent leading-none transition-colors duration-300 motion-reduce:transition-none";
  const arrowSizeClass = size === "md" ? "arrow-circle-button--md" : "arrow-circle-button--sm";
  const iconSizeClass = size === "md" ? "h-[56%] w-[56%]" : "h-[58%] w-[58%]";

  return (
    <span className={`hero-discover-action inline-flex items-center gap-1 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <span className={`arrow-circle-button ${arrowSizeClass} hero-discover-button relative flex items-center justify-center text-white`} aria-hidden="true">
        <svg className="pointer-events-none absolute inset-[-2px] h-[calc(100%+4px)] w-[calc(100%+4px)] -rotate-90" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="white" strokeOpacity="0.7" strokeWidth="1" />
          <circle className="hero-discover-fill" cx="28" cy="28" r="26" stroke="var(--color-accent-progress)" strokeWidth="1.5" strokeDasharray="163.36" strokeDashoffset="163.36" strokeLinecap="round" />
        </svg>
        <ArrowIcon direction={direction} className={`relative ${iconSizeClass}`} />
      </span>
    </span>
  );
}
