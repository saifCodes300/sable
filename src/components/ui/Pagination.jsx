import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page = 1, totalPages = 1, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="w-10 h-10 border border-sable-border flex items-center justify-center text-sable-black hover:border-sable-black disabled:opacity-40 disabled:hover:border-sable-border transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onPageChange(num)}
          aria-current={num === page ? 'page' : undefined}
          className={`w-10 h-10 border font-mono text-xs transition-colors cursor-pointer ${
            num === page
              ? 'border-sable-black bg-sable-black text-sable-white'
              : 'border-sable-border bg-sable-white text-sable-black hover:border-sable-black'
          }`}
        >
          {String(num).padStart(2, '0')}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="w-10 h-10 border border-sable-border flex items-center justify-center text-sable-black hover:border-sable-black disabled:opacity-40 disabled:hover:border-sable-border transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
