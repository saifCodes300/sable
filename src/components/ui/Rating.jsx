import { Star } from 'lucide-react';

export function Rating({
  value = 5,
  count,
  interactive = false,
  onChange,
  size = 'sm',
  className = '',
}) {
  const starSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Rated ${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(value);
          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange?.(star)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
              >
                <Star
                  className={`${starSize} ${
                    filled
                      ? 'fill-sable-brown text-sable-brown'
                      : 'fill-transparent text-sable-border'
                  }`}
                />
              </button>
            );
          }

          return (
            <Star
              key={star}
              className={`${starSize} ${
                filled
                  ? 'fill-sable-brown text-sable-brown'
                  : 'fill-transparent text-sable-border'
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-sable-muted font-sans">
          {Number(value).toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
