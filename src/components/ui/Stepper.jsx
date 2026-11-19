import { Minus, Plus } from 'lucide-react';

export function Stepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  className = '',
  label = 'Quantity',
}) {
  const heightClass = size === 'sm' ? 'h-9' : 'h-12';
  const btnWidth = size === 'sm' ? 'w-8' : 'w-10';

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div
      className={`inline-flex items-center border border-sable-border bg-sable-white ${heightClass} ${className}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`${btnWidth} h-full flex items-center justify-center text-sable-black hover:bg-sable-card-beige disabled:text-sable-muted/50 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        className="w-10 text-center font-mono text-xs text-sable-black select-none"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`${btnWidth} h-full flex items-center justify-center text-sable-black hover:bg-sable-card-beige disabled:text-sable-muted/50 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
