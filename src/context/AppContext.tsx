import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  productCost: number;
  taxRate: number;
  platformFee: number;
  otherFees: number;
}

interface DateRange {
  from: string;
  to: string;
  label: string;
}

interface AppContextType {
  apiKey: string;
  isConnected: boolean;
  dateRange: DateRange;
  currency: 'USD' | 'BRL' | 'EUR';
  products: Product[];
  setApiKey: (key: string) => void;
  setIsConnected: (connected: boolean) => void;
  setDateRange: (range: DateRange) => void;
  setCurrency: (currency: 'USD' | 'BRL' | 'EUR') => void;
  setProducts: (products: Product[]) => void;
  updateProduct: (product: Product) => void;
  saveToSupabase: () => Promise<void>;
  refreshKey: number;
  refreshData: () => void;
  userPlan: 'solo' | 'agency' | 'enterprise';
  setUserPlan: (plan: 'solo' | 'agency' | 'enterprise') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultDateRange = (): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
    label: 'Last 7d'
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('@reddash:api_key') || '');
  const [isConnected, setIsConnectedState] = useState(() => localStorage.getItem('@reddash:api_key') !== null && localStorage.getItem('@reddash:api_key') !== '');
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [currency, setCurrencyState] = useState<'USD' | 'BRL' | 'EUR'>(() => (localStorage.getItem('@reddash:currency') as 'USD' | 'BRL' | 'EUR') || 'USD');
  const [userPlan, setUserPlanState] = useState<'solo' | 'agency' | 'enterprise'>(() => (localStorage.getItem('@reddash:user_plan') as 'solo' | 'agency' | 'enterprise') || 'solo');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Wrappers that also persist to localStorage
  const setApiKey = (key: string) => {
    localStorage.setItem('@reddash:api_key', key);
    setApiKeyState(key);
  };
  const setIsConnected = (connected: boolean) => {
    setIsConnectedState(connected);
  };
  const setCurrency = (c: 'USD' | 'BRL' | 'EUR') => {
    localStorage.setItem('@reddash:currency', c);
    setCurrencyState(c);
  };
  const setUserPlan = (plan: 'solo' | 'agency' | 'enterprise') => {
    localStorage.setItem('@reddash:user_plan', plan);
    setUserPlanState(plan);
  };

  // Load from Supabase on Mount — skip if URL is clearly invalid
  useEffect(() => {
    const loadData = async () => {
      // Only attempt if env vars are set
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setLoading(false);
        return;
      }
      try {
        const { data: config, error } = await supabase
          .from('reddash_config')
          .select('*')
          .single();

        if (config && !error) {
          if (config.api_key) {
            setApiKey(config.api_key);
            setIsConnected(true);
          }
          if (config.currency) setCurrency(config.currency);
          if (config.products) setProducts(config.products);
        }
      } catch {
        // Silent fallback — Supabase unreachable
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const saveToSupabase = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;
    try {
      await supabase.from('reddash_config').upsert({
        id: 1,
        api_key: apiKey,
        currency,
        products
      });
    } catch {
      // Silent — Supabase unreachable
    }
  };

  // Auto-save when products or key change
  useEffect(() => {
    if (!loading) {
      saveToSupabase();
    }
  }, [apiKey, currency, products, loading]);

  const updateProduct = (product: Product) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id || p.name === product.name);
      if (index >= 0) {
        const newProducts = [...prev];
        newProducts[index] = product;
        return newProducts;
      }
      return [...prev, product];
    });
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => setRefreshKey(prev => prev + 1);

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      isConnected, setIsConnected,
      dateRange, setDateRange,
      currency, setCurrency,
      products, setProducts,
      updateProduct,
      saveToSupabase,
      refreshKey,
      refreshData,
      userPlan,
      setUserPlan
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
