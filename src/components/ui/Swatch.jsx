export function Swatch({
  color,
  selected = false,
  onClick,
  size = 'md',
  className = '',
}) {
  const dimensions = size === 'sm' ? 'w-3.5 h-3.5' : 'w-6 h-6';
  const isLight =
    color.hex?.toUpperCase() === '#EFE9DC' ||
    color.hex?.toUpperCase() === '#FFFFFF' ||
    color.hex?.toUpperCase() === '#D2C5B4';

  return (
    <button
      type="button"
      onClick={onClick}
      title={color.name}
      aria-label={`Color ${color.name}`}
      aria-pressed={selected}
      className={`rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center ${dimensions} ${
        selected
          ? 'ring-1 ring-sable-black ring-offset-2 ring-offset-sable-white'
          : 'hover:ring-1 hover:ring-sable-muted hover:ring-offset-1'
      } ${isLight ? 'border border-sable-border' : ''} ${className}`}
      style={{ backgroundColor: color.hex }}
    />
  );
}
