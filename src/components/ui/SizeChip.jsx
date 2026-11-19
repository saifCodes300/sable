export function SizeChip({
  label,
  selected = false,
  disabled = false,
  onClick,
  compact = false,
  className = '',
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-none font-mono uppercase tracking-btn transition-colors duration-150 border ${
        compact ? 'min-w-[34px] h-8 px-2 text-[11px]' : 'min-w-[48px] h-11 px-3 text-xs'
      } ${
        disabled
          ? 'border-sable-border/70 bg-sable-card-beige/60 text-sable-muted/60 line-through cursor-not-allowed'
          : selected
            ? 'border-sable-black bg-sable-black text-sable-white cursor-pointer'
            : 'border-sable-border bg-sable-white text-sable-black hover:border-sable-black cursor-pointer'
      } ${className}`}
    >
      {label}
    </button>
  );
}
