import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Instagram, Globe, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

export function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmail('');
    toast.success('Welcome to the SABLE private dispatch.');
  };

  return (
    <footer className="bg-sable-white border-t border-sable-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Shop */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-black mb-5">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-sable-muted">
              <li>
                <Link to="/clothing" className="hover:text-sable-brown transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/shoes" className="hover:text-sable-brown transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/bags" className="hover:text-sable-brown transition-colors">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/accessories" className="hover:text-sable-brown transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/clothing?sort=newest" className="hover:text-sable-brown transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Help */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-black mb-5">
              Client Services
            </h3>
            <ul className="space-y-3 text-sm text-sable-muted">
              <li>
                <Link to="/orders" className="hover:text-sable-brown transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/bag" className="hover:text-sable-brown transition-colors">
                  Shipping &amp; 30-Day Returns
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-sable-brown transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-sable-brown transition-colors">
                  Saved Pieces
                </Link>
              </li>
              <li>
                <a
                  href="mailto:concierge@sable.co"
                  className="hover:text-sable-brown transition-colors"
                >
                  concierge@sable.co
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-black mb-5">
              Maison SABLE
            </h3>
            <ul className="space-y-3 text-sm text-sable-muted">
              <li>
                <Link to="/#atelier" className="hover:text-sable-brown transition-colors">
                  The Atelier
                </Link>
              </li>
              <li>
                <Link to="/clothing" className="hover:text-sable-brown transition-colors">
                  Material Provenance
                </Link>
              </li>
              <li>
                <Link to="/clothing" className="hover:text-sable-brown transition-colors">
                  Small-Batch Craft
                </Link>
              </li>
              <li>
                <span className="text-sable-muted">New York · Milan · Tokyo</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-btn text-sable-black mb-5">
              Newsletter
            </h3>
            <p className="text-sm text-sable-muted mb-4">
              Receive private invitations to seasonal collections and limited archive editions.
            </p>
            <form onSubmit={handleSubscribe} noValidate className="space-y-2.5">
              <div className="flex">
                <label htmlFor="footer-newsletter" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Email address"
                  className="flex-1 min-w-0 h-11 px-3.5 bg-sable-white border border-sable-border border-r-0 text-sm text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black"
                />
                <Button type="submit" size="sm" className="h-11 px-4" aria-label="Subscribe">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              {error && <p className="text-xs text-sable-pink-text">{error}</p>}
            </form>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6 text-sable-muted">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="SABLE on Instagram"
                className="hover:text-sable-black transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://sable.co"
                target="_blank"
                rel="noreferrer"
                aria-label="SABLE Journal"
                className="hover:text-sable-black transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:concierge@sable.co"
                aria-label="Email SABLE"
                className="hover:text-sable-black transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-sable-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-serif font-black text-lg tracking-logo text-sable-black">
              SABLE
            </span>
            <span className="text-xs text-sable-muted">
              © {new Date().getFullYear()} SABLE Maison Ltd. All rights reserved.
            </span>
          </div>

          {/* Payment Icons Row */}
          <div className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
            {['VISA', 'MASTERCARD', 'AMEX', 'APPLE PAY', 'PAYPAL'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-sable-border bg-sable-card-beige font-mono text-[10px] tracking-btn text-sable-muted"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
