import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { calcTotals } from '../../utils/calcTotals';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { Stepper } from '../ui/Stepper';
import { ProductImage } from '../ui/ProductImage';

export function MiniCartDrawer() {
  const navigate = useNavigate();
  const { miniCartOpen, setMiniCartOpen, currency } = useUiStore();
  const { items, promo, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    if (!miniCartOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setMiniCartOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [miniCartOpen, setMiniCartOpen]);

  if (!miniCartOpen) return null;

  const totals = calcTotals({ items, promo, shippingMethod: 'none' });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag drawer"
    >
      <div
        className="fixed inset-0 bg-sable-black/45"
        onClick={() => setMiniCartOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-sable-white h-full border-l border-sable-border flex flex-col z-10">
        <div className="px-6 py-5 border-b border-sable-border flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-btn text-sable-brown">
              ADDED TO BAG
            </p>
            <h2 className="font-serif text-xl text-sable-black">
              Your Bag ({totals.itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setMiniCartOpen(false)}
            aria-label="Close bag drawer"
            className="p-1.5 text-sable-muted hover:text-sable-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-3 bg-sable-card-beige border-b border-sable-border text-xs text-sable-black font-mono">
          {totals.qualifiesForFreeStandard ? (
            <span>✓ You qualify for complimentary standard shipping.</span>
          ) : (
            <span>
              Add {formatCurrency(totals.amountUntilFreeShipping, currency)} more for free shipping.
            </span>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-sable-border">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="w-8 h-8 text-sable-muted mb-3" strokeWidth={1.5} />
              <p className="font-serif text-lg text-sable-black">Your bag is empty</p>
              <p className="text-xs text-sable-muted mt-1">
                Explore the collection to add pieces.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="p-5 flex gap-4">
                <Link
                  to={`/product/${item.slug}`}
                  onClick={() => setMiniCartOpen(false)}
                  className="w-20 h-24 border border-sable-border shrink-0 overflow-hidden"
                >
                  <ProductImage src={item.image} alt={item.name} label={item.name} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setMiniCartOpen(false)}
                      className="font-serif text-sm font-medium text-sable-black hover:text-sable-brown truncate"
                    >
                      {item.name}
                    </Link>
                    <span className="font-mono text-xs text-sable-black shrink-0">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-sable-muted mt-1">
                    {item.color} · Size {item.size}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Stepper
                      size="sm"
                      value={item.quantity}
                      min={1}
                      max={item.maxStock || 20}
                      onChange={(qty) => updateQuantity(item.key, qty)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-xs text-sable-brown hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-sable-border bg-sable-card-beige space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-btn text-sable-muted">
                Subtotal
              </span>
              <span className="font-mono text-sm font-medium text-sable-black">
                {formatCurrency(totals.subtotal, currency)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setMiniCartOpen(false);
                  navigate('/bag');
                }}
              >
                VIEW BAG
              </Button>
              <Button
                onClick={() => {
                  setMiniCartOpen(false);
                  navigate('/checkout');
                }}
              >
                CHECKOUT
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
