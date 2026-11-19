import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2 } from 'lucide-react';
import { getOrderById } from '../api/orders';
import { useUiStore } from '../store/uiStore';
import { formatCurrency } from '../utils/formatCurrency';
import { calcTotals } from '../utils/calcTotals';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SableSeal } from '../components/ui/SableSeal';
import { ProductImage } from '../components/ui/ProductImage';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useUiStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrderById(id)
      .then((res) => active && setOrder(res.data))
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <EmptyState
          eyebrow="ORDER NOT FOUND"
          title="We could not locate this order"
          description="Please check your order number or inspect your recent orders in your account."
          actionLabel="VIEW MY ORDERS"
          onAction={() => navigate('/orders')}
        />
      </div>
    );
  }

  const totals =
    order.totals ||
    calcTotals({
      items: order.items,
      promo: order.promo,
      shippingMethod: order.shippingMethod,
    });

  return (
    <div className="bg-sable-beige min-h-[80vh] py-12 sm:py-16">
      <Helmet>
        <title>Order {order.id} Confirmed — SABLE</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Card */}
        <div className="bg-sable-white border border-sable-border p-8 sm:p-10 text-center space-y-4">
          <div className="flex justify-center">
            <SableSeal size={60} />
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-btn text-sable-brown">
            <CheckCircle2 className="w-4 h-4" />
            Order Confirmed
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-sable-black">
            Thank you, {order.shippingAddress.firstName}
          </h1>
          <p className="text-sm text-sable-muted max-w-md mx-auto">
            A confirmation has been dispatched to{' '}
            <span className="text-sable-black font-medium">{order.contact.email}</span>.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="border border-sable-border bg-sable-card-beige p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                Order Number
              </p>
              <p className="font-mono text-sm font-medium text-sable-black mt-1">{order.id}</p>
            </div>
            <div className="border border-sable-border bg-sable-card-beige p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                Estimated Delivery
              </p>
              <p className="font-mono text-sm font-medium text-sable-black mt-1">
                {order.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-sable-white border border-sable-border p-6 sm:p-8 space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-btn text-sable-black pb-3 border-b border-sable-border">
            Items Ordered
          </h2>

          <div className="divide-y divide-sable-border">
            {order.items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="py-4 first:pt-0 flex items-center gap-4">
                <div className="w-16 h-20 border border-sable-border shrink-0 overflow-hidden bg-sable-card-beige">
                  <ProductImage src={item.image} alt={item.name} label={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base text-sable-black truncate">{item.name}</p>
                  <p className="text-xs text-sable-muted mt-0.5">
                    Color: {item.color} · Size: {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-mono text-sm text-sable-black shrink-0">
                  {formatCurrency(item.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-sable-border">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-btn text-sable-muted mb-2">
                  Shipping Address
                </p>
                <address className="not-italic text-sm text-sable-black space-y-0.5">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-sable-muted">{order.shippingAddress.address}</p>
                  <p className="text-sable-muted">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zip}
                  </p>
                  <p className="text-sable-muted">{order.shippingAddress.country}</p>
                  <p className="text-sable-muted pt-1">{order.shippingAddress.phone}</p>
                </address>
              </div>

              {/* Payment Method Badge */}
              <div className="p-3 bg-sable-card-beige border border-sable-border space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                  Payment Method
                </p>
                {order.paymentMethod === 'cod' || order.paymentSummary?.brand === 'Cash on Delivery' ? (
                  <div>
                    <p className="font-mono text-xs uppercase font-semibold text-sable-brown flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sable-brown" />
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-sable-muted mt-0.5">
                      Payable on courier delivery: {formatCurrency(totals.total, currency)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-mono text-xs uppercase font-semibold text-sable-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Online Payment · Verified
                    </p>
                    <p className="text-xs text-sable-muted mt-0.5">
                      {order.paymentSummary?.brand || 'Card'}{' '}
                      {order.paymentSummary?.last4 ? `ending in •••• ${order.paymentSummary.last4}` : ''}
                      {order.paymentSummary?.upiId ? `(${order.paymentSummary.upiId})` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-mono text-[11px] uppercase tracking-btn text-sable-muted mb-2">
                Summary
              </p>
              <div className="flex justify-between">
                <span className="text-sable-muted">Subtotal</span>
                <span className="font-mono">{formatCurrency(totals.subtotal, currency)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sable-brown">
                  <span>Discount</span>
                  <span className="font-mono">−{formatCurrency(totals.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sable-muted">Shipping</span>
                <span className="font-mono">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sable-muted">Estimated tax (8%)</span>
                <span className="font-mono">{formatCurrency(totals.tax, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sable-border font-medium">
                <span>Total</span>
                <span className="font-mono text-base">{formatCurrency(totals.total, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/clothing" className="w-full sm:w-auto">
            <Button fullWidth>CONTINUE SHOPPING</Button>
          </Link>
          <Link to="/orders" className="w-full sm:w-auto">
            <Button variant="secondary" fullWidth>
              VIEW MY ORDERS
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
