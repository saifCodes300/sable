import { Checkbox } from '../ui/Checkbox';
import { SizeChip } from '../ui/SizeChip';
import { Swatch } from '../ui/Swatch';
import { formatWholeCurrency } from '../../utils/formatCurrency';
import { useUiStore } from '../../store/uiStore';

const ALL_COLORS = [
  { name: 'Ink', hex: '#1C222B' },
  { name: 'Taupe', hex: '#8C7E70' },
  { name: 'Sand', hex: '#D2C5B4' },
  { name: 'Black', hex: '#111111' },
  { name: 'Cream', hex: '#EFE9DC' },
  { name: 'Olive', hex: '#4D5343' },
];

export const MAX_CATALOG_PRICE = 1400;

export function FilterSidebar({
  subcategories = [],
  availableSizes = ['XS', 'S', 'M', 'L', 'XL'],
  filters,
  onToggleSubcategory,
  onToggleSize,
  onToggleColor,
  onPriceChange,
  onInStockChange,
  onClearAll,
  hasActiveFilters,
}) {
  const { currency } = useUiStore();
  const minVal = filters.minPrice ?? 0;
  const maxVal = filters.maxPrice ?? MAX_CATALOG_PRICE;

  const minPercent = (minVal / MAX_CATALOG_PRICE) * 100;
  const maxPercent = (maxVal / MAX_CATALOG_PRICE) * 100;

  return (
    <aside aria-label="Product filters" className="space-y-7">
      <div className="flex items-center justify-between pb-3 border-b border-sable-border">
        <span className="font-mono text-xs uppercase tracking-btn text-sable-black font-medium">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="font-mono text-[11px] uppercase tracking-btn text-sable-brown hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-sable-border">
          <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">
            Category
          </h3>
          <div className="flex flex-col gap-2.5">
            {subcategories.map((sub) => (
              <Checkbox
                key={sub}
                label={sub}
                checked={filters.subcategories.includes(sub)}
                onChange={() => onToggleSubcategory(sub)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div className="space-y-3 pb-6 border-b border-sable-border">
        <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">Size</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <SizeChip
              key={size}
              label={size}
              compact
              selected={filters.sizes.includes(size)}
              onClick={() => onToggleSize(size)}
            />
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3 pb-6 border-b border-sable-border">
        <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">Color</h3>
        <div className="flex flex-wrap gap-3 pt-1">
          {ALL_COLORS.map((color) => {
            const isSelected = filters.colors.includes(color.name);
            return (
              <div key={color.name} className="flex flex-col items-center gap-1">
                <Swatch
                  color={color}
                  selected={isSelected}
                  onClick={() => onToggleColor(color.name)}
                />
                <span className="text-[10px] text-sable-muted">{color.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Dual Slider */}
      <div className="space-y-4 pb-6 border-b border-sable-border">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">Price</h3>
          <span className="font-mono text-xs text-sable-black">
            {formatWholeCurrency(minVal, currency)} — {formatWholeCurrency(maxVal, currency)}
          </span>
        </div>

        <div className="relative h-6 flex items-center">
          <div className="w-full h-[2px] bg-sable-border relative">
            <div
              className="absolute h-full bg-sable-black"
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={MAX_CATALOG_PRICE}
            step={25}
            value={minVal}
            aria-label="Minimum price"
            onChange={(e) => {
              const nextMin = Math.min(Number(e.target.value), maxVal - 50);
              onPriceChange(nextMin, maxVal);
            }}
            className="sable-range absolute inset-0 w-full z-10"
          />
          <input
            type="range"
            min={0}
            max={MAX_CATALOG_PRICE}
            step={25}
            value={maxVal}
            aria-label="Maximum price"
            onChange={(e) => {
              const nextMax = Math.max(Number(e.target.value), minVal + 50);
              onPriceChange(minVal, nextMax);
            }}
            className="sable-range absolute inset-0 w-full z-20"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <Checkbox
          label="In stock only"
          checked={Boolean(filters.inStock)}
          onChange={(e) => onInStockChange(e.target.checked)}
        />
      </div>
    </aside>
  );
}
