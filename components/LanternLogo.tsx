export default function LanternLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lantern post/hanger */}
      <rect x="22" y="2" width="4" height="8" fill="#1e3a8a" />

      {/* Lantern top frame */}
      <rect x="10" y="10" width="28" height="3" rx="1" fill="#1e3a8a" />

      {/* Lantern sides */}
      <rect x="10" y="13" width="3" height="20" rx="1" fill="#1e3a8a" />
      <rect x="35" y="13" width="3" height="20" rx="1" fill="#1e3a8a" />

      {/* Lantern glass panes */}
      <rect x="13" y="13" width="5" height="20" rx="0.5" fill="#0ea5e9" opacity="0.3" />
      <rect x="20" y="13" width="8" height="20" rx="0.5" fill="#0ea5e9" opacity="0.2" />
      <rect x="30" y="13" width="5" height="20" rx="0.5" fill="#0ea5e9" opacity="0.3" />

      {/* Glass pane lines */}
      <line x1="13" y1="18" x2="18" y2="18" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="13" y1="23" x2="18" y2="23" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="13" y1="28" x2="18" y2="28" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />

      <line x1="20" y1="16" x2="28" y2="16" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="20" y1="20" x2="28" y2="20" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="20" y1="24" x2="28" y2="24" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="20" y1="28" x2="28" y2="28" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />

      <line x1="30" y1="18" x2="35" y2="18" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="30" y1="23" x2="35" y2="23" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />
      <line x1="30" y1="28" x2="35" y2="28" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" />

      {/* Lantern bottom */}
      <rect x="10" y="33" width="28" height="3" rx="1" fill="#1e3a8a" />

      {/* Light glow effect */}
      <circle cx="24" cy="24" r="12" fill="#fbbf24" opacity="0.15" />
      <circle cx="24" cy="24" r="8" fill="#fbbf24" opacity="0.25" />

      {/* Inner light */}
      <circle cx="24" cy="24" r="4" fill="#fbbf24" opacity="0.8" />
    </svg>
  );
}
