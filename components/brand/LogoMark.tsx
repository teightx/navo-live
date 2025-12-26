export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="14" width="10" height="4" rx="1" className="fill-blue" />
      <rect x="18" y="14" width="10" height="4" rx="1" className="fill-blue-muted" />
      <rect x="12" y="6" width="8" height="20" rx="1" className="fill-blue-soft" />
      <rect x="14" y="4" width="4" height="6" rx="1" className="fill-blue" />
    </svg>
  );
}

