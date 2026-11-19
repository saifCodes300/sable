import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import categoriesData from '../data/categories.json';
import { useProducts } from '../hooks/useProducts';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterSidebar, MAX_CATALOG_PRICE } from '../components/product/FilterSidebar';
import { SortSelect } from '../components/product/SortSelect';
import { useUiStore } from '../store/uiStore';
import { getTranslation } from '../data/i18n';

const parseList = (val) => (val ? val.split(',').filter(Boolean) : []);

export default function Listing({ category = 'all' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { language } = useUiStore();
  const t = getTranslation(language);

  const isSearchMode = category === 'search';
  const searchQuery = searchParams.get('q') || '';

  const categoryMeta = useMemo(
    () => categoriesData.find((c) => c.slug === category),
    [category]
  );

  const allSubcategories = useMemo(() => {
    if (categoryMeta) return categoryMeta.subcategories;
    return categoriesData.flatMap((c) => c.subcategories);
  }, [categoryMeta]);

  const availableSizes = useMemo(() => {
    if (categoryMeta) return categoryMeta.sizes;
    return ['XS', 'S', 'M', 'L', 'XL', '40', '41', '42', '43', '44', '45', 'OS'];
  }, [categoryMeta]);

  const filters = useMemo(() => {
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    return {
      subcategories: parseList(searchParams.get('sub')),
      sizes: parseList(searchParams.get('size')),
      colors: parseList(searchParams.get('color')),
      minPrice: min !== null ? Number(min) : 0,
      maxPrice: max !== null ? Number(max) : MAX_CATALOG_PRICE,
      inStock: searchParams.get('stock') === '1',
      sort: searchParams.get('sort') || 'featured',
      page: Number(searchParams.get('page')) || 1,
    };
  }, [searchParams]);

  const hasActiveFilters =
    filters.subcategories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < MAX_CATALOG_PRICE ||
    filters.inStock;

  const queryPayload = useMemo(
    () => ({
      category: isSearchMode ? 'all' : category,
      subcategories: filters.subcategories,
      sizes: filters.sizes,
      colors: filters.colors,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < MAX_CATALOG_PRICE ? filters.maxPrice : undefined,
      inStock: filters.inStock,
      search: isSearchMode ? searchQuery : '',
      sort: filters.sort,
      page: filters.page,
      limit: 12,
    }),
    [category, isSearchMode, searchQuery, filters]
  );

  const { products, meta, loading, error, refetch } = useProducts(queryPayload);

  const updateParams = (mutate) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next, { replace: false });
  };

  const toggleMulti = (key, value) => {
    updateParams((next) => {
      const current = parseList(next.get(key));
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length > 0) next.set(key, updated.join(','));
      else next.delete(key);
      next.delete('page');
    });
  };

  const handlePriceChange = (minVal, maxVal) => {
    updateParams((next) => {
      if (minVal > 0) next.set('min', String(minVal));
      else next.delete('min');
      if (maxVal < MAX_CATALOG_PRICE) next.set('max', String(maxVal));
      else next.delete('max');
      next.delete('page');
    });
  };

  const handleInStockChange = (checked) => {
    updateParams((next) => {
      if (checked) next.set('stock', '1');
      else next.delete('stock');
      next.delete('page');
    });
  };

  const handleSortChange = (sortVal) => {
    updateParams((next) => {
      if (sortVal && sortVal !== 'featured') next.set('sort', sortVal);
      else next.delete('sort');
      next.delete('page');
    });
  };

  const handlePageChange = (newPage) => {
    updateParams((next) => {
      if (newPage > 1) next.set('page', String(newPage));
      else next.delete('page');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    updateParams((next) => {
      ['sub', 'size', 'color', 'min', 'max', 'stock', 'page'].forEach((k) => next.delete(k));
    });
  };

  const pageTitle = isSearchMode
    ? searchQuery
      ? `Search: “${searchQuery}”`
      : 'Search Collection'
    : categoryMeta?.name || 'All Pieces';

  const pageDescription = isSearchMode
    ? 'Curated results across the SABLE catalog.'
    : categoryMeta?.description || 'Quiet luxury menswear engineered for longevity.';

  return (
    <>
      <Helmet>
        <title>{pageTitle} — SABLE</title>
      </Helmet>

      {/* Beige Breadcrumb & Title Band */}
      <div className="bg-sable-beige border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-11">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: isSearchMode ? 'Search' : pageTitle },
            ]}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-sable-black">
                {pageTitle}
              </h1>
              <p className="text-sm text-sable-muted mt-2 max-w-xl">{pageDescription}</p>
            </div>
            <p className="font-mono text-xs uppercase tracking-btn text-sable-muted shrink-0">
              {loading ? 'Loading...' : `${meta.total} ${meta.total === 1 ? 'piece' : 'pieces'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Listing Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-sable-border">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 h-10 px-4 border border-sable-black font-mono text-xs uppercase tracking-btn text-sable-black cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-sable-brown" aria-hidden="true" />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {hasActiveFilters ? (
              <span className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">
                Active filters applied
              </span>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-btn text-sable-muted">
                Showing {products.length} of {meta.total}
              </span>
            )}
          </div>

          <SortSelect value={filters.sort} onChange={handleSortChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FilterSidebar
                subcategories={allSubcategories}
                availableSizes={availableSizes}
                filters={filters}
                onToggleSubcategory={(val) => toggleMulti('sub', val)}
                onToggleSize={(val) => toggleMulti('size', val)}
                onToggleColor={(val) => toggleMulti('color', val)}
                onPriceChange={handlePriceChange}
                onInStockChange={handleInStockChange}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>

          {/* Product Listing */}
          <div className="lg:col-span-9 space-y-10">
            {error ? (
              <div className="border border-sable-border p-12 text-center">
                <p className="text-sm text-sable-pink-text mb-4">{error}</p>
                <Button variant="secondary" onClick={refetch}>
                  Try again
                </Button>
              </div>
            ) : !loading && products.length === 0 ? (
              <EmptyState
                eyebrow="NO MATCHES FOUND"
                title="No pieces match your current selection"
                description="Try broadening your size, color, or price filters to explore more from the collection."
                actionLabel={t.buttons.clearFilters}
                onAction={handleClearAll}
              />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  loading={loading}
                  skeletonCount={8}
                  columns="default"
                />
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer for Filters */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div
            className="fixed inset-0 bg-sable-black/50"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-sable-white border-t border-sable-border max-h-[85vh] flex flex-col z-10">
            <div className="px-5 py-4 border-b border-sable-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-btn text-sable-black font-medium">
                Refine Selection
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-1 text-sable-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <FilterSidebar
                subcategories={allSubcategories}
                availableSizes={availableSizes}
                filters={filters}
                onToggleSubcategory={(val) => toggleMulti('sub', val)}
                onToggleSize={(val) => toggleMulti('size', val)}
                onToggleColor={(val) => toggleMulti('color', val)}
                onPriceChange={handlePriceChange}
                onInStockChange={handleInStockChange}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
            <div className="p-4 border-t border-sable-border bg-sable-card-beige">
              <Button fullWidth onClick={() => setMobileFilterOpen(false)}>
                SHOW {meta.total} RESULTS
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
