export function ShippingMethodOption({
  id,
  name,
  title,
  description,
  priceLabel,
  selected,
  onSelect,
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 p-4 border transition-colors duration-150 cursor-pointer ${
        selected
          ? 'border-sable-black bg-sable-card-beige/60'
          : 'border-sable-border bg-sable-white hover:border-sable-muted'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
          <input
            id={id}
            type="radio"
            name={name}
            checked={selected}
            onChange={onSelect}
            className="peer sr-only"
          />
          <span className="w-4 h-4 rounded-full border border-sable-muted bg-sable-white peer-checked:border-sable-black" />
          <span className="w-2 h-2 rounded-full bg-sable-black absolute scale-0 peer-checked:scale-100 transition-transform" />
        </span>
        <div>
          <p className="text-sm font-medium text-sable-black">{title}</p>
          <p className="text-xs text-sable-muted mt-0.5">{description}</p>
        </div>
      </div>

      <span className="font-mono text-xs sm:text-sm font-medium text-sable-black shrink-0">
        {priceLabel}
      </span>
    </label>
  );
}
