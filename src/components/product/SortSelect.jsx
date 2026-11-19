import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export function SortSelect({ value = 'featured', onChange }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <label
        htmlFor="sable-sort-select"
        className="font-mono text-[11px] uppercase tracking-btn text-sable-muted hidden sm:inline"
      >
        Sort
      </label>
      <div className="relative">
        <select
          id="sable-sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 pl-3.5 pr-9 bg-sable-white border border-sable-border rounded-none text-xs font-mono text-sable-black appearance-none cursor-pointer focus:outline-none focus:border-sable-black"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-3.5 h-3.5 text-sable-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
