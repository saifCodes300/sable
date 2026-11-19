import { ChevronDown } from 'lucide-react';
import { CURRENCIES, LANGUAGES, getTranslation } from '../../data/i18n';
import { useUiStore } from '../../store/uiStore';

export function AnnouncementBar() {
  const { language, currency, setLanguage, setCurrency } = useUiStore();
  const t = getTranslation(language);

  return (
    <div className="w-full bg-sable-pink text-sable-pink-text border-b border-sable-pink-text/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[36px] py-1.5 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-btn font-medium truncate">
          {t.announcement}
        </p>

        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="relative inline-flex items-center">
            <label htmlFor="sable-lang-select" className="sr-only">
              Language
            </label>
            <select
              id="sable-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-transparent pr-4 font-mono text-[11px] uppercase tracking-btn text-sable-pink-text cursor-pointer focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-sable-black bg-white">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 pointer-events-none -ml-3.5" aria-hidden="true" />
          </div>

          <span className="h-3 w-px bg-sable-pink-text/25" aria-hidden="true" />

          <div className="relative inline-flex items-center">
            <label htmlFor="sable-currency-select" className="sr-only">
              Currency
            </label>
            <select
              id="sable-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="appearance-none bg-transparent pr-4 font-mono text-[11px] uppercase tracking-btn text-sable-pink-text cursor-pointer focus:outline-none"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="text-sable-black bg-white">
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 pointer-events-none -ml-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
