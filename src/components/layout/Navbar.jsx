import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Package,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { getTranslation } from '../../data/i18n';
import { useDebounce } from '../../hooks/useDebounce';
import { getProducts } from '../../api/products';
import { formatWholeCurrency } from '../../utils/formatCurrency';
import { ProductImage } from '../ui/ProductImage';

export function Navbar() {
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const { language, currency, bagBumpKey, setMobileMenuOpen } = useUiStore();
  const t = getTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 250);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  const bagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const formattedBagCount = String(bagCount).padStart(2, '0');

  const navItems = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/clothing', label: t.nav.clothing },
    { to: '/bags', label: t.nav.bags },
    { to: '/shoes', label: t.nav.shoes },
    { to: '/accessories', label: t.nav.accessories },
  ];

  useEffect(() => {
    let active = true;
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setSearchLoading(true);
      try {
        const res = await getProducts({ search: trimmed, limit: 5 });
        if (active) setSuggestions(res.data);
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    toast.success('Signed out of SABLE.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-sable-white border-b border-sable-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] grid grid-cols-3 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: Desktop Nav / Mobile Hamburger */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-2 text-sable-black hover:text-sable-brown transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-sm transition-colors duration-150 ${
                    isActive
                      ? 'text-sable-black font-medium'
                      : 'text-sable-muted hover:text-sable-black font-normal'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: SABLE Logo */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="font-serif font-black text-2xl sm:text-[28px] tracking-logo text-sable-black hover:text-sable-brown transition-colors duration-200 select-none"
          >
            SABLE
          </Link>
        </div>

        {/* Right: Search, Wishlist, Bag, Account */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          {/* Desktop Pill Search Bar */}
          <div ref={searchRef} className="hidden lg:block relative w-52 xl:w-64">
            <form onSubmit={handleSearchSubmit} role="search">
              <Search
                className="w-4 h-4 text-sable-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder={t.nav.searchPlaceholder}
                aria-label="Search products"
                className="w-full h-9 pl-9 pr-8 rounded-full border border-sable-border bg-sable-white text-xs text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black transition-colors duration-150"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sable-muted hover:text-sable-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Search Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-sable-white border border-sable-border z-50">
                <div className="px-3.5 py-2 border-b border-sable-border flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-btn text-sable-muted">
                    {searchLoading ? 'Searching...' : 'Suggestions'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="font-mono text-[10px] uppercase tracking-btn text-sable-brown hover:underline cursor-pointer"
                  >
                    View all →
                  </button>
                </div>

                {searchLoading ? (
                  <div className="p-4 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-12 bg-sable-beige shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-sable-beige w-3/4" />
                          <div className="h-2.5 bg-sable-beige w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-sable-border">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-sable-card-beige transition-colors"
                        >
                          <div className="w-11 h-14 shrink-0 border border-sable-border overflow-hidden">
                            <ProductImage
                              src={item.colors[0]?.images[0]}
                              alt={item.name}
                              label={item.subcategory}
                              colorHex={item.colors[0]?.hex}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-serif text-sm text-sable-black truncate">
                              {item.name}
                            </p>
                            <p className="font-mono text-xs text-sable-brown mt-0.5">
                              {formatWholeCurrency(item.price, currency)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-center text-xs text-sable-muted">
                    No pieces match &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label={`Wishlist (${wishlistItems.length} saved)`}
            className="relative p-1.5 text-sable-black hover:text-sable-brown transition-colors"
          >
            <Heart className="w-[19px] h-[19px]" strokeWidth={1.7} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-sable-brown text-sable-white font-mono text-[9px] flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Bag */}
          <Link
            to="/bag"
            aria-label={`Shopping bag (${bagCount} items)`}
            className="relative inline-flex items-center gap-1.5 p-1.5 text-sable-black hover:text-sable-brown transition-colors"
          >
            <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.7} />
            <span
              key={bagBumpKey}
              className="min-w-[22px] h-[22px] px-1 rounded-full bg-sable-black text-sable-white font-mono text-[10px] font-medium flex items-center justify-center animate-bump"
            >
              {formattedBagCount}
            </span>
          </Link>

          {/* Account / Login */}
          <div ref={accountRef} className="hidden lg:block relative">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  className="inline-flex items-center gap-1.5 text-sm text-sable-black hover:text-sable-brown transition-colors cursor-pointer py-1"
                >
                  <User className="w-4 h-4" strokeWidth={1.7} />
                  <span className="max-w-[90px] truncate">{user.firstName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-sable-muted" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-sable-white border border-sable-border py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-sable-border">
                      <p className="text-xs font-medium text-sable-black truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-sable-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-sable-black hover:bg-sable-card-beige transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-sable-muted" />
                      {t.nav.account}
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-sable-black hover:bg-sable-card-beige transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-sable-muted" />
                      {t.nav.orders}
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-sable-black hover:bg-sable-card-beige transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-sable-muted" />
                      {t.nav.wishlist}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-sable-pink-text hover:bg-sable-card-beige border-t border-sable-border transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm text-sable-black hover:text-sable-brown transition-colors"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
