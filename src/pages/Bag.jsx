import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { getTranslation } from '../data/i18n';
import { calcTotals } from '../utils/calcTotals';
import { getFeatured, getRelated } from '../api/products';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { CartItem } from '../components/cart/CartItem';
import { OrderSummary } from '../components/cart/OrderSummary';
import { ProductGrid } from '../components/product/ProductGrid';

export default function Bag() {
  const navigate = useNavigate();
  const { items, promo, updateQuantity, removeItem, restoreItem, applyPromo, removePromo } =
    useCartStore();
  const { language } = useUiStore();
  const t = getTranslation(language);

  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const totals = calcTotals({ items, promo, shippingMethod: 'none' });
  const firstProductId = items[0]?.productId;

  useEffect(() => {
    let active = true;
    setRecLoading(true);
    const req = firstProductId ? getRelated(firstProductId, 4) : getFeatured(4);
    req
      .then((res) => {
        if (active) setRecommendations(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setRecLoading(false);
      });
    return () => {
      active = false;
    };
  }, [firstProductId]);

  const handleRemoveWithUndo = (item) => {
    const idx = items.findIndex((i) => i.key === item.key);
    removeItem(item.key);

    toast(
      (toastObj) => (
        <div className="flex items-center gap-3 text-xs">
          <span>Removed {item.name}.</span>
          <button
            type="button"
            onClick={() => {
              restoreItem(item, idx);
              toast.dismiss(toastObj.id);
              toast.success('Restored to bag.');
            }}
            className="font-mono uppercase tracking-btn text-sable-brown underline cursor-pointer"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <>
      <Helmet>
        <title>Your Bag — SABLE</title>
      </Helmet>

      {/* Beige Header Band */}
      <div className="bg-sable-beige border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-sable-black">
              {t.bag.title}
            </h1>
            <span className="text-sm text-sable-muted font-mono">
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            eyebrow="YOUR BAG IS EMPTY"
            title="Begin curating your wardrobe"
            description="Explore Italian tailoring, calfskin footwear, and small-batch accessories."
            actionLabel="EXPLORE CLOTHING"
            onAction={() => navigate('/clothing')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.key}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={handleRemoveWithUndo}
                />
              ))}

              <div className="pt-4">
                <Link
                  to="/clothing"
                  className="inline-flex items-center gap-2 text-sm text-sable-brown hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.buttons.continueShopping}
                </Link>
              </div>
            </div>

            {/* Right: Sticky Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <OrderSummary
                totals={totals}
                promo={promo}
                onApplyPromo={applyPromo}
                onRemovePromo={removePromo}
                onProceed={() => navigate('/checkout')}
              />
            </div>
          </div>
        )}

        {/* Complete The Look */}
        <section className="mt-20 pt-14 border-t border-sable-border">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
              {t.bag.completeTheLook}
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-sable-black">
              {t.bag.youMightAlsoLike}
            </h2>
          </div>
          <ProductGrid products={recommendations} loading={recLoading} skeletonCount={4} />
        </section>
      </div>
    </>
  );
}
