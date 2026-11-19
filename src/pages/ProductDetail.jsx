import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Heart, Ruler } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  addProductReview,
  getProductBySlug,
  getProductReviews,
  getRelated,
} from '../api/products';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { formatWholeCurrency } from '../utils/formatCurrency';
import { getTranslation } from '../data/i18n';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Swatch } from '../components/ui/Swatch';
import { SizeChip } from '../components/ui/SizeChip';
import { Stepper } from '../components/ui/Stepper';
import { Accordion } from '../components/ui/Accordion';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import { Gallery } from '../components/product/Gallery';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { ProductGrid } from '../components/product/ProductGrid';

const reviewSchema = z.object({
  author: z.string().min(2, 'Please enter your name.'),
  title: z.string().min(3, 'Please add a short headline.'),
  body: z.string().min(10, 'Review must be at least 10 characters.'),
});

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currency, language, setMiniCartOpen, triggerBagBump } = useUiStore();
  const { addItem } = useCartStore();
  const { items: wishlistIds, toggleItem } = useWishlistStore();
  const { user } = useAuthStore();
  const t = getTranslation(language);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: user ? `${user.firstName} ${user.lastName}` : '',
      title: '',
      body: '',
    },
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setSelectedColorIdx(0);
    setSelectedSize('');
    setSizeError('');
    setQuantity(1);

    getProductBySlug(slug)
      .then((res) => {
        if (!active) return;
        const prod = res.data;
        setProduct(prod);
        // Auto-select OS if single-size item
        if (prod.sizes.length === 1 && prod.sizes[0].stock > 0) {
          setSelectedSize(prod.sizes[0].label);
        }
        setRelatedLoading(true);
        getRelated(prod.id, 4)
          .then((r) => active && setRelated(r.data))
          .finally(() => active && setRelatedLoading(false));
        getProductReviews(prod.id).then((r) => active && setReviews(r.data));
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <Helmet>
          <title>Piece Not Found — SABLE</title>
        </Helmet>
        <EmptyState
          eyebrow="404 · ARCHIVE"
          title="This piece could not be found"
          description="It may have sold out or been moved to a seasonal archive."
          actionLabel="EXPLORE CLOTHING"
          onAction={() => navigate('/clothing')}
        />
      </div>
    );
  }

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const selectedSizeObj = product.sizes.find((s) => s.label === selectedSize);
  const maxStock = selectedSizeObj ? selectedSizeObj.stock : 10;
  const isWishlisted = wishlistIds.includes(product.id);
  const totalReviewCount = product.reviewCount + Math.max(0, reviews.length - 3);

  const handleSizeSelect = (label) => {
    setSelectedSize(label);
    setSizeError('');
    const found = product.sizes.find((s) => s.label === label);
    if (found && quantity > found.stock) {
      setQuantity(Math.max(1, found.stock));
    }
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError('Please select a size');
      return;
    }
    const sizeObj = product.sizes.find((s) => s.label === selectedSize);
    if (!sizeObj || sizeObj.stock <= 0) {
      setSizeError('Selected size is currently out of stock');
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: activeColor.name,
      size: selectedSize,
      quantity,
      maxStock: sizeObj.stock,
      image: activeColor.images[0],
    });

    triggerBagBump();
    toast.success(`Added ${product.name} (${selectedSize}) to your bag.`);
    setMiniCartOpen(true);
  };

  const onSubmitReview = async (values) => {
    setSubmittingReview(true);
    try {
      const res = await addProductReview(product.id, {
        ...values,
        rating: reviewRating,
      });
      setReviews((prev) => [res.data, ...prev]);
      reset({ author: user ? `${user.firstName} ${user.lastName}` : '', title: '', body: '' });
      setReviewRating(5);
      setReviewFormOpen(false);
      toast.success('Thank you for your review.');
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, count, pct };
  });

  const accordionItems = [
    {
      id: 'fabric',
      title: 'Fabric & Fit',
      content: product.fabric,
    },
    {
      id: 'care',
      title: 'Care Instructions',
      content: product.careInstructions,
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      content:
        'Complimentary standard shipping on orders over $200 (5–7 business days). Express 2–3 day courier available at checkout. Returns and exchanges are complimentary within 30 days of delivery.',
    },
  ];

  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <>
      <Helmet>
        <title>{product.name} — SABLE</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Breadcrumb + Gallery */}
          <div className="lg:col-span-7 space-y-5">
            <Breadcrumb
              items={[
                { label: 'Home', to: '/' },
                { label: categoryLabel, to: `/${product.category}` },
                {
                  label: product.subcategory,
                  to: `/${product.category}?sub=${encodeURIComponent(product.subcategory)}`,
                },
                { label: product.name },
              ]}
            />
            <Gallery
              images={activeColor?.images}
              productName={product.name}
              colorName={activeColor?.name}
              colorHex={activeColor?.hex}
            />
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 lg:pt-8 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-serif text-3xl sm:text-[36px] leading-tight text-sable-black">
                  {product.name}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    const added = toggleItem(product.id);
                    toast.success(added ? 'Saved to wishlist.' : 'Removed from wishlist.');
                  }}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isWishlisted}
                  className="w-10 h-10 border border-sable-border flex items-center justify-center shrink-0 hover:border-sable-black transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-sable-brown text-sable-brown' : 'text-sable-black'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3">
                <Rating value={product.rating} count={totalReviewCount} />
              </div>

              <p className="mt-4 font-mono text-2xl text-sable-brown font-medium">
                {formatWholeCurrency(product.price, currency)}
              </p>
            </div>

            <div className="border-t border-sable-border pt-5">
              <p className="text-sm text-sable-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-btn text-sable-black">
                Color — <span className="text-sable-muted">{activeColor?.name}</span>
              </p>
              <div className="flex items-center gap-3">
                {product.colors.map((color, idx) => (
                  <Swatch
                    key={color.name}
                    color={color}
                    selected={idx === selectedColorIdx}
                    onClick={() => setSelectedColorIdx(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-btn text-sable-black">
                  Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-sable-brown hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size guide →
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sizeObj) => (
                  <SizeChip
                    key={sizeObj.label}
                    label={sizeObj.label}
                    selected={selectedSize === sizeObj.label}
                    disabled={sizeObj.stock <= 0}
                    onClick={() => handleSizeSelect(sizeObj.label)}
                  />
                ))}
              </div>
              {sizeError && (
                <p role="alert" className="text-xs text-sable-pink-text font-medium">
                  {sizeError}
                </p>
              )}
            </div>

            {/* Quantity + Add to Bag */}
            <div className="flex items-stretch gap-3 pt-1">
              <Stepper
                value={quantity}
                min={1}
                max={maxStock}
                onChange={setQuantity}
              />
              <Button fullWidth onClick={handleAddToBag}>
                {t.buttons.addToBag} — {formatWholeCurrency(product.price * quantity, currency)}
              </Button>
            </div>

            {/* Stock & Return Status Lines */}
            <div className="space-y-2 text-xs text-sable-muted">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sable-brown shrink-0" />
                {selectedSizeObj && selectedSizeObj.stock <= 3 ? (
                  <span className="text-sable-pink-text font-medium">
                    Only {selectedSizeObj.stock} left — ships within 2-4 business days
                  </span>
                ) : (
                  <span>In stock — ships within 2-4 business days</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sable-brown shrink-0" />
                <span>Free returns within 30 days</span>
              </div>
            </div>

            {/* Single-Open Accordions */}
            <Accordion items={accordionItems} defaultOpenId="fabric" />
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-20 pt-14 border-t border-sable-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Breakdown */}
            <div className="lg:col-span-4 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown">
                CLIENT IMPRESSIONS
              </p>
              <h2 className="font-serif text-3xl text-sable-black">Reviews</h2>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl text-sable-black">
                  {product.rating.toFixed(1)}
                </span>
                <div>
                  <Rating value={product.rating} />
                  <p className="text-xs text-sable-muted mt-1">
                    Based on {totalReviewCount} verified reviews
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-xs">
                    <span className="font-mono w-8 text-sable-muted">{row.stars} ★</span>
                    <div className="flex-1 h-1.5 bg-sable-beige overflow-hidden">
                      <div
                        className="h-full bg-sable-brown"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="font-mono w-8 text-right text-sable-muted">{row.pct}%</span>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                onClick={() => setReviewFormOpen((o) => !o)}
              >
                {reviewFormOpen ? 'CANCEL REVIEW' : 'WRITE A REVIEW'}
              </Button>
            </div>

            {/* Reviews List & Form */}
            <div className="lg:col-span-8 space-y-6">
              {reviewFormOpen && (
                <form
                  onSubmit={handleSubmit(onSubmitReview)}
                  className="bg-sable-card-beige border border-sable-border p-6 space-y-4"
                >
                  <h3 className="font-serif text-xl text-sable-black">Share your impressions</h3>
                  <div>
                    <span className="block font-mono text-[11px] uppercase tracking-btn text-sable-black mb-2">
                      Rating
                    </span>
                    <Rating
                      value={reviewRating}
                      interactive
                      size="md"
                      onChange={setReviewRating}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your name"
                      placeholder="Julian M."
                      error={errors.author?.message}
                      {...register('author')}
                    />
                    <Input
                      label="Headline"
                      placeholder="Exceptional tailoring"
                      error={errors.title?.message}
                      {...register('title')}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="review-body"
                      className="block font-mono text-[11px] uppercase tracking-btn text-sable-black mb-2"
                    >
                      Review
                    </label>
                    <textarea
                      id="review-body"
                      rows={4}
                      placeholder="Comment on fabric weight, fit, and craftsmanship..."
                      className="w-full p-3.5 bg-sable-white border border-sable-border rounded-none text-sm text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black focus:ring-1 focus:ring-sable-black"
                      {...register('body')}
                    />
                    {errors.body && (
                      <p role="alert" className="mt-1.5 text-xs text-sable-pink-text">
                        {errors.body.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" loading={submittingReview}>
                    SUBMIT REVIEW
                  </Button>
                </form>
              )}

              <div className="divide-y divide-sable-border border-y border-sable-border">
                {reviews.map((rev) => (
                  <article key={rev.id} className="py-6 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={rev.rating} />
                      <span className="font-mono text-[11px] text-sable-muted">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-sable-black">{rev.title}</h3>
                    <p className="text-sm text-sable-muted leading-relaxed">{rev.body}</p>
                    <p className="font-mono text-[11px] uppercase tracking-btn text-sable-black pt-1">
                      {rev.author} {rev.verified && <span className="text-sable-brown">· Verified Buyer</span>}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* You Might Also Like */}
        <section className="mt-20 pt-14 border-t border-sable-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
                CURATED PAIRINGS
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-sable-black">
                You might also like
              </h2>
            </div>
            <Link
              to={`/${product.category}`}
              className="font-mono text-xs uppercase tracking-btn text-sable-black hover:text-sable-brown"
            >
              View {categoryLabel} →
            </Link>
          </div>
          <ProductGrid products={related} loading={relatedLoading} skeletonCount={4} />
        </section>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </>
  );
}
