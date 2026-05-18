import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ChevronDown, Plus, Trash2, Building } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TopBarProps {
  onSync: () => void;
  isSyncing: boolean;
  lastSynced: string;
}

const TopBar: React.FC<TopBarProps> = ({ onSync, isSyncing, lastSynced }) => {
  const { 
    dateRange, 
    setDateRange, 
    currency, 
    setCurrency, 
    isConnected,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    deleteWorkspace,
    userPlan
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleAddWorkspace = () => {
    const name = prompt('Digite o nome do novo Cliente ou Workspace:');
    if (name && name.trim()) {
      addWorkspace(name.trim());
    }
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

      {/* Right: Workspaces Dropdown + Sync + Status */}
      <div className="flex items-center gap-3">
        {/* Workspace Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-2 hover:border-white/10 text-xs font-semibold text-white transition-all outline-none"
          >
            <Building size={13} className="text-primary shrink-0" />
            <span className="max-w-[120px] truncate">{activeWs.name}</span>
            <ChevronDown size={12} className={`text-[--color-text-secondary] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border bg-surface shadow-2xl p-1.5 space-y-1 z-50">
              <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-[10px] font-bold text-[--color-text-muted] uppercase tracking-wider">Seus Clientes</span>
                {userPlan !== 'solo' && (
                  <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {workspaces.length}/5
                  </span>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={`group flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer
                      ${ws.id === activeWorkspaceId 
                        ? 'bg-primary/10 text-white' 
                        : 'text-[--color-text-secondary] hover:bg-white/5 hover:text-white'}`}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-1.5 h-1.5 rounded-full ${ws.isConnected ? 'bg-success' : 'bg-danger'}`} />
                      <span className="truncate">{ws.name}</span>
                    </div>

                    {ws.id !== 'default' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deseja excluir o workspace "${ws.name}"?`)) {
                            deleteWorkspace(ws.id);
                          }
                        }}
                        className="text-[--color-text-muted] hover:text-danger p-1 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-1.5">
                <button
                  onClick={handleAddWorkspace}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all"
                >
                  <Plus size={13} />
                  Adicionar Cliente
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border" />

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
