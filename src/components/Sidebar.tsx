import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Wallet, 
  Settings, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { isConnected } = useAppContext();
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'financial', label: 'Financial', icon: Wallet },
    { id: 'integrations', label: 'Integrações', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 z-50 flex flex-col
        ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-white">
            RedDash
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium
                ${isActive 
                  ? 'bg-primary/10 text-white' 
                  : 'text-[--color-text-secondary] hover:bg-white/5 hover:text-[--color-text-primary]'}
                ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-border space-y-1">
        {/* API Status */}
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-success' : 'bg-danger'}`} />
          {!collapsed && (
            <span className="text-xs font-medium text-[--color-text-secondary]">
              {isConnected ? 'API Connected' : 'Disconnected'}
            </span>
          )}
        </div>

        {/* Collapse button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[--color-text-secondary] hover:bg-white/5 hover:text-[--color-text-primary] transition-all text-sm font-medium
            ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed 
            ? <ChevronRight className="w-4 h-4 shrink-0" />
            : <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Collapse</span>
              </>
          }
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
