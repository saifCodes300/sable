import { useEffect, useState } from 'react';

/**
 * Renders product / editorial imagery with lazy loading and an onError fallback
 * to a styled beige architectural placeholder block so the UI never breaks.
 */
export function ProductImage({
  src,
  alt = 'SABLE item',
  label,
  colorHex,
  className = '',
  imgClassName = '',
  eager = false,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`w-full h-full bg-sable-beige flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-3 border border-sable-border/80 pointer-events-none" />
        {colorHex && (
          <span
            className="w-6 h-6 rounded-full border border-sable-border mb-3"
            style={{ backgroundColor: colorHex }}
            aria-hidden="true"
          />
        )}
        <span className="font-serif italic text-xl text-sable-brown/70">SABLE</span>
        <span className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mt-1.5 max-w-[160px] truncate">
          {label || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${imgClassName} ${className}`}
    />
  );
}
