import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, code: 'USD' },
  EUR: { symbol: '€', rate: 0.92, code: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, code: 'GBP' },
  JPY: { symbol: '¥', rate: 155.0, code: 'JPY' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  const formatPrice = (amountInUSD) => {
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * cur.rate;
    if (currency === 'JPY') {
      return `${cur.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${cur.symbol}${converted.toFixed(0)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
