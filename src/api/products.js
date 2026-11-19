import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';
import {
  USE_MOCK,
  createResponse,
  httpRequest,
  readStorage,
  simulateLatency,
  writeStorage,
} from './client';

const REVIEWS_STORAGE_KEY = 'sable_product_reviews';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-101',
    author: 'Julian M.',
    rating: 5,
    title: 'Impeccable drape and weight',
    body: 'The hand-feel immediately separates it from standard luxury staples. Tailored cleanly through the shoulder with zero stiffness.',
    verified: true,
    createdAt: '2026-10-28T14:20:00Z',
  },
  {
    id: 'rev-102',
    author: 'Henrik S.',
    rating: 5,
    title: 'Quietly extraordinary craftsmanship',
    body: 'Ordered my usual size M and the fit is spot on. Subtle finishing details like the buttons and seam binding are second to none.',
    verified: true,
    createdAt: '2026-10-14T09:15:00Z',
  },
  {
    id: 'rev-103',
    author: 'Daniel K.',
    rating: 4,
    title: 'Refined neutral tone',
    body: 'Pairs effortlessly with everything in my wardrobe. Packaging arrived beautifully pressed and ready to wear.',
    verified: true,
    createdAt: '2026-09-29T18:45:00Z',
  },
];

function isProductInStock(product) {
  return product.sizes.some((s) => s.stock > 0);
}

export async function getCategories() {
  if (!USE_MOCK) {
    return httpRequest('/categories');
  }
  await simulateLatency(200, 350);
  return createResponse(categoriesData, { total: categoriesData.length });
}

export async function getProducts(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        query.set(key, Array.isArray(val) ? val.join(',') : String(val));
      }
    });
    return httpRequest(`/products?${query.toString()}`);
  }

  await simulateLatency();

  const {
    category,
    subcategories = [],
    sizes = [],
    colors = [],
    minPrice,
    maxPrice,
    inStock = false,
    search = '',
    sort = 'featured',
    page = 1,
    limit = 12,
    ids = [],
  } = params;

  let filtered = [...productsData];

  if (ids && ids.length > 0) {
    const idSet = new Set(ids);
    filtered = filtered.filter((p) => idSet.has(p.id));
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  const normalizedSubs = (Array.isArray(subcategories) ? subcategories : [subcategories])
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  if (normalizedSubs.length > 0) {
    filtered = filtered.filter((p) => normalizedSubs.includes(p.subcategory.toLowerCase()));
  }

  const normalizedSizes = (Array.isArray(sizes) ? sizes : [sizes])
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  if (normalizedSizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.sizes.some((s) => normalizedSizes.includes(s.label.toLowerCase()) && s.stock > 0)
    );
  }

  const normalizedColors = (Array.isArray(colors) ? colors : [colors])
    .filter(Boolean)
    .map((c) => c.toLowerCase());
  if (normalizedColors.length > 0) {
    filtered = filtered.filter((p) =>
      p.colors.some((c) => normalizedColors.includes(c.name.toLowerCase()))
    );
  }

  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  }

  if (inStock) {
    filtered = filtered.filter(isProductInStock);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.colors.some((c) => c.name.toLowerCase().includes(q))
    );
  }

  switch (sort) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'featured':
    default:
      filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
      break;
  }

  const total = filtered.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageLimit = Math.max(1, Number(limit) || 12);
  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const safePage = Math.min(pageNum, totalPages);
  const start = (safePage - 1) * pageLimit;
  const paginated = filtered.slice(start, start + pageLimit);

  return createResponse(paginated, {
    total,
    page: safePage,
    limit: pageLimit,
    totalPages,
  });
}

export async function getProductBySlug(slug) {
  if (!USE_MOCK) {
    return httpRequest(`/products/${encodeURIComponent(slug)}`);
  }

  await simulateLatency();
  const product = productsData.find((p) => p.slug === slug);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return createResponse(product);
}

export async function getRelated(id, limit = 4) {
  if (!USE_MOCK) {
    return httpRequest(`/products/${encodeURIComponent(id)}/related?limit=${limit}`);
  }

  await simulateLatency(250, 450);
  const current = productsData.find((p) => p.id === id);
  let pool = productsData.filter((p) => p.id !== id);

  if (current) {
    pool.sort((a, b) => {
      const aScore =
        (a.category === current.category ? 2 : 0) +
        (a.subcategory === current.subcategory ? 1 : 0) +
        (a.featured ? 0.5 : 0);
      const bScore =
        (b.category === current.category ? 2 : 0) +
        (b.subcategory === current.subcategory ? 1 : 0) +
        (b.featured ? 0.5 : 0);
      return bScore - aScore;
    });
  } else {
    pool = pool.filter((p) => p.featured);
  }

  const results = pool.slice(0, limit);
  return createResponse(results, { total: results.length });
}

export async function getFeatured(limit = 8) {
  if (!USE_MOCK) {
    return httpRequest(`/products/featured?limit=${limit}`);
  }

  await simulateLatency();
  const featured = productsData.filter((p) => p.featured).slice(0, limit);
  return createResponse(featured, { total: featured.length });
}

export async function getProductReviews(productId) {
  if (!USE_MOCK) {
    return httpRequest(`/products/${encodeURIComponent(productId)}/reviews`);
  }

  await simulateLatency(200, 350);
  const stored = readStorage(REVIEWS_STORAGE_KEY, {});
  const customReviews = stored[productId] || [];
  const allReviews = [...customReviews, ...DEFAULT_REVIEWS];
  return createResponse(allReviews, { total: allReviews.length });
}

export async function addProductReview(productId, review) {
  if (!USE_MOCK) {
    return httpRequest(`/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  await simulateLatency(300, 450);
  const stored = readStorage(REVIEWS_STORAGE_KEY, {});
  const newReview = {
    id: `rev-${Date.now()}`,
    author: review.author.trim(),
    rating: Number(review.rating),
    title: review.title.trim(),
    body: review.body.trim(),
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const existing = stored[productId] || [];
  stored[productId] = [newReview, ...existing];
  writeStorage(REVIEWS_STORAGE_KEY, stored);

  return createResponse(newReview);
}
