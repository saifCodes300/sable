import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

export function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  columns = 'default',
  className = '',
}) {
  const gridCols =
    columns === '3'
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4 sm:gap-5 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-5 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
