type ArrowIconProps = {
  direction?: "left" | "right";
  className?: string;
};

export function ArrowIcon({ direction = "right", className = "" }: ArrowIconProps) {
  const rotation = direction === "left" ? 180 : 0;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M65,50 L35,10 Q50,50 35,90 Z" />
    </svg>
  );
}
