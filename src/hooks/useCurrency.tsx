import { createContext, useContext, useState, ReactNode } from 'react';
import { useSiteSettings } from './useSiteSettings';

type Currency = 'BDT' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertFromBDT: (priceBDT: number) => number;
  formatPrice: (priceBDT: number, priceUSD?: number) => string;
  formatPriceValue: (priceBDT: number, priceUSD?: number) => number;
  showToggle: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('preferred_currency');
    if (saved === 'USD' || saved === 'BDT') return saved;
    return 'BDT'; // Default to BDT
  });

  // Rate is BDT per USD (e.g., 110 means $1 = ৳110)
  const exchangeRate = parseFloat(settings?.usd_to_bdt_rate || '110');
  const showToggle = settings?.show_currency_toggle === 'true';

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  // Convert from BDT to USD
  const convertFromBDT = (priceBDT: number): number => {
    if (currency === 'BDT') return priceBDT;
    return priceBDT / exchangeRate;
  };

  // Format price - uses BDT as base, optionally accepts explicit USD price
  const formatPrice = (priceBDT: number, priceUSD?: number): string => {
    if (currency === 'USD') {
      // Use explicit USD price if provided, otherwise convert from BDT
      const usdValue = priceUSD !== undefined ? priceUSD : priceBDT / exchangeRate;
      return `$${usdValue.toFixed(2)}`;
    }
    return `৳${Math.round(priceBDT).toLocaleString()}`;
  };

  // Get numeric price value
  const formatPriceValue = (priceBDT: number, priceUSD?: number): number => {
    if (currency === 'USD') {
      return priceUSD !== undefined ? priceUSD : priceBDT / exchangeRate;
    }
    return priceBDT;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRate,
      convertFromBDT,
      formatPrice,
      formatPriceValue,
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
