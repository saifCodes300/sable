import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { validatePromo } from '../../api/promo';
import { Button } from '../ui/Button';
import { useUiStore } from '../../store/uiStore';
import { getTranslation } from '../../data/i18n';

export function PromoInput({ appliedPromo, onApply, onRemove }) {
  const { language } = useUiStore();
  const t = getTranslation(language);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim()) {
      setError('Enter a promo code to apply.');
      return;
    }

    setLoading(true);
    try {
      const res = await validatePromo(code);
      onApply(res.data);
      setSuccess(`Applied ${res.data.code}: ${res.data.description}.`);
      setCode('');
    } catch (err) {
      setError(err?.message || 'Invalid promo code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="sable-promo-input" className="sr-only">
          Promo code
        </label>
        <input
          id="sable-promo-input"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          placeholder="Promo code (e.g. SABLE10)"
          className="flex-1 min-w-0 h-11 px-3.5 bg-sable-white border border-sable-border rounded-none font-mono text-xs uppercase text-sable-black placeholder:normal-case placeholder:font-sans placeholder:text-sable-muted focus:outline-none focus:border-sable-black"
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          loading={loading}
          className="h-11 px-5 shrink-0"
        >
          {t.buttons.apply}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-xs text-sable-pink-text">
          {error}
        </p>
      )}
      {success && !error && <p className="text-xs text-[#2A5A34]">{success}</p>}

      {appliedPromo && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sable-white border border-sable-black">
          <Tag className="w-3.5 h-3.5 text-sable-brown" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-btn text-sable-black">
            {appliedPromo.code}
          </span>
          <span className="text-xs text-sable-muted">— {appliedPromo.description}</span>
          <button
            type="button"
            onClick={() => {
              onRemove();
              setSuccess('');
            }}
            aria-label={`Remove promo code ${appliedPromo.code}`}
            className="text-sable-muted hover:text-sable-black ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
