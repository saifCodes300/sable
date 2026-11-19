import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { formatWholeCurrency } from '../../utils/formatCurrency';
import { getTranslation } from '../../data/i18n';
import { Badge } from '../ui/Badge';
import { ProductImage } from '../ui/ProductImage';

export function ProductCard({ product }) {
  const { currency, language, setMiniCartOpen, triggerBagBump } = useUiStore();
  const { items: wishlistIds, toggleItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const t = getTranslation(language);

  const [colorIdx, setColorIdx] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const [heartAnimKey, setHeartAnimKey] = useState(0);

  const activeColor = product.colors[colorIdx] || product.colors[0];
  const primaryImage = activeColor?.images?.[0];
  const secondaryImage = activeColor?.images?.[1] || primaryImage;
  const isWishlisted = wishlistIds.includes(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product.id);
    setHeartAnimKey((k) => k + 1);
    toast.success(added ? `Saved ${product.name} to wishlist.` : 'Removed from wishlist.');
  };

  const handleQuickAddSize = (sizeObj) => {
    if (sizeObj.stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: activeColor.name,
      size: sizeObj.label,
      quantity: 1,
      maxStock: sizeObj.stock,
      image: primaryImage,
    });
    triggerBagBump();
    setQuickOpen(false);
    toast.success(`Added ${product.name} (${sizeObj.label}) to bag.`);
    setMiniCartOpen(true);
  };

  return (
    <article className="group border border-sable-border bg-sable-white flex flex-col transition-colors duration-200 hover:border-sable-muted/80">
      {/* Image Stage */}
      <div className="relative aspect-[3/4] bg-sable-card-beige overflow-hidden">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full relative"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={primaryImage}
            alt={`${product.name} in ${activeColor?.name}`}
            label={product.subcategory}
            colorHex={activeColor?.hex}
            className="transition-opacity duration-250 group-hover:opacity-0"
          />
          <ProductImage
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            label={product.subcategory}
            colorHex={activeColor?.hex}
            className="absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
          />
        </Link>

        {/* Top-left New Badge */}
        {product.isNew && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <Badge variant="dark">New</Badge>
          </div>
        )}

        {/* Top-right Wishlist Heart */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-sable-white/90 border border-sable-border flex items-center justify-center text-sable-black hover:border-sable-black transition-colors cursor-pointer"
        >
          <Heart
            key={heartAnimKey}
            className={`w-4 h-4 transition-colors ${
              heartAnimKey > 0 ? 'animate-heart-pop' : ''
            } ${isWishlisted ? 'fill-sable-brown text-sable-brown' : 'text-sable-black'}`}
            strokeWidth={1.7}
          />
        </button>

        {/* Quick Add Trigger & Popover */}
        {!quickOpen ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.sizes.length === 1 && product.sizes[0].stock > 0) {
                handleQuickAddSize(product.sizes[0]);
              } else {
                setQuickOpen(true);
              }
            }}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-sable-black text-sable-white font-mono text-[10px] uppercase tracking-btn inline-flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 hover:bg-sable-brown transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            {t.buttons.quickAdd}
          </button>
        ) : (
          <div
            className="absolute inset-x-2.5 bottom-2.5 bg-sable-white border border-sable-black p-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                Select Size
              </span>
              <button
                type="button"
                onClick={() => setQuickOpen(false)}
                aria-label="Close size picker"
                className="text-sable-muted hover:text-sable-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={s.stock <= 0}
                  onClick={() => handleQuickAddSize(s)}
                  className={`min-w-[32px] h-7 px-2 border font-mono text-[10px] uppercase transition-colors ${
                    s.stock <= 0
                      ? 'border-sable-border text-sable-muted/60 line-through cursor-not-allowed'
                      : 'border-sable-border text-sable-black hover:bg-sable-black hover:text-sable-white hover:border-sable-black cursor-pointer'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
            {product.subcategory}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="block font-serif text-sm sm:text-[15px] text-sable-black hover:text-sable-brown transition-colors mt-0.5 leading-snug line-clamp-2"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-mono text-xs sm:text-[13px] font-medium text-sable-black">
            {formatWholeCurrency(product.price, currency)}
          </span>

          <div className="flex items-center gap-1.5" aria-label="Available colors">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={`${product.name} in ${c.name}`}
                onClick={() => setColorIdx(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                  idx === colorIdx
                    ? 'ring-1 ring-sable-black ring-offset-1'
                    : 'opacity-75 hover:opacity-100'
                } ${
                  c.hex.toUpperCase() === '#EFE9DC' || c.hex.toUpperCase() === '#D2C5B4'
                    ? 'border border-sable-border'
                    : ''
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
