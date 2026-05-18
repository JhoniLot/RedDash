import React from 'react';
import { useAppContext } from '../../context/AppContext';
import type { CampaignData } from '../../services/redtrack';

interface CampaignTableProps {
  campaigns: CampaignData[];
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns }) => {
  const { currency } = useAppContext();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0,
    }).format(val);
  };

  const getRoasLabel = (roas: number) => {
    if (roas >= 3) return { label: 'Strong', cls: 'tag-success' };
    if (roas >= 1.5) return { label: 'OK', cls: 'tag-neutral' };
    return { label: 'Weak', cls: 'tag-danger' };
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Campaigns</h3>
          <p className="text-xs text-[--color-text-secondary] mt-0.5">Performance by campaign source</p>
        </div>
        <button className="text-xs font-medium text-primary hover:opacity-75 transition-opacity">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider font-semibold text-[--color-text-muted]">
              <th className="px-5 py-3 border-b border-border">Campaign</th>
              <th className="px-5 py-3 border-b border-border">Status</th>
              <th className="px-5 py-3 border-b border-border text-right">Spend</th>
              <th className="px-5 py-3 border-b border-border text-right">Revenue</th>
              <th className="px-5 py-3 border-b border-border text-right">ROAS</th>
              <th className="px-5 py-3 border-b border-border text-right">Conv.</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp, idx) => {
              const roasInfo = getRoasLabel(camp.roas || 0);
              return (
                <tr 
                  key={`${camp.id}-${idx}`} 
                  className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-white truncate max-w-[180px]">{camp.name}</p>
                    <p className="text-[10px] text-[--color-text-muted] font-mono mt-0.5">{camp.id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={camp.status === 'active' ? 'tag-success' : 'tag-neutral'}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-[--color-text-secondary] font-mono">{formatCurrency(camp.cost)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs font-semibold text-white font-mono">{formatCurrency(camp.revenue)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-white font-mono">
                        {(camp.roas || 0).toFixed(2)}x
                      </span>
                      <span className={roasInfo.cls}>{roasInfo.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-[--color-text-secondary] font-mono">
                      {(camp.conversions || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
