export default function LanternLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inner glow */}
      <circle cx="32" cy="32" r="14" fill="#fbbf24" opacity="0.4" />
      <circle cx="32" cy="32" r="10" fill="#fbbf24" opacity="0.6" />
      <circle cx="32" cy="32" r="6" fill="#fbbf24" opacity="0.8" />

      {/* Lantern hanger hook - white line */}
      <path d="M 28 4 Q 28 8 32 8 Q 36 8 36 4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Lantern frame - top - white line */}
      <rect x="14" y="10" width="36" height="4" rx="1" fill="none" stroke="white" strokeWidth="2.5" />

      {/* Lantern frame - sides - white line */}
      <line x1="14" y1="14" x2="14" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="14" x2="50" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Lantern frame - bottom - white line */}
      <rect x="14" y="48" width="36" height="4" rx="1" fill="none" stroke="white" strokeWidth="2.5" />

      {/* Glass panes divider - white line */}
      <line x1="32" y1="14" x2="32" y2="52" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="14" y1="32" x2="50" y2="32" stroke="white" strokeWidth="1.5" opacity="0.7" />

      {/* Corner accents */}
      <circle cx="14" cy="14" r="1.5" fill="white" opacity="0.6" />
      <circle cx="50" cy="14" r="1.5" fill="white" opacity="0.6" />
      <circle cx="14" cy="50" r="1.5" fill="white" opacity="0.6" />
      <circle cx="50" cy="50" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}
