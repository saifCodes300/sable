import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SableSeal } from '../ui/SableSeal';
import { ProductImage } from '../ui/ProductImage';

export function Gallery({ images = [], productName, colorName, colorHex }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(null);

  useEffect(() => {
    setActiveIdx(0);
  }, [colorName]);

  const safeImages = images.length > 0 ? images : [''];
  const currentImg = safeImages[activeIdx] || safeImages[0];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) handlePrev();
      else handleNext();
    }
    touchStartX.current = null;
  };

  return (
    <div className="space-y-3.5">
      {/* Main Image Frame */}
      <div
        className="relative aspect-[4/5] bg-sable-card-beige border border-sable-border overflow-hidden select-none lg:cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: zoomed ? 'scale(1.65)' : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        >
          <ProductImage
            src={currentImg}
            alt={`${productName} — ${colorName} view ${activeIdx + 1}`}
            label={`${productName} · ${colorName}`}
            colorHex={colorHex}
            eager
          />
        </div>

        {/* Circular "S" Monogram Badge top-right */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <SableSeal size={56} />
        </div>

        {/* Mobile / quick arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-sable-white/90 border border-sable-border flex items-center justify-center text-sable-black cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-sable-white/90 border border-sable-border flex items-center justify-center text-sable-black cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Mobile dots */}
        <div className="lg:hidden absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === activeIdx ? 'bg-sable-black' : 'bg-sable-white/80 border border-sable-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Editorial Thumbnails Reel */}
      <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
        {safeImages.map((img, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={`${colorName}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Select editorial view ${idx + 1}`}
              aria-current={isSelected ? 'true' : undefined}
              className={`aspect-[3/4] overflow-hidden border transition-all duration-150 cursor-pointer bg-sable-card-beige relative group ${
                isSelected
                  ? 'border-sable-black ring-1 ring-sable-black shadow-sm'
                  : 'border-sable-border hover:border-sable-brown/60 opacity-80 hover:opacity-100'
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                label={`View ${idx + 1}`}
                colorHex={colorHex}
              />
              <span className="sr-only">View {idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
