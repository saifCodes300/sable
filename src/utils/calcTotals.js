const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 200;
const STANDARD_SHIPPING_FEE = 9;
const EXPRESS_SHIPPING_FEE = 18;

const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Single source of truth for order totals across Bag, Checkout, and Order Confirmation.
 * All monetary amounts are in base USD and converted at render time via formatCurrency.
 */
export function calcTotals({ items = [], promo = null, shippingMethod = 'none' }) {
  const subtotal = round2(
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
  );

  let discount = 0;
  if (promo && promo.type === 'percent' && promo.value > 0) {
    discount = round2(subtotal * (promo.value / 100));
  }

  const discountedSubtotal = round2(Math.max(0, subtotal - discount));
  const qualifiesForFreeStandard =
    subtotal >= FREE_SHIPPING_THRESHOLD || promo?.type === 'shipping';

  const standardShippingCost = qualifiesForFreeStandard ? 0 : STANDARD_SHIPPING_FEE;
  const expressShippingCost = EXPRESS_SHIPPING_FEE;

  let shipping = 0;
  let shippingCalculated = false;

  if (shippingMethod === 'standard') {
    shipping = standardShippingCost;
    shippingCalculated = true;
  } else if (shippingMethod === 'express') {
    shipping = expressShippingCost;
    shippingCalculated = true;
  }

  const tax = round2(discountedSubtotal * TAX_RATE);
  const total = round2(discountedSubtotal + shipping + tax);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  return {
    subtotal,
    discount,
    discountedSubtotal,
    shipping,
    shippingCalculated,
    standardShippingCost,
    expressShippingCost,
    qualifiesForFreeStandard,
    amountUntilFreeShipping: round2(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)),
    tax,
    taxRate: TAX_RATE,
    total,
    itemCount,
  };
}
