import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import type { ReportRow, ConversionData } from '../services/redtrack';
import { useFinancials } from '../hooks/useFinancials';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Receipt, PiggyBank, Download } from 'lucide-react';
import { exportToCSV } from '../utils/export';
import PageHeader from '../components/PageHeader';

const Financial: React.FC = () => {
  const { apiKey, dateRange, refreshKey, currency } = useAppContext();
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [conversions, setConversions] = useState<ConversionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [report, convs] = await Promise.all([
        RedTrackService.getReport(apiKey, dateRange.from, dateRange.to, 'date'),
        RedTrackService.getConversions(apiKey, dateRange.from, dateRange.to)
      ]);
      setReportData(report);
      setConversions(convs);
    };
    fetchData();
  }, [apiKey, dateRange, refreshKey]);

  const metrics = useFinancials(conversions, reportData);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0,
    }).format(val);
  };

  const summaryCards = [
    { label: 'Gross Revenue',  value: formatCurrency(metrics.totalRevenue),      icon: DollarSign, color: '#5B6EE8' },
    { label: 'Ad Spend',       value: formatCurrency(metrics.totalAdSpend),       icon: TrendingUp,  color: '#E53E3E' },
    { label: 'Product Costs',  value: formatCurrency(metrics.totalProductCosts),  icon: CreditCard,  color: '#D4A017' },
    { label: 'Taxes & Fees',   value: formatCurrency(metrics.totalFees),          icon: Receipt,     color: '#9B72E8' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
          <p className="text-[10px] text-[--color-text-secondary] mb-2 font-mono uppercase">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
              <span className="text-xs text-[--color-text-secondary]">{entry.name}</span>
              <span className="text-xs font-semibold text-white font-mono ml-auto pl-4">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const statRows = [
    { label: 'Gross Margin', value: `${((metrics.totalRevenue - metrics.totalProductCosts) / (metrics.totalRevenue || 1) * 100).toFixed(1)}%` },
    { label: 'Real ROAS',    value: `${(metrics.roas || 0).toFixed(2)}x` },
    { label: 'Avg. CPA',     value: formatCurrency(metrics.cpa) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6"
    >
      <PageHeader
        title="Financial Statement"
        description="Revenue, costs, and net profitability for the selected period"
        actions={
          <button
            onClick={() => exportToCSV(reportData, 'reddash-financial')}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-white/5 transition-all"
          >
            <Download size={14} />
            Export
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[--color-text-secondary]">{card.label}</span>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}18` }}
                >
                  <Icon size={14} style={{ color: card.color }} />
                </div>
              </div>
              <span className="text-lg font-semibold text-white font-mono">{card.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Revenue vs Costs</h3>
          <p className="text-xs text-[--color-text-secondary] mb-5">Daily breakdown for the selected period</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.slice(-10)} barSize={8} barGap={2}>
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
                  tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => (
                    <span style={{ color: '#6B7280', fontSize: '11px' }}>{value}</span>
                  )}
                />
                <Bar dataKey="revenue" name="Revenue"    fill="#5B6EE8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost"    name="Ad Spend"   fill="#E53E3E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit"  name="Net Profit" fill="#2ECC71" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profitability summary */}
        <div className="card p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Profitability</h3>
            <p className="text-xs text-[--color-text-secondary] mt-0.5">After all deductions</p>
          </div>

          <div className="space-y-0 flex-1">
            {statRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
                <span className="text-xs text-[--color-text-secondary]">{row.label}</span>
                <span className="text-sm font-semibold text-white font-mono">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[--color-background] rounded-lg border border-border">
            <p className="text-[10px] font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">Total Net Profit</p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: metrics.netProfit >= 0 ? 'rgba(46,204,113,0.12)' : 'rgba(229,62,62,0.12)' }}
              >
                <PiggyBank size={18} style={{ color: metrics.netProfit >= 0 ? '#2ECC71' : '#E53E3E' }} />
              </div>
              <div>
                <span
                  className="text-2xl font-bold font-mono block"
                  style={{ color: metrics.netProfit >= 0 ? '#2ECC71' : '#E53E3E' }}
                >
                  {formatCurrency(metrics.netProfit)}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: metrics.netProfit >= 0 ? '#2ECC71' : '#E53E3E' }}
                >
                  {(metrics.margin || 0).toFixed(1)}% net margin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Financial;
