import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

interface MainChartProps {
  data: any[];
}

const MainChart: React.FC<MainChartProps> = ({ data }) => {
  const { currency } = useAppContext();
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit' | 'roas' | 'conversions'>('revenue');

  const metrics = [
    { id: 'revenue',     label: 'Revenue',     color: '#5B6EE8' },
    { id: 'profit',      label: 'Profit',      color: '#2ECC71' },
    { id: 'roas',        label: 'ROAS',        color: '#D4A017' },
    { id: 'conversions', label: 'Conversions', color: '#9B72E8' },
  ];

  const activeColor = metrics.find(m => m.id === activeMetric)?.color ?? '#5B6EE8';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-2xl">
          <p className="text-[10px] text-[--color-text-secondary] mb-2 font-mono uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-[--color-text-secondary]">{entry.name}</span>
              <span className="text-xs font-semibold text-white font-mono ml-auto pl-4">
                {entry.name === 'ROAS' ? `${(entry.value || 0).toFixed(2)}x` : 
                 entry.name === 'Conversions' ? entry.value :
                 new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
                   style: 'currency', currency: currency
                 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Performance Overview</h3>
          <p className="text-xs text-[--color-text-secondary] mt-0.5">Scaling metrics over time</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[--color-background] rounded-lg border border-border">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all
                ${activeMetric === m.id 
                  ? 'bg-surface text-white shadow-sm' 
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeColor} stopOpacity={0.15}/>
                <stop offset="100%" stopColor={activeColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E53E3E" stopOpacity={0.08}/>
                <stop offset="100%" stopColor="#E53E3E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="transparent"
              tick={{ fill: '#3D4450', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
            />
            <YAxis 
              stroke="transparent"
              tick={{ fill: '#3D4450', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val > 1000 ? `${(val/1000).toFixed(1)}k` : val}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              name={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
              stroke={activeColor}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              strokeWidth={2}
            />
            {activeMetric === 'revenue' && (
              <Area 
                type="monotone" 
                dataKey="cost" 
                name="Ad Spend"
                stroke="#E53E3E"
                fillOpacity={1} 
                fill="url(#colorCost)" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainChart;
