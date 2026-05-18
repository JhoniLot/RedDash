import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { ConversionData } from '../../services/redtrack';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ConversionsTableProps {
  conversions: ConversionData[];
}

const ConversionsTable: React.FC<ConversionsTableProps> = ({ conversions }) => {
  const { currency } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0,
    }).format(val);
  };

  const totalPages = Math.ceil(conversions.length / itemsPerPage);
  const currentData = conversions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-white">Recent Conversions</h3>
        <p className="text-xs text-[--color-text-secondary] mt-0.5">Individual sale logs</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider font-semibold text-[--color-text-muted]">
              <th className="px-5 py-3 border-b border-border">Date</th>
              <th className="px-5 py-3 border-b border-border">Product</th>
              <th className="px-5 py-3 border-b border-border text-right">Revenue</th>
              <th className="px-5 py-3 border-b border-border text-right">Profit</th>
              <th className="px-5 py-3 border-b border-border">Source</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((conv) => (
              <tr 
                key={conv.clickid} 
                className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3.5">
                  <p className="text-xs font-medium text-white">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-[--color-text-muted]">
                    {new Date(conv.created_at).toLocaleTimeString()}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-xs font-medium text-white truncate max-w-[120px]">{conv.offer_name}</p>
                  <p className="text-[10px] text-[--color-text-muted] truncate max-w-[120px]">{conv.campaign_name || '—'}</p>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-sm font-semibold text-white">{formatCurrency(conv.revenue)}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-sm font-semibold ${(conv.netProfit || 0) > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(conv.netProfit || 0)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    conv.traffic_source?.toLowerCase().includes('tiktok') ? 'bg-[#00F2FE]/5 border-[#00F2FE]/15 text-[#00F2FE]' :
                    conv.traffic_source?.toLowerCase().includes('facebook') || conv.traffic_source?.toLowerCase().includes('meta') ? 'bg-[#1877F2]/5 border-[#1877F2]/15 text-[#1877F2]' :
                    conv.traffic_source?.toLowerCase().includes('google') ? 'bg-[#34A853]/5 border-[#34A853]/15 text-[#34A853]' :
                    'bg-white/5 border-white/10 text-[--color-text-secondary]'
                  }`}>
                    {conv.traffic_source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-[11px] text-[--color-text-muted]">
          {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, conversions.length)} of {conversions.length}
        </span>
        <div className="flex gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1.5 rounded border border-border hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={14} className="text-[--color-text-secondary]" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 rounded border border-border hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={14} className="text-[--color-text-secondary]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionsTable;
