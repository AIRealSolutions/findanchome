export default function LanternLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow */}
      <circle cx="32" cy="32" r="28" fill="#fbbf24" opacity="0.2" />
      <circle cx="32" cy="32" r="20" fill="#fbbf24" opacity="0.3" />

      {/* Lantern hanger hook */}
      <path d="M 30 4 Q 30 8 32 8 Q 34 8 34 4" stroke="#1e3a8a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Lantern frame - top */}
      <path d="M 16 10 L 48 10 L 48 14 L 16 14 Z" fill="#1e3a8a" />

      {/* Lantern frame - sides */}
      <path d="M 14 14 L 16 14 L 16 48 L 14 50 Z" fill="#1e3a8a" />
      <path d="M 50 14 L 48 14 L 48 48 L 50 50 Z" fill="#1e3a8a" />

      {/* Lantern frame - bottom */}
      <path d="M 16 48 L 48 48 L 50 50 L 14 50 Z" fill="#1e3a8a" />

      {/* Glass - bright center */}
      <rect x="18" y="16" width="28" height="30" rx="2" fill="#fbbf24" opacity="0.9" />

      {/* Glass shine effect */}
      <rect x="20" y="18" width="24" height="8" rx="1" fill="#fef3c7" opacity="0.8" />

      {/* Window panes divider */}
      <line x1="32" y1="16" x2="32" y2="46" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6" />
      <line x1="18" y1="31" x2="46" y2="31" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6" />

      {/* Inner glow light */}
      <circle cx="32" cy="31" r="10" fill="#fbbf24" opacity="0.6" />
      <circle cx="32" cy="31" r="6" fill="#fef3c7" opacity="0.8" />

      {/* Reflection highlights */}
      <circle cx="28" cy="25" r="2" fill="white" opacity="0.7" />
      <circle cx="38" cy="28" r="1.5" fill="white" opacity="0.5" />
    </svg>
  );
}
