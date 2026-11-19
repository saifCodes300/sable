# SABLE — Quiet Luxury Menswear Storefront

Production-quality, dynamic **frontend-only** e-commerce web application for the men's clothing maison **SABLE**. Built with React 18, Vite, Tailwind CSS, React Router v6, Zustand (persisted to `localStorage`), React Hook Form + Zod, and a clean mock API service layer designed so a real MERN / Express backend can be plugged in by editing `src/api/` and `.env` only.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
npm run preview
```

### Demo Credentials & Promo Codes
- **Demo Account:** `atelier@sable.co` / `sable2026` (pre-seeded with sample orders & saved address, or register a fresh account)
- **Promo Codes:**
  - `SABLE10` — 10% off order
  - `WELCOME15` — 15% off order
  - `FREESHIP` — Complimentary standard shipping
- **Test Card (Luhn-valid):** `4242 4242 4242 4242` · any future expiry (e.g. `08/29`) · any 3-digit CVC

---

## Project Structure

```text
public/
  images/
    models/         -> model-1.png .. model-8.png (hero editorial lineup)
    products/       -> product photography placeholders
    categories/     -> category showcase tiles
    editorial/      -> brand story imagery
src/
  api/              -> ONLY layer where data is fetched (REST-shaped { data, meta })
    client.js       -> USE_MOCK flag, VITE_API_URL, simulated latency & fetch helper
    products.js     -> getProducts, getProductBySlug, getRelated, getFeatured, reviews
    orders.js       -> placeOrder, getOrders, getOrderById
    promo.js        -> validatePromo
    auth.js         -> login, register, logout, getMe, updateProfile
  data/
    products.json   -> 28 men's items across Clothing, Shoes, Bags & Accessories
    promoCodes.json -> Valid promotional codes
    categories.json -> Department definitions & size tables
    i18n.js         -> Translations (English, বাংলা, Español, Français) + currency rates
  store/
    cartStore.js    -> Bag items + promo (persisted to localStorage)
    wishlistStore.js-> Saved item IDs (persisted to localStorage)
    authStore.js    -> Session user & auth actions (persisted to localStorage)
    uiStore.js      -> Currency, language, mobile drawer, mini-cart drawer
  components/
    layout/         -> AnnouncementBar, Navbar, MobileMenu, MiniCartDrawer, Footer, Layout
    ui/             -> Hand-built design system components (zero UI libraries)
    product/        -> ProductCard, ProductGrid, Gallery, FilterSidebar, SortSelect, SizeGuideModal
    cart/           -> CartItem, OrderSummary, PromoInput
    checkout/       -> CheckoutSection, ShippingMethodOption, PaymentForm
  pages/            -> Home, Listing, ProductDetail, Bag, Checkout, OrderConfirmation,
                       MyOrders, Login, Register, Account, Wishlist, NotFound
  hooks/            -> useDebounce, useProducts, useLocalStorage
  utils/            -> formatCurrency, calcTotals, slugify, cardValidation
  routes.jsx        -> React.lazy code-split routes + ProtectedRoute
  App.jsx
  main.jsx
```

---

## Swapping in a Real MERN / Express Backend

Every UI component and store talks **exclusively** to `src/api/*`. All API functions are `async` and return the standard REST envelope `{ data, meta }`.

1. Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=https://api.your-domain.com/api/v1
   VITE_USE_MOCK=false
   ```
2. Implement the matching Express routes on your backend:
   - `GET /products` (query params: `category`, `subcategories`, `sizes`, `colors`, `minPrice`, `maxPrice`, `inStock`, `search`, `sort`, `page`, `limit`, `ids`)
   - `GET /products/:slug`, `GET /products/:id/related`, `GET /products/featured`
   - `GET /products/:id/reviews`, `POST /products/:id/reviews`
   - `GET /categories`
   - `POST /promo/validate`
   - `POST /orders`, `GET /orders`, `GET /orders/:id`
   - `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me`
3. No changes are needed inside `src/pages/`, `src/components/`, or `src/store/`.
