import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    rightSlot,
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block font-mono text-[11px] uppercase tracking-btn text-sable-black mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full h-12 px-3.5 bg-sable-white border rounded-none text-sm text-sable-black placeholder:text-sable-muted transition-colors duration-150 focus:outline-none focus:border-sable-black focus:ring-1 focus:ring-sable-black disabled:bg-sable-card-beige disabled:text-sable-muted ${
            error ? 'border-sable-pink-text focus:border-sable-pink-text focus:ring-sable-pink-text' : 'border-sable-border'
          } ${rightSlot ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-sable-pink-text">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-sable-muted">{helperText}</p>
      )}
    </div>
  );
});
