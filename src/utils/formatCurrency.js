import { CURRENCIES } from '../data/i18n';

/**
 * Formats a USD base amount into the active currency using static exchange rates.
 */
export function formatCurrency(amountUSD, currencyCode = 'USD', options = {}) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = Number(amountUSD || 0) * currency.rate;
  const { showDecimals = true } = options;

  const isWhole = Math.abs(converted - Math.round(converted)) < 0.005;
  const fractionDigits =
    currencyCode === 'BDT' || currencyCode === 'INR'
      ? 0
      : showDecimals
        ? 2
        : isWhole
          ? 0
          : 2;

  const formattedNumber = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);

  return `${currency.symbol}${formattedNumber}`;
}

export function formatWholeCurrency(amountUSD, currencyCode = 'USD') {
  return formatCurrency(amountUSD, currencyCode, { showDecimals: false });
}
