import { Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useUiStore } from '../../store/uiStore';
import { getTranslation } from '../../data/i18n';
import { PromoInput } from './PromoInput';
import { Button } from '../ui/Button';

export function OrderSummary({
  totals,
  promo,
  onApplyPromo,
  onRemovePromo,
  onProceed,
}) {
  const { currency, language } = useUiStore();
  const t = getTranslation(language);

  return (
    <div className="bg-sable-card-beige border border-sable-border p-6 space-y-5 sticky top-24">
      <p className="font-mono text-xs uppercase tracking-btn text-sable-black font-medium">
        {t.bag.orderSummary}
      </p>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-sable-muted">{t.bag.subtotal}</span>
          <span className="font-mono text-sable-black">
            {formatCurrency(totals.subtotal, currency)}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className="flex items-center justify-between text-sable-brown">
            <span>Discount ({promo?.code})</span>
            <span className="font-mono">−{formatCurrency(totals.discount, currency)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sable-muted">{t.bag.shipping}</span>
          <span className="font-mono text-xs text-sable-muted">
            {promo?.type === 'shipping' ? 'Free (FREESHIP)' : t.bag.calculatedAtCheckout}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sable-muted">{t.bag.estimatedTax}</span>
          <span className="font-mono text-sable-black">
            {formatCurrency(totals.tax, currency)}
          </span>
        </div>
      </div>

      <div className="border-t border-sable-border pt-4 flex items-center justify-between">
        <span className="font-medium text-sable-black">{t.bag.total}</span>
        <span className="font-mono text-lg font-semibold text-sable-black">
          {formatCurrency(totals.total, currency)}
        </span>
      </div>

      <div className="pt-1">
        <PromoInput
          appliedPromo={promo}
          onApply={onApplyPromo}
          onRemove={onRemovePromo}
        />
      </div>

      <Button fullWidth size="lg" onClick={onProceed}>
        {t.buttons.proceedToCheckout}
      </Button>

      <div className="pt-2 space-y-2 text-xs text-sable-muted">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-sable-brown shrink-0" />
          <span>Free returns within 30 days</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-sable-brown shrink-0" />
          <span>Secure checkout, encrypted end to end</span>
        </div>
      </div>
    </div>
  );
}
