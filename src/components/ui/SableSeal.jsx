/**
 * Circular "S" monogram seal: double-ring circle with italic serif "S"
 */
export function SableSeal({ size = 56, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SABLE Atelier Seal"
      role="img"
      className={`shrink-0 ${className}`}
    >
      <circle cx="32" cy="32" r="30.5" fill="#F6F1E8" stroke="#7A5230" strokeWidth="1" />
      <circle cx="32" cy="32" r="25.5" stroke="#7A5230" strokeWidth="0.75" strokeDasharray="1.5 1.5" />
      <circle cx="32" cy="32" r="23" stroke="#0A0A0A" strokeWidth="0.75" />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fill="#0A0A0A"
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: '28px',
        }}
      >
        S
      </text>
    </svg>
  );
}
