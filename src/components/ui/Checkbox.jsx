import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

export const Checkbox = forwardRef(function Checkbox(
  { label, checked, onChange, className = '', id, ...props },
  ref
) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <span className="w-4 h-4 border border-sable-border bg-sable-white transition-colors duration-150 peer-checked:bg-sable-black peer-checked:border-sable-black peer-focus-visible:ring-1 peer-focus-visible:ring-sable-black group-hover:border-sable-black" />
        <Check
          className="w-3 h-3 text-sable-white absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
      {label && <span className="text-sm text-sable-black">{label}</span>}
    </label>
  );
});
