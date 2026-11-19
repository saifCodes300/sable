import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  Check,
  Building2,
  QrCode,
  Lock,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
} from '../../utils/cardValidation';
import { formatCurrency } from '../../utils/formatCurrency';

const POPULAR_UPI_HANDLES = [
  { label: 'GPay', suffix: '@okaxis' },
  { label: 'PhonePe', suffix: '@ybl' },
  { label: 'Paytm', suffix: '@paytm' },
  { label: 'BHIM', suffix: '@upi' },
];

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra',
  'Other Bank',
];

export function PaymentForm({
  control,
  register,
  errors,
  cardNumberValue,
  paymentMethod = 'card',
  setPaymentMethod,
  setValue,
  currency = 'USD',
  totals,
}) {
  const brand = detectCardBrand(cardNumberValue);
  const [onlineTab, setOnlineTab] = useState(
    paymentMethod === 'cod' ? 'card' : paymentMethod
  );

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    if (setValue) {
      setValue('paymentMethod', method, { shouldValidate: true });
    }
  };

  const handleSelectOnlineTab = (tab) => {
    setOnlineTab(tab);
    setPaymentMethod(tab);
    if (setValue) {
      setValue('paymentMethod', tab, { shouldValidate: true });
    }
  };

  const isCOD = paymentMethod === 'cod';

  return (
    <div className="space-y-5">
      {/* Top-Level Payment Mode Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Option 1: Online Payment */}
        <button
          type="button"
          onClick={() => handleSelectPaymentMethod(onlineTab || 'card')}
          aria-pressed={!isCOD}
          className={`text-left p-4 border transition-all cursor-pointer relative ${
            !isCOD
              ? 'border-sable-black bg-sable-white ring-1 ring-sable-black shadow-sm'
              : 'border-sable-border bg-sable-card-beige hover:border-sable-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sable-brown" />
              <span className="font-mono text-xs uppercase tracking-btn font-medium text-sable-black">
                Online Payment
              </span>
            </div>
            {!isCOD && (
              <span className="w-4 h-4 rounded-full bg-sable-black text-sable-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-sable-muted leading-relaxed">
            Cards (Visa, RuPay, MC), UPI, and Netbanking with instant encrypted processing.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-sable-card-beige border border-sable-border text-sable-black">
              CARDS
            </span>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-sable-card-beige border border-sable-border text-sable-black">
              UPI
            </span>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-sable-card-beige border border-sable-border text-sable-black">
              NETBANKING
            </span>
          </div>
        </button>

        {/* Option 2: Cash on Delivery */}
        <button
          type="button"
          onClick={() => handleSelectPaymentMethod('cod')}
          aria-pressed={isCOD}
          className={`text-left p-4 border transition-all cursor-pointer relative ${
            isCOD
              ? 'border-sable-black bg-sable-white ring-1 ring-sable-black shadow-sm'
              : 'border-sable-border bg-sable-card-beige hover:border-sable-muted'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sable-brown" />
              <span className="font-mono text-xs uppercase tracking-btn font-medium text-sable-black">
                Cash on Delivery
              </span>
            </div>
            {isCOD && (
              <span className="w-4 h-4 rounded-full bg-sable-black text-sable-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-sable-muted leading-relaxed">
            Pay with cash or UPI scan at your doorstep upon courier handover.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-sable-brown text-sable-white">
              ZERO PREPAYMENT
            </span>
            <span className="font-mono text-[9px] uppercase text-sable-muted">
              Tamper-sealed parcel
            </span>
          </div>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ONLINE PAYMENT CONTENT (Cards, UPI, Netbanking) */}
      {/* ────────────────────────────────────────────────────────── */}
      {!isCOD && (
        <div className="space-y-4 pt-1">
          {/* Sub-Tabs: Cards vs UPI vs Netbanking */}
          <div className="flex border-b border-sable-border">
            <button
              type="button"
              onClick={() => handleSelectOnlineTab('card')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-btn border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlineTab === 'card'
                  ? 'border-sable-black text-sable-black font-semibold'
                  : 'border-transparent text-sable-muted hover:text-sable-black'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Credit / Debit Card
            </button>
            <button
              type="button"
              onClick={() => handleSelectOnlineTab('upi')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-btn border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlineTab === 'upi'
                  ? 'border-sable-black text-sable-black font-semibold'
                  : 'border-transparent text-sable-muted hover:text-sable-black'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              UPI / QR
            </button>
            <button
              type="button"
              onClick={() => handleSelectOnlineTab('netbanking')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-btn border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlineTab === 'netbanking'
                  ? 'border-sable-black text-sable-black font-semibold'
                  : 'border-transparent text-sable-muted hover:text-sable-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Netbanking
            </button>
          </div>

          {/* Tab 1: Credit / Debit Card */}
          {onlineTab === 'card' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-sable-card-beige border border-sable-border">
                <div className="flex items-center gap-2 text-xs text-sable-muted">
                  <ShieldCheck className="w-4 h-4 text-sable-brown shrink-0" />
                  <span>Accepting Visa, Mastercard, RuPay, and American Express.</span>
                </div>
                <Badge variant="pink">Encrypted Gateway</Badge>
              </div>

              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Card number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 •••• •••• 4242"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    error={errors.cardNumber?.message}
                    rightSlot={
                      brand ? (
                        <span className="font-mono text-[10px] uppercase tracking-btn px-2 py-0.5 bg-sable-card-beige border border-sable-border text-sable-black font-semibold">
                          {brand}
                        </span>
                      ) : null
                    }
                  />
                )}
              />

              <Input
                label="Name on card"
                autoComplete="cc-name"
                placeholder="Full cardholder name"
                error={errors.cardName?.message}
                {...register('cardName')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="cardExpiry"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Expiry (MM/YY)"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="08/29"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      error={errors.cardExpiry?.message}
                    />
                  )}
                />

                <Input
                  label="CVC"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  placeholder="424"
                  error={errors.cardCvc?.message}
                  {...register('cardCvc')}
                />
              </div>
            </div>
          )}

          {/* Tab 2: UPI / QR Code */}
          {onlineTab === 'upi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-sable-card-beige border border-sable-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sable-brown" />
                    <span className="font-mono text-xs uppercase tracking-btn text-sable-black font-medium">
                      Instant UPI Payment
                    </span>
                  </div>
                  <Badge variant="neutral">Zero Gateway Fee</Badge>
                </div>
                <p className="text-xs text-sable-muted leading-relaxed">
                  Enter your VPA / UPI ID or select an app below to request payment on your mobile device.
                </p>
              </div>

              <Input
                label="UPI ID / VPA"
                placeholder="e.g. yourname@okhdfcbank or mobile@paytm"
                error={errors.upiId?.message}
                {...register('upiId')}
              />

              <div>
                <p className="font-mono text-[10px] uppercase tracking-btn text-sable-muted mb-1.5">
                  POPULAR UPI HANDLES:
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_UPI_HANDLES.map((h) => (
                    <button
                      key={h.label}
                      type="button"
                      onClick={() => {
                        if (setValue) setValue('upiId', `client${h.suffix}`, { shouldValidate: true });
                      }}
                      className="font-mono text-[10px] uppercase tracking-btn px-2.5 py-1 bg-sable-white border border-sable-border text-sable-black hover:border-sable-brown transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sable-brown" />
                      {h.label} ({h.suffix})
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR Scan Box */}
              <div className="p-4 border border-sable-border bg-sable-white flex items-center gap-4">
                <div className="w-20 h-20 bg-sable-card-beige border border-sable-border flex flex-col items-center justify-center p-2 text-center shrink-0">
                  <QrCode className="w-10 h-10 text-sable-black mb-1" />
                  <span className="font-mono text-[8px] uppercase tracking-wider text-sable-brown">
                    UPI SCAN
                  </span>
                </div>
                <div>
                  <p className="font-serif text-sm font-semibold text-sable-black">
                    Scan &amp; Pay on Mobile
                  </p>
                  <p className="text-xs text-sable-muted mt-0.5 leading-relaxed">
                    A secure dynamic QR code will be presented immediately upon confirmation for instant payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Netbanking */}
          {onlineTab === 'netbanking' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-sable-card-beige border border-sable-border flex items-center gap-2 text-xs text-sable-muted">
                <Building2 className="w-4 h-4 text-sable-brown shrink-0" />
                <span>Select your bank for a direct 256-bit encrypted netbanking session.</span>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-btn text-sable-muted mb-1.5">
                  Select Bank
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_BANKS.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-2 p-2.5 bg-sable-white border border-sable-border text-xs text-sable-black hover:border-sable-brown cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        value={b}
                        defaultChecked={b === 'HDFC Bank'}
                        className="accent-sable-black"
                        {...register('netbankingBank')}
                      />
                      <span className="truncate">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* CASH ON DELIVERY CONTENT (COD) */}
      {/* ────────────────────────────────────────────────────────── */}
      {isCOD && (
        <div className="p-5 bg-sable-card-beige border border-sable-brown/30 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sable-brown" />
                <h4 className="font-serif text-base text-sable-black font-semibold">
                  Cash on Delivery Confirmed
                </h4>
              </div>
              <p className="text-xs text-sable-muted mt-1 leading-relaxed">
                Your order will be prepared and packed in our Milan atelier. Pay with cash or UPI QR upon courier arrival at your shipping address.
              </p>
            </div>
            <Badge variant="success">Available for your area</Badge>
          </div>

          <div className="p-3.5 bg-sable-white border border-sable-border space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-sable-border">
              <span className="text-sable-muted">Total Payable on Handover:</span>
              <span className="font-mono text-sm font-semibold text-sable-black">
                {totals ? formatCurrency(totals.total, currency) : 'Payable on arrival'}
              </span>
            </div>
            <div className="space-y-1.5 text-sable-muted text-[11px]">
              <p className="flex items-center gap-1.5 text-sable-black font-medium">
                <Check className="w-3.5 h-3.5 text-sable-brown" />
                Zero prepayment or credit card required online.
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-sable-brown" />
                Courier delivers in a tamper-evident sealed luxury Maison SABLE box.
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-sable-brown" />
                Digital payment (UPI / QR) accepted by courier at your door.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
