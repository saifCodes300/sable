import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { calcTotals } from '../utils/calcTotals';
import { formatCurrency } from '../utils/formatCurrency';
import {
  detectCardBrand,
  isValidExpiry,
  isValidLuhn,
  stripCardDigits,
} from '../utils/cardValidation';
import { placeOrder } from '../api/orders';
import { getTranslation } from '../data/i18n';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { SableSeal } from '../components/ui/SableSeal';
import { ProductImage } from '../components/ui/ProductImage';
import { CheckoutSection } from '../components/checkout/CheckoutSection';
import { ShippingMethodOption } from '../components/checkout/ShippingMethodOption';
import { PaymentForm } from '../components/checkout/PaymentForm';

const SAVED_ADDRESS_KEY = 'sable_checkout_address';

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'France',
  'Italy',
  'Germany',
  'Spain',
  'Bangladesh',
  'Japan',
  'Australia',
].map((c) => ({ value: c, label: c }));

const checkoutSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    newsletter: z.boolean().optional(),
    firstName: z.string().min(2, 'First name is required.'),
    lastName: z.string().min(2, 'Last name is required.'),
    address: z.string().min(5, 'Street address is required.'),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State or region is required.'),
    zip: z.string().min(3, 'ZIP / Postal code is required.'),
    country: z.string().min(2, 'Country is required.'),
    phone: z.string().min(7, 'Phone number is required for delivery updates.'),
    paymentMethod: z.enum(['card', 'upi', 'netbanking', 'cod']).default('card'),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    upiId: z.string().optional(),
    netbankingBank: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'card') {
      if (!data.cardNumber || !isValidLuhn(data.cardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardNumber'],
          message: 'Please enter a valid card number (Luhn check failed).',
        });
      }
      if (!data.cardName || data.cardName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardName'],
          message: 'Name on card is required.',
        });
      }
      if (!data.cardExpiry || !isValidExpiry(data.cardExpiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardExpiry'],
          message: 'Enter a valid future expiry date (MM/YY).',
        });
      }
      if (!data.cardCvc || !/^\d{3,4}$/.test(data.cardCvc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardCvc'],
          message: 'Enter a valid 3 or 4 digit CVC.',
        });
      }
    } else if (data.paymentMethod === 'upi') {
      if (!data.upiId || !data.upiId.includes('@')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['upiId'],
          message: 'Please enter a valid UPI ID (e.g. mobile@upi or name@bank).',
        });
      }
    }
  });

function loadSavedAddress() {
  try {
    const raw = window.localStorage.getItem(SAVED_ADDRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, promo, clearCart } = useCartStore();
  const { user, updateUserProfile } = useAuthStore();
  const { currency, language } = useUiStore();
  const t = getTranslation(language);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [submitting, setSubmitting] = useState(false);
  const placedOrderRef = useRef(false);

  const savedAddr = user ? (user.savedAddress || null) : loadSavedAddress();
  const initialFirstName = user?.firstName || savedAddr?.firstName || '';
  const initialLastName = user?.lastName || savedAddr?.lastName || '';

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      newsletter: true,
      firstName: initialFirstName,
      lastName: initialLastName,
      address: savedAddr?.address || '',
      city: savedAddr?.city || '',
      state: savedAddr?.state || '',
      zip: savedAddr?.zip || '',
      country: savedAddr?.country || (currency === 'INR' ? 'India' : 'United States'),
      phone: user?.phone || savedAddr?.phone || '',
      paymentMethod: 'card',
      cardNumber: '',
      cardName: initialFirstName && initialLastName ? `${initialFirstName} ${initialLastName}` : '',
      cardExpiry: '',
      cardCvc: '',
      upiId: '',
      netbankingBank: 'HDFC Bank',
    },
  });

  const paymentMethod = watch('paymentMethod') || 'card';
  const setPaymentMethod = (method) => {
    setValue('paymentMethod', method, { shouldValidate: true });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setCheckoutValue = setValue;
    }
  }, [setValue]);

  useEffect(() => {
    if (items.length === 0 && !placedOrderRef.current) {
      navigate('/bag', { replace: true });
    }
  }, [items.length, navigate]);

  const cardNumberValue = watch('cardNumber');
  const totals = calcTotals({ items, promo, shippingMethod });

  const onInvalid = (formErrors) => {
    const firstKey = Object.keys(formErrors)[0];
    if (firstKey) {
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
    }
    toast.error('Please review the highlighted fields before placing your order.');
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const shippingAddress = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        zip: values.zip.trim(),
        country: values.country,
        phone: values.phone.trim(),
      };

      // Save shipping address to localStorage (and user profile if logged in)
      window.localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(shippingAddress));
      if (user) {
        updateUserProfile({ savedAddress: shippingAddress }).catch(() => {});
      }

      const activeMethod = values.paymentMethod || paymentMethod || 'card';
      const isCod = activeMethod === 'cod';
      const isUpi = activeMethod === 'upi';
      const isNetbanking = activeMethod === 'netbanking';
      const digits = !isCod && values.cardNumber ? stripCardDigits(values.cardNumber) : '';

      const res = await placeOrder({
        userId: user?.id || null,
        contact: {
          email: values.email.trim(),
          newsletter: Boolean(values.newsletter),
        },
        shippingAddress,
        shippingMethod,
        promo,
        items,
        totals,
        paymentMethod: activeMethod,
        paymentBrand: isCod
          ? 'Cash on Delivery'
          : isUpi
            ? 'UPI Online'
            : isNetbanking
              ? `Netbanking (${values.netbankingBank || 'Bank'})`
              : (detectCardBrand(values.cardNumber) || 'Card'),
        paymentLast4: isCod || isUpi || isNetbanking ? '' : digits.slice(-4),
        upiId: isUpi ? values.upiId : '',
        netbankingBank: isNetbanking ? values.netbankingBank : '',
      });

      placedOrderRef.current = true;
      clearCart();
      toast.success(isCod ? 'Cash on Delivery order placed.' : 'Online payment confirmed.');
      navigate(`/order/${res.data.id}`, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Unable to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !placedOrderRef.current) {
    return null;
  }

  return (
    <div className="bg-sable-beige min-h-screen">
      <Helmet>
        <title>Checkout — SABLE</title>
      </Helmet>

      {/* Header */}
      <div className="border-b border-sable-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Bag', to: '/bag' },
              { label: 'Checkout' },
            ]}
          />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-sable-black mt-4">
            Checkout
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: 4 Numbered Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact */}
            <CheckoutSection number="1" title="Contact">
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Checkbox
                  label="Email me with new arrivals and previews"
                  {...register('newsletter')}
                />
              </div>
            </CheckoutSection>

            {/* 2. Shipping Address */}
            <CheckoutSection number="2" title="Shipping address">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label="Last name"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>

                <Input
                  label="Address"
                  autoComplete="street-address"
                  placeholder="Street address, apartment, suite"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    autoComplete="address-level2"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State / Region"
                    autoComplete="address-level1"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                  <Input
                    label="ZIP / Postal"
                    autoComplete="postal-code"
                    error={errors.zip?.message}
                    {...register('zip')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    options={COUNTRIES}
                    error={errors.country?.message}
                    {...register('country')}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (212) 555-0194"
                    helperText="For delivery updates"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
              </div>
            </CheckoutSection>

            {/* 3. Shipping Method */}
            <CheckoutSection number="3" title="Shipping method">
              <div className="space-y-3">
                <ShippingMethodOption
                  id="shipping-standard"
                  name="shippingMethod"
                  title="Standard"
                  description="5–7 business days · Tracked courier"
                  priceLabel={
                    totals.standardShippingCost === 0
                      ? 'Free'
                      : formatCurrency(totals.standardShippingCost, currency)
                  }
                  selected={shippingMethod === 'standard'}
                  onSelect={() => setShippingMethod('standard')}
                />
                <ShippingMethodOption
                  id="shipping-express"
                  name="shippingMethod"
                  title="Express"
                  description="2–3 business days · Priority air courier"
                  priceLabel={formatCurrency(totals.expressShippingCost, currency)}
                  selected={shippingMethod === 'express'}
                  onSelect={() => setShippingMethod('express')}
                />
              </div>
            </CheckoutSection>

            {/* 4. Payment */}
            <CheckoutSection
              number="4"
              title="Payment"
              rightHeader={
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-btn text-sable-muted">
                  <Lock className="w-3.5 h-3.5 text-sable-brown" />
                  {paymentMethod === 'cod' ? 'Pay Upon Arrival' : '256-Bit Encrypted'}
                </span>
              }
            >
              <PaymentForm
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                cardNumberValue={cardNumberValue}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                currency={currency}
                totals={totals}
              />
            </CheckoutSection>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-sable-card-beige border border-sable-border p-6 sm:p-7 space-y-6 sticky top-24">
              <p className="font-mono text-xs uppercase tracking-btn text-sable-black font-medium">
                {t.bag.orderSummary}
              </p>

              {/* Item Rows */}
              <div className="divide-y divide-sable-border max-h-[300px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.key} className="py-3.5 first:pt-0 flex items-center gap-3.5">
                    <div className="w-14 h-16 border border-sable-border shrink-0 overflow-hidden bg-sable-white">
                      <ProductImage src={item.image} alt={item.name} label={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-sable-black truncate">{item.name}</p>
                      <p className="text-xs text-sable-muted mt-0.5">
                        Qty {item.quantity} · {item.color} · {item.size}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-sable-black shrink-0">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-sable-border pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-sable-muted">{t.bag.subtotal}</span>
                  <span className="font-mono text-sable-black">
                    {formatCurrency(totals.subtotal, currency)}
                  </span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-sable-brown">
                    <span>Discount ({promo?.code})</span>
                    <span className="font-mono">
                      −{formatCurrency(totals.discount, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sable-muted">{t.bag.shipping}</span>
                  <span className="font-mono text-sable-black">
                    {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping, currency)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sable-muted">{t.bag.estimatedTax}</span>
                  <span className="font-mono text-sable-black">
                    {formatCurrency(totals.tax, currency)}
                  </span>
                </div>
              </div>

              <div className="border-t border-sable-border pt-4 flex items-center justify-between">
                <span className="font-medium text-sable-black">{t.bag.total}</span>
                <span className="font-mono text-xl font-semibold text-sable-black">
                  {formatCurrency(totals.total, currency)}
                </span>
              </div>

              <Button type="submit" fullWidth size="lg" loading={submitting}>
                {paymentMethod === 'cod'
                  ? `CONFIRM CASH ON DELIVERY — ${formatCurrency(totals.total, currency)}`
                  : `PAY ONLINE & CONFIRM — ${formatCurrency(totals.total, currency)}`}
              </Button>

              {/* S-seal Atelier Note */}
              <div className="pt-4 border-t border-sable-border flex items-center gap-4">
                <SableSeal size={48} />
                <p className="text-xs text-sable-muted leading-relaxed">
                  Packed and shipped from our atelier, within 2-4 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
