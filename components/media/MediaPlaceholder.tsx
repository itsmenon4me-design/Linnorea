type MediaPlaceholderProps = {
  className?: string;
};

export function MediaPlaceholder({ className = "" }: MediaPlaceholderProps) {
  return (
    <div className={`flex items-center justify-center bg-[var(--color-bg-elevated)] text-white/35 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="12" r="2" fill="currentColor" />
        <path d="m7 23 6-6 4 4 3-3 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
