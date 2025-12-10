export const getCurrency = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'NGN';
  return currency;
};

export const formatCurrency = (amount: number) => {
  const currency = getCurrency();
  // Use en-NG for NGN to get the Naira symbol correctly, en-US for USD
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
