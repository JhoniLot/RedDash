import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TopBarProps {
  onSync: () => void;
  isSyncing: boolean;
  lastSynced: string;
}

const TopBar: React.FC<TopBarProps> = ({ onSync, isSyncing, lastSynced }) => {
  const { dateRange, setDateRange, currency, setCurrency, isConnected } = useAppContext();

  const ranges = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7d', days: 7 },
    { label: 'Last 30d', days: 30 },
  ];

  const handleRangeChange = (label: string, days: number) => {
    const to = new Date();
    const from = new Date();
    if (label === 'Yesterday') {
      to.setDate(to.getDate() - 1);
      from.setDate(from.getDate() - 1);
    } else {
      from.setDate(to.getDate() - days);
    }
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      label
    });
  };

  return (
    <header className="h-14 border-b border-border bg-surface sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left: Date ranges + Currency */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0.5">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => handleRangeChange(r.label, r.days)}
              style={dateRange.label === r.label ? { background: 'rgba(255,255,255,0.07)', color: '#E8EAF0' } : {}}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${dateRange.label === r.label 
                  ? '' 
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-white/5'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-0.5">
          {(['USD', 'BRL', 'EUR'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={currency === c ? { background: 'rgba(255,255,255,0.07)', color: '#E8EAF0' } : {}}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${currency === c 
                  ? '' 
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-white/5'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Sync + Status */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[--color-text-secondary] font-mono hidden sm:block">
          {lastSynced}
        </span>
        
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 rounded-md border border-border bg-surface-2 text-[--color-text-secondary] hover:text-[--color-text-primary] hover:border-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[10px] font-semibold uppercase tracking-widest
          ${isConnected 
            ? 'bg-success/8 border-success/20 text-success' 
            : 'bg-white/5 border-border text-[--color-text-secondary]'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success' : 'bg-[--color-text-muted]'}`} />
          {isConnected ? 'Live' : 'Demo'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
