import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts } from '../api/products';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { formatWholeCurrency } from '../utils/formatCurrency';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { ProductImage } from '../components/ui/ProductImage';

function WishlistCard({ product, onMoveToBag, onRemove }) {
  const { currency } = useUiStore();
  const inStockSizes = product.sizes.filter((s) => s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(inStockSizes[0]?.label || '');
  const activeColor = product.colors[0];

  return (
    <div className="border border-sable-border bg-sable-white flex flex-col">
      <div className="relative aspect-[3/4] bg-sable-card-beige overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <ProductImage
            src={activeColor?.images[0]}
            alt={product.name}
            label={product.subcategory}
            colorHex={activeColor?.hex}
          />
        </Link>
        <button
          type="button"
          onClick={() => onRemove(product)}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-sable-white/90 border border-sable-border flex items-center justify-center text-sable-muted hover:text-sable-pink-text hover:border-sable-black cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
            {product.subcategory}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-base text-sable-black hover:text-sable-brown block mt-0.5 line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="font-mono text-xs text-sable-brown mt-1">
            {formatWholeCurrency(product.price, currency)}
          </p>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-sable-border">
          {inStockSizes.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {inStockSizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedSize(s.label)}
                  className={`min-w-[28px] h-7 px-1.5 border font-mono text-[10px] cursor-pointer ${
                    selectedSize === s.label
                      ? 'border-sable-black bg-sable-black text-sable-white'
                      : 'border-sable-border text-sable-black hover:border-sable-black'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <Button
            fullWidth
            size="sm"
            disabled={!selectedSize}
            onClick={() => onMoveToBag(product, selectedSize)}
          >
            {selectedSize ? 'MOVE TO BAG' : 'OUT OF STOCK'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { items: wishlistIds, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { setMiniCartOpen, triggerBagBump } = useUiStore();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const idsKey = wishlistIds.join(',');

  useEffect(() => {
    let active = true;
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProducts({ ids: wishlistIds, limit: 50 })
      .then((res) => {
        if (active) setProducts(res.data);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMoveToBag = (product, sizeLabel) => {
    const color = product.colors[0];
    const sizeObj = product.sizes.find((s) => s.label === sizeLabel);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: color.name,
      size: sizeLabel,
      quantity: 1,
      maxStock: sizeObj?.stock || 10,
      image: color.images[0],
    });
    removeItem(product.id);
    triggerBagBump();
    toast.success(`Moved ${product.name} to your bag.`);
    setMiniCartOpen(true);
  };

  const handleRemove = (product) => {
    removeItem(product.id);
    toast.success(`Removed ${product.name} from wishlist.`);
  };

  return (
    <>
      <Helmet>
        <title>Wishlist — SABLE</title>
      </Helmet>

      <div className="bg-sable-beige border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-sable-black">Saved Pieces</h1>
              <p className="text-sm text-sable-muted mt-1">
                {wishlistIds.length} {wishlistIds.length === 1 ? 'piece' : 'pieces'} saved
              </p>
            </div>
            {user ? (
              <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-btn">
                <Link to="/account" className="text-sable-muted hover:text-sable-black pb-1">
                  Profile
                </Link>
                <Link to="/orders" className="text-sable-muted hover:text-sable-black pb-1">
                  Orders
                </Link>
                <Link to="/wishlist" className="text-sable-black border-b border-sable-black pb-1">
                  Wishlist
                </Link>
              </div>
            ) : (
              <p className="text-xs text-sable-muted">
                Saved locally in this browser.{' '}
                <Link to="/login" className="text-sable-brown hover:underline">
                  Sign in
                </Link>{' '}
                to manage your client account.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            eyebrow="YOUR WISHLIST IS EMPTY"
            title="Save pieces you are considering"
            description="Tap the heart icon on any garment, shoe, or accessory to build your personal edit."
            actionLabel="EXPLORE COLLECTION"
            onAction={() => navigate('/clothing')}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                onMoveToBag={handleMoveToBag}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
