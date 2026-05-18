import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

interface ProfitDonutProps {
  metrics: {
    totalAdSpend: number;
    totalProductCosts: number;
    totalFees: number;
    netProfit: number;
  };
}

const ProfitDonut: React.FC<ProfitDonutProps> = ({ metrics }) => {
  const { currency } = useAppContext();

  const data = [
    { name: 'Ad Spend',      value: metrics.totalAdSpend,      color: '#E53E3E' },
    { name: 'Product Costs', value: metrics.totalProductCosts,  color: '#D4A017' },
    { name: 'Taxes & Fees',  value: metrics.totalFees,          color: '#9B72E8' },
    { name: 'Net Profit',    value: Math.max(0, metrics.netProfit), color: '#2ECC71' },
  ];

  const formatValue = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/80 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]">
          <p className="text-xs font-semibold text-white mb-1">{payload[0].name}</p>
          <p className="text-xs text-[--color-text-secondary] font-mono">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Profit Breakdown</h3>
        <p className="text-xs text-[--color-text-secondary] mt-0.5">Financial distribution</p>
      </div>
      
      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-[--color-text-secondary] uppercase tracking-wider font-medium">Net</span>
          <span className="text-lg font-semibold text-white font-mono mt-0.5">
            {formatValue(metrics.netProfit)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 pt-4 border-t border-border">
        {data.map((item, i) => {
          const total = data.reduce((s, d) => s + d.value, 0);
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color, opacity: 0.85 }} />
                <span className="text-xs text-[--color-text-secondary]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[--color-text-muted] font-mono">{pct}%</span>
                <span className="text-xs text-[--color-text-primary] font-mono">{formatValue(item.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfitDonut;
