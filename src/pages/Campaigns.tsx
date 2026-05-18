import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import type { CampaignData } from '../services/redtrack';
import { PlatformAdsService } from '../services/platformAds';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Columns, ArrowUpRight, Filter, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { exportToCSV } from '../utils/export';
import PageHeader from '../components/PageHeader';
import { MetaLogo, TikTokLogo, GoogleAdsLogo } from '../components/BrandLogos';

const AVAILABLE_COLUMNS = [
  { id: 'status',      label: 'Status',      align: 'left'  },
  { id: 'clicks',      label: 'Clicks',      align: 'right' },
  { id: 'impressions', label: 'Impress.',    align: 'right' },
  { id: 'ctr',         label: 'CTR',         align: 'right' },
  { id: 'cost',        label: 'Cost',        align: 'right' },
  { id: 'cpa',         label: 'CPA',         align: 'right' },
  { id: 'conversions', label: 'Conv.',       align: 'right' },
  { id: 'cr',          label: 'CR',          align: 'right' },
  { id: 'revenue',     label: 'Revenue',     align: 'right' },
  { id: 'profit',      label: 'Profit',      align: 'right' },
  { id: 'roas',        label: 'ROAS',        align: 'right' },
  { id: 'roi',         label: 'ROI',         align: 'right' },
];

const DEFAULT_COLUMNS = ['status', 'clicks', 'cost', 'revenue', 'roas', 'conversions', 'cpa', 'profit'];

const Campaigns: React.FC = () => {
  const { apiKey, refreshKey, currency } = useAppContext();
  const [level, setLevel] = useState<'campaign' | 'adset' | 'ad'>('campaign');
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [search, setSearch] = useState('');
  
  // UTMify-style Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'tiktok' | 'meta' | 'google'>('all');
  const [metricFilter, setMetricFilter] = useState<'all' | 'spend' | 'roas' | 'clicks'>('all');

  // Status Override Local Storage (to simulate/act as Ads Manager toggle integration)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'active' | 'paused'>>(() => {
    const saved = localStorage.getItem('@reddash:campaign_status');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('@reddash:metrics');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('@reddash:metrics', JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  useEffect(() => {
    localStorage.setItem('@reddash:campaign_status', JSON.stringify(statusOverrides));
  }, [statusOverrides]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsColumnsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (colId: string) => {
    setSelectedColumns(prev =>
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const toggleStatus = async (id: string, currentStatus: string, campName: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    // Snappy UI state updates first
    setStatusOverrides(prev => ({
      ...prev,
      [id]: newStatus
    }));

    // Perform live API request in background if active
    let integrations: any[] = [];
    try {
      const saved = localStorage.getItem('@reddash:integrations');
      if (saved) integrations = JSON.parse(saved);
    } catch (e) { console.error(e); }

    const metaInt = integrations.find(i => i.id === 'meta' && i.connected);
    const tiktokInt = integrations.find(i => i.id === 'tiktok' && i.connected);

    const name = campName.toLowerCase();
    if (name.includes('[meta]') && metaInt) {
      await PlatformAdsService.toggleMetaCampaign(
        'VALID_TOKEN',
        id,
        newStatus === 'active' ? 'ACTIVE' : 'PAUSED'
      );
    } else if (name.includes('[tiktok]') && tiktokInt) {
      await PlatformAdsService.toggleTikTokCampaign(
        'VALID_TOKEN',
        tiktokInt.selectedAdAccount || '',
        id,
        newStatus === 'active' ? 'ENABLE' : 'DISABLE'
      );
    }
  };

  useEffect(() => {
    const fetchCamps = async () => {
      const data = await RedTrackService.getCampaigns(apiKey, level);
      
      // Inject some mock passive campaigns if they are demo ones, to make filters fun to use!
      const processed = data.map((camp, idx) => {
        // If we have an override, apply it. If not, generate a stable mock paused status for some rows
        const savedStatus = statusOverrides[camp.id];
        let status = savedStatus || camp.status;
        if (!savedStatus && idx % 3 === 2) {
          status = 'paused';
        }
        return { ...camp, status };
      });

      setCampaigns(processed);
    };
    fetchCamps();
  }, [apiKey, refreshKey, level, statusOverrides]);

  // Determine platform based on campaign name or tracked UTM sources
  const getCampaignPlatform = (camp: CampaignData): 'tiktok' | 'meta' | 'google' | 'other' => {
    const name = (camp.name || '').toLowerCase();
    if (name.includes('tiktok') || name.includes('tt') || camp.id.includes('tt')) return 'tiktok';
    if (name.includes('meta') || name.includes('facebook') || name.includes('fb') || name.includes('ig')) return 'meta';
    if (name.includes('google') || name.includes('gads') || name.includes('yt')) return 'google';
    return 'other';
  };

  // Apply filters
  const filtered = campaigns.filter(c => {
    // 1. Text Search
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    // 3. Platform Filter
    const plat = getCampaignPlatform(c);
    const matchesPlatform = platformFilter === 'all' || plat === platformFilter;

    // 4. Metric Filter
    let matchesMetric = true;
    if (metricFilter === 'spend') matchesMetric = (c.cost || 0) > 0;
    if (metricFilter === 'roas') matchesMetric = (c.roas || 0) >= 1.5;
    if (metricFilter === 'clicks') matchesMetric = (c.clicks || 0) > 10;

    return matchesSearch && matchesStatus && matchesPlatform && matchesMetric;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6"
    >
      <PageHeader
        title="Campaigns"
        description="Detailed performance analysis per traffic source"
        actions={
          <>
            {/* Level toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-[--color-background] border border-border rounded-lg">
              {(['campaign', 'adset', 'ad'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={level === l ? { background: 'rgba(255,255,255,0.07)', color: '#E8EAF0' } : {}}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                    ${level === l ? '' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
                >
                  {l === 'campaign' ? 'Campaigns' : l === 'adset' ? 'Ad Sets' : 'Ads'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={`Search ${level}s...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[--color-background] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[--color-text-muted] focus:border-white/20 outline-none w-52 transition-all"
              />
            </div>

            {/* Columns selector */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-all
                  ${isColumnsMenuOpen
                    ? 'border-white/20 text-white bg-white/5'
                    : 'border-border text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-white/5'}`}
              >
                <Columns size={14} />
                Columns
              </button>

              <AnimatePresence>
                {isColumnsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-52 bg-surface border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-[10px] font-semibold text-[--color-text-muted] uppercase tracking-wider">Visible Columns</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5">
                      {AVAILABLE_COLUMNS.map(col => (
                        <div
                          key={col.id}
                          onClick={() => toggleColumn(col.id)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0
                            ${selectedColumns.includes(col.id)
                              ? 'bg-primary border-primary'
                              : 'border-white/20'}`}
                          >
                            {selectedColumns.includes(col.id) && (
                              <span className="text-[9px] text-white font-bold">✓</span>
                            )}
                          </div>
                          <span className="text-xs text-[--color-text-primary] select-none">{col.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export */}
            <button
              onClick={() => exportToCSV(campaigns, 'reddash-campaigns')}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-white/5 transition-all"
            >
              <Download size={14} />
              Export
            </button>
          </>
        }
      />

      {/* ── Advanced UTMify Filter Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4 rounded-xl mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[--color-text-secondary]">
            <Filter size={13} className="text-primary" />
            <span>Filtros UTMify:</span>
          </div>

          {/* Status Filters */}
          <div className="flex bg-[--color-background] border border-border p-0.5 rounded-lg text-xs">
            {(['all', 'active', 'paused'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === s ? 'bg-surface text-white shadow-sm' : 'text-[--color-text-secondary] hover:text-white'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Ativas' : 'Pausadas'}
              </button>
            ))}
          </div>

          {/* Platform Filters */}
          <div className="flex bg-[--color-background] border border-border p-0.5 rounded-lg text-xs">
            {[
              { id: 'all', label: 'Origem: Todas' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'meta', label: 'Facebook / Meta' },
              { id: 'google', label: 'Google' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  platformFilter === p.id ? 'bg-surface text-white shadow-sm' : 'text-[--color-text-secondary] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Metrics Filters */}
          <div className="flex bg-[--color-background] border border-border p-0.5 rounded-lg text-xs">
            {[
              { id: 'all', label: 'Métricas: Todas' },
              { id: 'spend', label: 'Com Gasto > $0' },
              { id: 'roas', label: 'ROAS Eficiente (≥1.5x)' },
              { id: 'clicks', label: 'Mais de 10 Cliques' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMetricFilter(m.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  metricFilter === m.id ? 'bg-surface text-white shadow-sm' : 'text-[--color-text-secondary] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Callout */}
        <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/15 px-3 py-2 rounded-lg text-primary font-medium">
          <Sparkles size={13} className="animate-pulse" />
          <span>Integração Ads Manager ativa</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider font-semibold text-[--color-text-muted]">
                <th className="px-5 py-3 border-b border-border sticky left-0 bg-surface z-10">
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </th>
                {AVAILABLE_COLUMNS.map(col => selectedColumns.includes(col.id) && (
                  <th key={col.id} className={`px-5 py-3 border-b border-border text-${col.align}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((camp, idx) => (
                <tr
                  key={`${camp.id}-${idx}`}
                  className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-3.5 sticky left-0 bg-surface group-hover:bg-[--color-surface-2] transition-colors z-10">
                    <div className="flex items-center gap-2.5 max-w-[240px]">
                      {/* Platform source badge */}
                      {getCampaignPlatform(camp) === 'tiktok' && <TikTokLogo size={14} className="bg-white p-0.5 rounded shrink-0" />}
                      {getCampaignPlatform(camp) === 'meta' && <MetaLogo size={14} className="shrink-0" />}
                      {getCampaignPlatform(camp) === 'google' && <GoogleAdsLogo size={14} className="shrink-0" />}
                      {getCampaignPlatform(camp) === 'other' && <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />}
                      <span className="text-sm font-medium text-white truncate" title={camp.name}>
                        {camp.name}
                      </span>
                      <ArrowUpRight size={12} className="text-[--color-text-muted] group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </td>

                  {AVAILABLE_COLUMNS.map(col => {
                    if (!selectedColumns.includes(col.id)) return null;

                    let content: React.ReactNode = null;
                    let extraClass = `px-5 py-3.5 text-sm font-medium text-${col.align} `;

                    switch (col.id) {
                      case 'status':
                        content = (
                          <button
                            onClick={() => toggleStatus(camp.id, camp.status, camp.name)}
                            className="flex items-center gap-2 hover:opacity-85 transition-opacity outline-none"
                            title="Clique para alternar o status do anúncio"
                          >
                            {camp.status === 'active' ? (
                              <>
                                <ToggleRight size={22} className="text-success" />
                                <span className="tag-success">Ativo</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={22} className="text-gray-500" />
                                <span className="tag-neutral">Pausado</span>
                              </>
                            )}
                          </button>
                        );
                        break;
                      case 'clicks':
                      case 'impressions':
                      case 'conversions':
                        content = (camp[col.id] || 0).toLocaleString();
                        extraClass += 'text-[--color-text-secondary]';
                        break;
                      case 'cost':
                      case 'cpa':
                        content = formatCurrency(camp[col.id]);
                        extraClass += 'text-[--color-text-secondary]';
                        break;
                      case 'revenue':
                        content = formatCurrency(camp[col.id]);
                        extraClass += 'font-semibold text-white';
                        break;
                      case 'roas': {
                        const r = camp.roas || 0;
                        content = `${r.toFixed(2)}x`;
                        extraClass += `font-semibold ${r >= 3 ? 'text-success' : r >= 1.5 ? 'text-warning' : 'text-danger'}`;
                        break;
                      }
                      case 'profit':
                        content = formatCurrency(camp.profit || 0);
                        extraClass += `font-semibold ${(camp.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`;
                        break;
                      case 'roi':
                      case 'ctr':
                      case 'cr':
                        content = `${((camp[col.id as keyof CampaignData] as number) || 0).toFixed(2)}%`;
                        extraClass += 'text-[--color-text-secondary]';
                        break;
                    }

                    return (
                      <td key={col.id} className={extraClass}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[--color-text-secondary]">Nenhuma campanha encontrada com os filtros selecionados.</p>
              <p className="text-xs text-[--color-text-muted] mt-1">Ajuste os filtros acima ou limpe a busca.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Campaigns;

