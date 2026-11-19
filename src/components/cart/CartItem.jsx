import { Link } from 'react-router-dom';
import { Stepper } from '../ui/Stepper';
import { ProductImage } from '../ui/ProductImage';
import { formatCurrency } from '../../utils/formatCurrency';
import { useUiStore } from '../../store/uiStore';
import { getTranslation } from '../../data/i18n';

export function CartItem({ item, onQuantityChange, onRemove }) {
  const { currency, language } = useUiStore();
  const t = getTranslation(language);

  return (
    <div className="border border-sable-border bg-sable-white hover:bg-sable-card-beige/60 transition-colors duration-200 p-4 sm:p-5 flex gap-4 sm:gap-5">
      <Link
        to={`/product/${item.slug}`}
        className="w-24 sm:w-28 aspect-[3/4] border border-sable-border shrink-0 overflow-hidden bg-sable-card-beige"
      >
        <ProductImage src={item.image} alt={item.name} label={item.name} />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/product/${item.slug}`}
              className="font-serif font-semibold text-base sm:text-lg text-sable-black hover:text-sable-brown transition-colors block truncate"
            >
              {item.name}
            </Link>
            <p className="text-xs sm:text-sm text-sable-muted mt-1">
              Color: {item.color} · Size: {item.size}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="font-mono text-sm sm:text-base font-medium text-sable-black">
              {formatCurrency(item.price * item.quantity, currency)}
            </p>
            {item.quantity > 1 && (
              <p className="font-mono text-[11px] text-sable-muted mt-0.5">
                {formatCurrency(item.price, currency)} each
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Stepper
            size="sm"
            value={item.quantity}
            min={1}
            max={item.maxStock || 20}
            onChange={(qty) => onQuantityChange(item.key, qty)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="text-xs sm:text-sm text-sable-brown hover:underline transition-colors cursor-pointer"
          >
            {t.buttons.remove}
          </button>
        </div>
      </div>
    </div>
  );
}
