import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { CURRENCIES, LANGUAGES, getTranslation } from '../../data/i18n';

export function MobileMenu() {
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen, language, currency, setLanguage, setCurrency } =
    useUiStore();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState('');
  const t = getTranslation(language);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  if (!mobileMenuOpen) return null;

  const navItems = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/clothing', label: t.nav.clothing },
    { to: '/bags', label: t.nav.bags },
    { to: '/shoes', label: t.nav.shoes },
    { to: '/accessories', label: t.nav.accessories },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMobileMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    toast.success('Signed out.');
    navigate('/');
  };

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div
        className="fixed inset-0 bg-sable-black/45"
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[320px] bg-sable-white h-full border-r border-sable-border flex flex-col z-10 overflow-y-auto">
        <div className="h-[72px] px-5 border-b border-sable-border flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-serif font-black text-2xl tracking-logo text-sable-black"
          >
            SABLE
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 -mr-2 text-sable-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="p-5 border-b border-sable-border">
          <div className="relative">
            <Search className="w-4 h-4 text-sable-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-sable-border text-sm text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black"
            />
          </div>
        </form>

        {/* Nav Links */}
        <nav className="p-5 border-b border-sable-border flex flex-col gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `font-serif text-xl py-1 transition-colors ${
                  isActive ? 'text-sable-black font-semibold' : 'text-sable-muted hover:text-sable-black'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Account Links */}
        <div className="p-5 border-b border-sable-border space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mb-2">
            {user ? `${user.firstName} ${user.lastName}` : 'Member Access'}
          </p>
          {user ? (
            <>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-black py-1"
              >
                {t.nav.account}
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-black py-1"
              >
                {t.nav.orders}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-black py-1"
              >
                {t.nav.wishlist}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block text-sm text-sable-pink-text py-1 cursor-pointer"
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-black py-1"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-muted py-1"
              >
                Create Account
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-sable-muted py-1"
              >
                {t.nav.wishlist}
              </Link>
            </div>
          )}
        </div>

        {/* Language & Currency */}
        <div className="p-5 mt-auto grid grid-cols-2 gap-3 bg-sable-card-beige/60">
          <div>
            <label
              htmlFor="mobile-lang"
              className="block font-mono text-[10px] uppercase tracking-btn text-sable-muted mb-1.5"
            >
              Language
            </label>
            <select
              id="mobile-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-9 px-2 bg-sable-white border border-sable-border text-xs text-sable-black"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="mobile-currency"
              className="block font-mono text-[10px] uppercase tracking-btn text-sable-muted mb-1.5"
            >
              Currency
            </label>
            <select
              id="mobile-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-9 px-2 bg-sable-white border border-sable-border text-xs text-sable-black"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
