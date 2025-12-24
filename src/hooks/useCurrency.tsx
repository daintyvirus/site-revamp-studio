import { createContext, useContext, useState, ReactNode } from 'react';
import { useSiteSettings } from './useSiteSettings';

type Currency = 'BDT' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number) => string;
  showToggle: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('preferred_currency');
    return (saved === 'USD' || saved === 'BDT') ? saved : 'BDT';
  });

  const exchangeRate = parseFloat(settings?.usd_to_bdt_rate || '110');
  const showToggle = settings?.show_currency_toggle === 'true';

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const convertPrice = (priceUSD: number): number => {
    if (currency === 'USD') return priceUSD;
    return priceUSD * exchangeRate;
  };

  const formatPrice = (priceUSD: number): string => {
    const converted = convertPrice(priceUSD);
    if (currency === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    return `৳${Math.round(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRate,
      convertPrice,
      formatPrice,
      showToggle
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
