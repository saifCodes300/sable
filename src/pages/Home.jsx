import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { getCategories, getProducts } from '../api/products';
import { useUiStore } from '../store/uiStore';
import { getTranslation } from '../data/i18n';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductImage } from '../components/ui/ProductImage';
import { Skeleton } from '../components/ui/Skeleton';

const MODEL_LINEUP = [
  { id: 1, src: '/images/models/model-1.png', look: 'Look 01 · Cream Knit & Cap' },
  { id: 2, src: '/images/models/model-2.png', look: 'Look 02 · Taupe Double Blazer' },
  { id: 3, src: '/images/models/model-3.png', look: 'Look 03 · Sand Suede Blouson' },
  { id: 4, src: '/images/models/model-4.png', look: 'Look 04 · Ink Camp Shirt' },
  { id: 5, src: '/images/models/model-5.png', look: 'Look 05 · Balmacaan Overcoat' },
  { id: 6, src: '/images/models/model-6.png', look: 'Look 06 · Olive Merino Polo' },
  { id: 7, src: '/images/models/model-7.png', look: 'Look 07 · Chalk Supima Hoodie' },
  { id: 8, src: '/images/models/model-8.png', look: 'Look 08 · Linen Tailoring' },
];

function ModelFigure({ item }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="snap-center shrink-0 w-[160px] sm:w-[175px] lg:w-auto lg:flex-1 flex flex-col justify-end items-center group overflow-hidden bg-[#F5F2EA]">
      {!failed ? (
        <img
          src={item.src}
          alt={item.look}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full aspect-[2/3] object-cover object-center transition-transform duration-250 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="w-full aspect-[2/3] bg-[#EAE6DF] border border-sable-border/60 flex flex-col items-center justify-end pb-5 px-3 text-center"
          role="img"
          aria-label={item.look}
        >
          <span className="font-serif italic text-lg text-sable-muted">0{item.id}</span>
          <span className="font-mono text-[9px] uppercase tracking-btn text-sable-muted mt-1">
            {item.look.split('·')[1]?.trim()}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { language } = useUiStore();
  const t = getTranslation(language);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [arrivalsError, setArrivalsError] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    let active = true;
    getCategories()
      .then((res) => {
        if (active) setCategories(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCatLoading(false);
      });

    getProducts({ sort: 'newest', limit: 8 })
      .then((res) => {
        if (active) setNewArrivals(res.data);
      })
      .catch((err) => {
        if (active) setArrivalsError(err?.message || 'Failed to load new arrivals.');
      })
      .finally(() => {
        if (active) setArrivalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterEmail('');
    toast.success('Subscribed to the SABLE private dispatch.');
  };

  return (
    <>
      <Helmet>
        <title>SABLE — Quiet Luxury Menswear</title>
        <meta
          name="description"
          content="Quiet luxury, loudly considered. Explore premium men's clothing, shoes, bags, and accessories by SABLE."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-sable-white pt-14 sm:pt-20 lg:pt-24 pb-10 sm:pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-sable-brown mb-4 sm:mb-5">
            {t.hero.eyebrow}
          </p>
          <h1 className="font-serif text-[44px] sm:text-[64px] md:text-[76px] lg:text-[88px] leading-[1.03] tracking-[-0.02em] font-medium">
            <span className="block text-sable-black">{t.hero.line1}</span>
            <span className="block text-sable-brown italic font-normal">{t.hero.line2}</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-sable-muted max-w-xl mx-auto leading-relaxed">
            {t.hero.subtext}
          </p>
          <div className="mt-8">
            <Link to="/clothing">
              <Button size="lg">{t.hero.cta}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8-Model Editorial Lineup */}
      <section
        aria-label="Seasonal lookbook lineup"
        className="w-full bg-[#F5F2EB] border-y border-sable-border overflow-hidden"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end gap-[2px] overflow-x-auto lg:overflow-visible snap-x snap-mandatory no-scrollbar">
            {MODEL_LINEUP.map((item) => (
              <ModelFigure key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories (4 Large Tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
            {t.home.featuredCategories}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-sable-black">
            {t.home.featuredTitle}
          </h2>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/${cat.slug}`}
                className="group relative aspect-[3/4] border border-sable-border overflow-hidden bg-sable-card-beige flex flex-col justify-end"
              >
                <div className="absolute inset-0 transition-transform duration-250 group-hover:scale-105">
                  <ProductImage
                    src={cat.image}
                    alt={cat.name}
                    label={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-sable-black/70 via-sable-black/15 to-transparent" />
                <div className="relative z-10 p-6 text-sable-white">
                  <p className="font-mono text-[10px] uppercase tracking-btn text-sable-beige/90 mb-1">
                    {cat.subcategories.slice(0, 3).join(' · ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl text-sable-white">{cat.name}</h3>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Grid */}
      <section className="border-t border-sable-border py-16 sm:py-24 bg-sable-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-2">
                {t.home.newArrivalsEyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-sable-black">
                {t.home.newArrivalsTitle}
              </h2>
            </div>
            <Link
              to="/clothing?sort=newest"
              className="font-mono text-xs uppercase tracking-btn text-sable-black hover:text-sable-brown inline-flex items-center gap-2 transition-colors"
            >
              {t.home.viewAll}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {arrivalsError ? (
            <div className="border border-sable-border p-10 text-center">
              <p className="text-sm text-sable-pink-text mb-4">{arrivalsError}</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <ProductGrid products={newArrivals} loading={arrivalsLoading} skeletonCount={8} />
          )}
        </div>
      </section>

      {/* Brand Story Split Section */}
      <section id="atelier" className="border-t border-sable-border bg-sable-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 aspect-[4/3] border border-sable-border overflow-hidden bg-sable-card-beige">
              <ProductImage
                src="/images/editorial/atelier-story.png"
                alt="SABLE Atelier fabric craftsmanship"
                label="Maison SABLE Atelier"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown">
                {t.home.storyEyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-tight text-sable-black">
                {t.home.storyTitle}
              </h2>
              <p className="text-sm sm:text-base text-sable-muted leading-relaxed">
                {t.home.storyBody}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-sable-border">
                <div>
                  <p className="font-serif text-2xl text-sable-black">Biella</p>
                  <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mt-1">
                    Virgin Wools
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-sable-black">Como</p>
                  <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mt-1">
                    Mulberry Silk
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-sable-black">Marche</p>
                  <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mt-1">
                    Hand-Lasted Shoes
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link to="/clothing">
                  <Button variant="secondary">{t.home.storyCta}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Benefits Strip */}
      <section
        aria-label="SABLE client privileges"
        className="border-y border-sable-border bg-sable-black text-sable-white py-4 overflow-hidden"
      >
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center shrink-0">
              {t.home.benefits.map((benefit, idx) => (
                <div key={`${dup}-${idx}`} className="flex items-center">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] px-8 whitespace-nowrap">
                    {benefit}
                  </span>
                  <span className="text-sable-brown" aria-hidden="true">
                    ✦
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Band */}
      <section className="bg-sable-card-beige py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sable-brown mb-3">
            {t.home.newsletterEyebrow}
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-sable-black mb-6">
            {t.home.newsletterTitle}
          </h2>
          <form
            onSubmit={handleNewsletterSubmit}
            noValidate
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <label htmlFor="home-newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter"
              type="email"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterError) setNewsletterError('');
              }}
              placeholder={t.home.newsletterPlaceholder}
              className="flex-1 h-12 px-4 bg-sable-white border border-sable-border rounded-none text-sm text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black"
            />
            <Button type="submit" size="md">
              {t.home.newsletterCta}
            </Button>
          </form>
          {newsletterError && (
            <p role="alert" className="mt-2.5 text-xs text-sable-pink-text">
              {newsletterError}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
