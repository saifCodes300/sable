const VARIANTS = {
  neutral: 'bg-sable-card-beige text-sable-black border border-sable-border',
  dark: 'bg-sable-black text-sable-white border border-sable-black',
  brown: 'bg-sable-brown text-sable-white border border-sable-brown',
  pink: 'bg-sable-pink text-sable-pink-text border border-sable-pink',
  success: 'bg-[#EBF2EC] text-[#2A5A34] border border-[#CDE0D0]',
  info: 'bg-[#EEF1F5] text-[#2B4360] border border-[#D4DDE8]',
};

export function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none font-mono text-[10px] uppercase tracking-btn font-medium ${
        VARIANTS[variant] || VARIANTS.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
