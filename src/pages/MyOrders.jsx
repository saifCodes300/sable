import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Package } from 'lucide-react';
import { getOrders } from '../api/orders';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductImage } from '../components/ui/ProductImage';

const STATUS_BADGE_MAP = {
  Processing: 'neutral',
  Shipped: 'info',
  Delivered: 'success',
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useUiStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrders(user?.id)
      .then((res) => {
        if (active) {
          setOrders(res.data);
          if (res.data[0]) setExpandedId(res.data[0].id);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <>
      <Helmet>
        <title>My Orders — SABLE</title>
      </Helmet>

      <div className="bg-sable-beige border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Account', to: '/account' },
              { label: 'Orders' },
            ]}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl text-sable-black">My Orders</h1>
            <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-btn">
              <Link to="/account" className="text-sable-muted hover:text-sable-black pb-1">
                Profile
              </Link>
              <Link to="/orders" className="text-sable-black border-b border-sable-black pb-1">
                Orders
              </Link>
              <Link to="/wishlist" className="text-sable-muted hover:text-sable-black pb-1">
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            eyebrow="NO ORDERS YET"
            title="Your order archive is empty"
            description="When you place an order, you can track its courier progress and review receipts here."
            actionLabel="EXPLORE SHOP"
            onAction={() => navigate('/clothing')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isOpen = expandedId === order.id;
              return (
                <div key={order.id} className="border border-sable-border bg-sable-white">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="w-full p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-sable-card-beige/40 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                          Order
                        </p>
                        <p className="font-mono text-sm font-medium text-sable-black mt-0.5">
                          {order.id}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                          Placed
                        </p>
                        <p className="text-sm text-sable-black mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                          Total
                        </p>
                        <p className="font-mono text-sm text-sable-black mt-0.5">
                          {formatCurrency(order.totals?.total || 0, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={STATUS_BADGE_MAP[order.status] || 'neutral'}>
                        {order.status}
                      </Badge>
                      <ChevronDown
                        className={`w-4 h-4 text-sable-muted transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-sable-black' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-sable-border bg-sable-card-beige/30 space-y-5">
                      <div className="divide-y divide-sable-border">
                        {order.items.map((item, idx) => (
                          <div
                            key={`${item.productId}-${idx}`}
                            className="py-3.5 first:pt-0 flex items-center gap-4"
                          >
                            <Link
                              to={`/product/${item.slug}`}
                              className="w-14 h-16 border border-sable-border shrink-0 overflow-hidden bg-sable-white"
                            >
                              <ProductImage src={item.image} alt={item.name} label={item.name} />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${item.slug}`}
                                className="font-serif text-sm sm:text-base text-sable-black hover:text-sable-brown truncate block"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-sable-muted mt-0.5">
                                {item.color} · Size {item.size} · Qty {item.quantity}
                              </p>
                            </div>
                            <span className="font-mono text-xs sm:text-sm text-sable-black shrink-0">
                              {formatCurrency(item.price * item.quantity, currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-sable-border text-xs">
                        <div>
                          <p className="font-mono uppercase tracking-btn text-sable-muted mb-1.5">
                            Delivery Address
                          </p>
                          <p className="text-sable-black">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                          </p>
                          <p className="text-sable-muted">
                            {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state} {order.shippingAddress.zip}
                          </p>
                          <p className="text-sable-muted mt-1">
                            Estimated delivery: {order.estimatedDelivery}
                          </p>
                        </div>

                        <div className="space-y-1.5 sm:text-right">
                          <p className="font-mono uppercase tracking-btn text-sable-muted mb-1.5">
                            Payment &amp; Totals
                          </p>
                          <p className="text-sable-muted">
                            {order.paymentMethod === 'cod' || order.paymentSummary?.brand === 'Cash on Delivery'
                              ? 'Cash on Delivery (Pay upon delivery)'
                              : `${order.paymentSummary?.brand || 'Card'}${
                                  order.paymentSummary?.last4 ? ` ending in •••• ${order.paymentSummary.last4}` : ''
                                }`}
                          </p>
                          <p className="text-sable-muted">
                            Shipping:{' '}
                            {order.totals?.shipping === 0
                              ? 'Free'
                              : formatCurrency(order.totals?.shipping || 0, currency)}
                          </p>
                          <p className="font-mono text-sm text-sable-black font-medium pt-1">
                            Total: {formatCurrency(order.totals?.total || 0, currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
