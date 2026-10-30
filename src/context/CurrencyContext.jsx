'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => {},
  country: 'IN',
  isDomestic: true,
  symbol: '₹',
  formatPrice: () => '',
  getPrice: () => ({ amount: 0, currency: 'INR', symbol: '₹', formatted: 'FREE' }),
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('INR');
  const [country, setCountry] = useState('IN');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Check if geo is already cached in this session to prevent repeated requests
    try {
      localStorage.removeItem('dwb_currency');
      const cached = sessionStorage.getItem('dwb_geo');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.country && parsed?.currency) {
          setCountry(parsed.country);
          setCurrencyState(parsed.currency);
          setInitialized(true);
          return;
        }
      }
    } catch (e) {}

    // 2. Fetch server-detected country & default currency once per session
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const detectedCountry = data.country || 'IN';
        setCountry(detectedCountry);
        const autoCur = data.currency || (detectedCountry === 'IN' ? 'INR' : 'USD');
        setCurrencyState(autoCur);
        try {
          sessionStorage.setItem('dwb_geo', JSON.stringify({ country: detectedCountry, currency: autoCur }));
        } catch (e) {}
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, []);

  const setCurrency = (newCurrency) => {
    if (newCurrency !== 'INR' && newCurrency !== 'USD') return;
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('dwb_currency', newCurrency);
    } catch (e) {}
  };

  const isDomestic = country === 'IN';
  const symbol = currency === 'USD' ? '$' : '₹';

  const formatPrice = useMemo(() => {
    return (product) => {
      if (!product) return 'FREE';
      const isFree =
        String(product.type).toLowerCase() === 'free' ||
        (Number(product.price || 0) === 0 && Number(product.priceUSD || 0) === 0);

      if (isFree) return 'FREE';

      if (currency === 'USD') {
        const usdVal =
          Number(product.priceUSD || 0) > 0
            ? Number(product.priceUSD)
            : Math.max(1, Math.round(Number(product.price || 0) / 83));
        return `$${usdVal}`;
      }

      return `₹${Number(product.price || 0).toLocaleString()}`;
    };
  }, [currency]);

  const getPrice = useMemo(() => {
    return (product) => {
      if (!product) {
        return { amount: 0, currency, symbol, formatted: 'FREE' };
      }
      const isFree =
        String(product.type).toLowerCase() === 'free' ||
        (Number(product.price || 0) === 0 && Number(product.priceUSD || 0) === 0);

      if (isFree) {
        return { amount: 0, currency, symbol, formatted: 'FREE' };
      }

      if (currency === 'USD') {
        const usdVal =
          Number(product.priceUSD || 0) > 0
            ? Number(product.priceUSD)
            : Math.max(1, Math.round(Number(product.price || 0) / 83));
        return {
          amount: usdVal,
          currency: 'USD',
          symbol: '$',
          formatted: `$${usdVal}`,
        };
      }

      const inrVal = Number(product.price || 0);
      return {
        amount: inrVal,
        currency: 'INR',
        symbol: '₹',
        formatted: `₹${inrVal.toLocaleString()}`,
      };
    };
  }, [currency, symbol]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        country,
        isDomestic,
        symbol,
        formatPrice,
        getPrice,
        initialized,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

