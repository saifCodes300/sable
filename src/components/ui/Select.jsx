import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder,
    className = '',
    containerClassName = '',
    id,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block font-mono text-[11px] uppercase tracking-btn text-sable-black mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={`w-full h-12 pl-3.5 pr-10 bg-sable-white border rounded-none text-sm text-sable-black appearance-none transition-colors duration-150 focus:outline-none focus:border-sable-black focus:ring-1 focus:ring-sable-black cursor-pointer ${
            error ? 'border-sable-pink-text' : 'border-sable-border'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-sable-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-sable-pink-text">
          {error}
        </p>
      )}
    </div>
  );
});
