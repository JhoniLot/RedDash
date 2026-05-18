import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import type { ReportRow, ConversionData, CampaignData } from '../services/redtrack';
import { useFinancials } from '../hooks/useFinancials';
import KPIHero from '../components/KPIHero';
import MainChart from '../components/Charts/MainChart';
import ProfitDonut from '../components/Charts/ProfitDonut';
import CampaignTable from '../components/Tables/CampaignTable';
import ConversionsTable from '../components/Tables/ConversionsTable';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { apiKey, dateRange, refreshKey } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [report, convs, camps] = await Promise.all([
        RedTrackService.getReport(apiKey, dateRange.from, dateRange.to, 'date'),
        RedTrackService.getConversions(apiKey, dateRange.from, dateRange.to),
        RedTrackService.getCampaigns(apiKey)
      ]);
      setReportData(report);
      setConversions(convs);
      setCampaigns(camps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiKey, dateRange, refreshKey]);

  const metrics = useFinancials(conversions, reportData);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="grid grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-surface rounded-lg border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-[380px] bg-surface rounded-lg border border-border" />
          <div className="h-[380px] bg-surface rounded-lg border border-border" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="pb-10"
    >
      <KPIHero 
        metrics={{
          totalRevenue: metrics.totalRevenue,
          totalAdSpend: metrics.totalAdSpend,
          netProfit: metrics.netProfit,
          roas: metrics.roas,
          totalConversions: metrics.totalConversions,
          cpa: metrics.cpa,
          margin: metrics.margin
        }} 
        history={reportData}
      />

      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 pt-4">
        <div className="lg:col-span-2">
          <MainChart data={reportData} />
        </div>
        <div>
          <ProfitDonut metrics={metrics} />
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CampaignTable campaigns={campaigns.slice(0, 5)} />
        </div>
        <div>
          <ConversionsTable conversions={metrics.processedConversions} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
