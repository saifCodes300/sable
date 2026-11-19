import { forwardRef, useId } from 'react';

export const Radio = forwardRef(function Radio(
  { label, checked, onChange, className = '', id, ...props },
  ref
) {
  const generatedId = useId();
  const radioId = id || generatedId;

  return (
    <label
      htmlFor={radioId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}
    >
      <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <span className="w-4 h-4 rounded-full border border-sable-muted bg-sable-white transition-colors duration-150 peer-checked:border-sable-black peer-focus-visible:ring-1 peer-focus-visible:ring-sable-black" />
        <span className="w-2 h-2 rounded-full bg-sable-black absolute scale-0 peer-checked:scale-100 transition-transform duration-150" />
      </span>
      {label && <span className="text-sm text-sable-black">{label}</span>}
    </label>
  );
});
