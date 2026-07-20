export default function LanternLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inner glow - golden light */}
      <ellipse cx="32" cy="38" rx="10" ry="12" fill="#fbbf24" opacity="0.4" />
      <circle cx="32" cy="38" r="6" fill="#fbbf24" opacity="0.6" />

      {/* Top handle - white */}
      <path d="M 20 6 Q 20 2 32 2 Q 44 2 44 6" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Top ring/collar with decorative dots - white */}
      <ellipse cx="32" cy="8" rx="14" ry="3.5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="22" cy="8" r="1.2" fill="white" opacity="0.7" />
      <circle cx="28" cy="8" r="1.2" fill="white" opacity="0.7" />
      <circle cx="36" cy="8" r="1.2" fill="white" opacity="0.7" />
      <circle cx="42" cy="8" r="1.2" fill="white" opacity="0.7" />

      {/* Upper glass/globe - oval - white */}
      <path d="M 18 8 Q 14 14 14 28 Q 14 35 18 40" stroke="white" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d="M 46 8 Q 50 14 50 28 Q 50 35 46 40" stroke="white" strokeWidth="2.3" fill="none" strokeLinecap="round" />

      {/* Middle frame ring - white */}
      <ellipse cx="32" cy="40" rx="14" ry="3" fill="none" stroke="white" strokeWidth="2" />

      {/* Lower cage/frame structure - white */}
      <path d="M 18 40 Q 16 46 16 54" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 46 40 Q 48 46 48 54" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Cage vertical supports - white */}
      <line x1="24" y1="40" x2="22" y2="54" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="32" y1="40" x2="32" y2="54" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="40" y1="40" x2="42" y2="54" stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Cage horizontal rings - white */}
      <ellipse cx="32" cy="47" rx="12" ry="2.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="32" cy="52" rx="13" ry="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />

      {/* Base/platform - white */}
      <ellipse cx="32" cy="56" rx="14" ry="3.5" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 18 56 L 18 60 Q 18 62 20 62 L 44 62 Q 46 62 46 60 L 46 56" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Bottom platform - white */}
      <ellipse cx="32" cy="62" rx="14" ry="3" fill="none" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}
