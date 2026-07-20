export default function LanternLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inner glow - golden light */}
      <ellipse cx="32" cy="35" rx="12" ry="14" fill="#fbbf24" opacity="0.3" />
      <ellipse cx="32" cy="35" rx="9" ry="11" fill="#fbbf24" opacity="0.5" />
      <ellipse cx="32" cy="35" rx="6" ry="8" fill="#fbbf24" opacity="0.7" />

      {/* Top handle - white arc */}
      <path d="M 22 8 Q 22 2 32 2 Q 42 2 42 8" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Top ring/frame - white */}
      <ellipse cx="32" cy="10" rx="16" ry="4" fill="none" stroke="white" strokeWidth="2" />

      {/* Left glass side - oval white line */}
      <path d="M 18 10 Q 14 16 14 35 Q 14 50 18 54" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Right glass side - oval white line */}
      <path d="M 46 10 Q 50 16 50 35 Q 50 50 46 54" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Bottom frame - white */}
      <ellipse cx="32" cy="54" rx="16" ry="4" fill="none" stroke="white" strokeWidth="2" />

      {/* Bottom base extension - white */}
      <rect x="28" y="54" width="8" height="6" rx="1" fill="none" stroke="white" strokeWidth="1.8" />

      {/* Vertical center line - white semi-transparent */}
      <line x1="32" y1="10" x2="32" y2="54" stroke="white" strokeWidth="1" opacity="0.5" />

      {/* Glass pane divisions - horizontal white lines */}
      <path d="M 18 25 Q 25 24 32 24 Q 39 24 46 25" stroke="white" strokeWidth="1" opacity="0.6" />
      <path d="M 17 35 Q 24 34 32 34 Q 40 34 47 35" stroke="white" strokeWidth="1" opacity="0.6" />
      <path d="M 18 45 Q 25 46 32 46 Q 39 46 46 45" stroke="white" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
