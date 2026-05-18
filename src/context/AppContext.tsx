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

export interface Workspace {
  id: string;
  name: string;
  apiKey: string;
  isConnected: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'manager' | 'viewer';
  status: 'active' | 'pending';
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
  customLogo: string;
  setCustomLogo: (url: string) => void;
  customName: string;
  setCustomName: (name: string) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string) => boolean;
  deleteWorkspace: (id: string) => void;
  teamMembers: TeamMember[];
  inviteTeamMember: (email: string) => boolean;
  removeTeamMember: (id: string) => void;
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
  const [customLogo, setCustomLogoState] = useState(() => localStorage.getItem('@reddash:custom_logo') || '');
  const [customName, setCustomNameState] = useState(() => localStorage.getItem('@reddash:custom_name') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Workspaces (Clients)
  const [workspaces, setWorkspacesState] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('@reddash:workspaces');
    if (saved) return JSON.parse(saved);
    return [{ id: 'default', name: 'Workspace Padrão', apiKey: localStorage.getItem('@reddash:api_key') || '', isConnected: localStorage.getItem('@reddash:api_key') !== null }];
  });
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() => {
    return localStorage.getItem('@reddash:active_workspace_id') || 'default';
  });

  // Team Members
  const [teamMembers, setTeamMembersState] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('@reddash:team_members');
    return saved ? JSON.parse(saved) : [
      { id: '1', email: 'afiliado.parceiro@gmail.com', role: 'manager', status: 'active' },
      { id: '2', email: 'designer.copys@hotmail.com', role: 'viewer', status: 'pending' }
    ];
  });

  // Wrappers that also persist to localStorage
  const setApiKey = (key: string) => {
    localStorage.setItem('@reddash:api_key', key);
    setApiKeyState(key);
    // Sync to active workspace
    setWorkspacesState(prev => {
      const updated = prev.map(w => w.id === activeWorkspaceId ? { ...w, apiKey: key, isConnected: key !== '' } : w);
      localStorage.setItem('@reddash:workspaces', JSON.stringify(updated));
      return updated;
    });
  };
  const setIsConnected = (connected: boolean) => {
    setIsConnectedState(connected);
    // Sync to active workspace
    setWorkspacesState(prev => {
      const updated = prev.map(w => w.id === activeWorkspaceId ? { ...w, isConnected: connected } : w);
      localStorage.setItem('@reddash:workspaces', JSON.stringify(updated));
      return updated;
    });
  };
  const setCurrency = (c: 'USD' | 'BRL' | 'EUR') => {
    localStorage.setItem('@reddash:currency', c);
    setCurrencyState(c);
  };
  const setUserPlan = (plan: 'solo' | 'agency' | 'enterprise') => {
    localStorage.setItem('@reddash:user_plan', plan);
    setUserPlanState(plan);
  };
  const setCustomLogo = (url: string) => {
    localStorage.setItem('@reddash:custom_logo', url);
    setCustomLogoState(url);
  };
  const setCustomName = (name: string) => {
    localStorage.setItem('@reddash:custom_name', name);
    setCustomNameState(name);
  };

  const setActiveWorkspaceId = (id: string) => {
    localStorage.setItem('@reddash:active_workspace_id', id);
    setActiveWorkspaceIdState(id);
    const ws = workspaces.find(w => w.id === id);
    if (ws) {
      setApiKeyState(ws.apiKey);
      setIsConnectedState(ws.isConnected);
    }
  };

  const addWorkspace = (name: string): boolean => {
    if (userPlan === 'solo') {
      alert('Recurso exclusivo do Plano Agency ou Enterprise! Faça o upgrade para cadastrar múltiplos clientes.');
      return false;
    }
    if (workspaces.length >= 5) {
      alert('Você atingiu o limite de 5 clientes permitidos no seu plano atual.');
      return false;
    }
    const newWs: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      apiKey: '',
      isConnected: false
    };
    const updated = [...workspaces, newWs];
    localStorage.setItem('@reddash:workspaces', JSON.stringify(updated));
    setWorkspacesState(updated);
    setActiveWorkspaceId(newWs.id);
    return true;
  };

  const deleteWorkspace = (id: string) => {
    if (id === 'default') {
      alert('O Workspace padrão de faturamento do anunciante principal não pode ser deletado.');
      return;
    }
    const updated = workspaces.filter(w => w.id !== id);
    localStorage.setItem('@reddash:workspaces', JSON.stringify(updated));
    setWorkspacesState(updated);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId('default');
    }
  };

  const inviteTeamMember = (email: string): boolean => {
    if (userPlan === 'solo') {
      alert('O Plano Solo é restrito a apenas 1 usuário. Faça o upgrade para o Plano Agency para gerenciar equipe!');
      return false;
    }
    if (teamMembers.length >= 5) {
      alert('Você atingiu o limite máximo de 5 membros de equipe do plano de agência.');
      return false;
    }
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: 'viewer',
      status: 'pending'
    };
    const updated = [...teamMembers, newMember];
    localStorage.setItem('@reddash:team_members', JSON.stringify(updated));
    setTeamMembersState(updated);
    return true;
  };

  const removeTeamMember = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    localStorage.setItem('@reddash:team_members', JSON.stringify(updated));
    setTeamMembersState(updated);
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
      setUserPlan,
      customLogo,
      setCustomLogo,
      customName,
      setCustomName,
      workspaces,
      activeWorkspaceId,
      setActiveWorkspaceId,
      addWorkspace,
      deleteWorkspace,
      teamMembers,
      inviteTeamMember,
      removeTeamMember
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
