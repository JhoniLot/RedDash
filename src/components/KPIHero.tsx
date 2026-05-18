import React from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  data: { value: number }[];
  isCurrency?: boolean;
  badge?: string;
  accentColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, data, badge, accentColor = '#5B6EE8' }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">{title}</span>
        {badge && (
          <span className="tag-neutral">
            {badge}
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between gap-2">
        <span className="text-xl font-semibold text-white font-mono tracking-tight leading-none">{value}</span>
        <div className={`flex items-center text-[11px] font-semibold shrink-0 mb-0.5 ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive 
            ? <TrendingUp size={11} className="mr-1" /> 
            : <TrendingDown size={11} className="mr-1" />
          }
          {Math.abs(change)}%
        </div>
      </div>
      
      <div className="h-9 w-full -mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={accentColor}
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false}
              strokeOpacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface KPIHeroProps {
  metrics: {
    totalRevenue: number;
    totalAdSpend: number;
    netProfit: number;
    roas: number;
    totalConversions: number;
    cpa: number;
    margin: number;
  };
  history: any[];
}

const KPIHero: React.FC<KPIHeroProps> = ({ metrics, history }) => {
  const { currency } = useAppContext();
  
  const formatValue = (val: number, isCur = true) => {
    const formatter = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: isCur ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: isCur ? 2 : 0,
    });
    return formatter.format(val);
  };

  const getSparklineData = (key: string) => {
    return history.map(h => ({ value: h[key] || 0 }));
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatValue(metrics.totalRevenue),
      change: 12.5,
      data: getSparklineData('revenue'),
      accentColor: '#5B6EE8',
    },
    {
      title: 'Ad Spend',
      value: formatValue(metrics.totalAdSpend),
      change: -5.2,
      data: getSparklineData('cost'),
      accentColor: '#E53E3E',
    },
    {
      title: 'Net Profit',
      value: formatValue(metrics.netProfit),
      change: 18.1,
      data: getSparklineData('profit'),
      accentColor: '#2ECC71',
      badge: `${(metrics.margin || 0).toFixed(1)}% margin`,
    },
    {
      title: 'ROAS',
      value: `${(metrics.roas || 0).toFixed(2)}x`,
      change: 8.4,
      data: getSparklineData('roas'),
      accentColor: '#5B6EE8',
    },
    {
      title: 'Conversions',
      value: metrics.totalConversions.toLocaleString(),
      change: 15.0,
      data: getSparklineData('conversions'),
      accentColor: '#D4A017',
    },
    {
      title: 'CPA',
      value: formatValue(metrics.cpa),
      change: -10.2,
      data: getSparklineData('cpa'),
      accentColor: '#E53E3E',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 px-6 pt-6 pb-2">
      {cards.map((card, i) => (
        <KPICard key={i} {...card} />
      ))}
    </div>
  );
};

export default KPIHero;
