import { PlatformAdsService } from './platformAds';

const BASE_URL = import.meta.env.DEV ? '/api/redtrack' : 'https://api.redtrack.io';

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  clicks: number;
  impressions: number;
  cost: number;
  revenue: number;
  conversions: number;
  profit: number;
  roi: number;
  roas: number;
  cpa: number;
  ctr: number;
  cr: number;
}

export interface ConversionData {
  clickid: string;
  offer_name: string;
  revenue: number;
  created_at: string;
  traffic_source: string;
  campaign_name?: string;
  productCost?: number;
  netProfit?: number;
}

export interface ReportRow {
  date?: string;
  campaign?: string;
  clicks: number;
  impressions: number;
  cost: number;
  revenue: number;
  conversions: number;
  profit: number;
  roi: number;
  roas: number;
  cpa: number;
  ctr: number;
  cr: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const generateMockReport = (days: number): ReportRow[] => {
  const rows: ReportRow[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const cost = Math.random() * 200 + 50;
    const revenue = Math.random() * 600 + 100;
    const conversions = Math.floor(Math.random() * 20) + 5;
    const clicks = Math.floor(Math.random() * 500) + 100;
    const impressions = Math.floor(Math.random() * 10000) + 5000;
    rows.push({
      date: date.toISOString().split('T')[0],
      clicks,
      impressions,
      cost,
      revenue,
      conversions,
      profit: revenue - cost,
      roi: ((revenue - cost) / cost) * 100,
      roas: revenue / cost,
      cpa: cost / conversions,
      ctr: (clicks / impressions) * 100,
      cr: (conversions / clicks) * 100,
    });
  }
  return rows;
};

const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: '1', name: 'Meta - Black Friday', status: 'active', clicks: 1240, impressions: 45000, cost: 450.20, revenue: 1250.50, conversions: 45, profit: 800.30, roi: 177, roas: 2.78, cpa: 10, ctr: 2.75, cr: 3.6 },
  { id: '2', name: 'Google Search BR', status: 'active', clicks: 850, impressions: 12000, cost: 320.10, revenue: 2100.00, conversions: 82, profit: 1779.90, roi: 556, roas: 6.56, cpa: 3.9, ctr: 7.08, cr: 9.6 },
  { id: '3', name: 'YouTube Retargeting', status: 'paused', clicks: 420, impressions: 85000, cost: 120.40, revenue: 250.00, conversions: 12, profit: 129.60, roi: 107, roas: 2.07, cpa: 10, ctr: 0.49, cr: 2.8 },
  { id: '4', name: 'Instagram Stories', status: 'active', clicks: 2100, impressions: 62000, cost: 680.00, revenue: 1450.00, conversions: 58, profit: 770.00, roi: 113, roas: 2.13, cpa: 11.7, ctr: 3.38, cr: 2.7 },
  { id: '5', name: 'TikTok Prospecting', status: 'active', clicks: 3500, impressions: 120000, cost: 890.00, revenue: 920.00, conversions: 25, profit: 30.00, roi: 3, roas: 1.03, cpa: 35.6, ctr: 2.91, cr: 0.7 },
];

const MOCK_CONVERSIONS: ConversionData[] = [
  { clickid: 'c1', offer_name: 'Curso de Tráfego Pago', revenue: 197.00, created_at: new Date().toISOString(), traffic_source: 'Meta Ads', campaign_name: 'Meta - Black Friday' },
  { clickid: 'c2', offer_name: 'Mentoria Premium', revenue: 997.00, created_at: new Date().toISOString(), traffic_source: 'Google Search', campaign_name: 'Google Search BR' },
  { clickid: 'c3', offer_name: 'Ebook Ads', revenue: 47.00, created_at: new Date().toISOString(), traffic_source: 'Instagram', campaign_name: 'Instagram Stories' },
  { clickid: 'c4', offer_name: 'Pack de Templates', revenue: 97.00, created_at: new Date().toISOString(), traffic_source: 'TikTok', campaign_name: 'TikTok Prospecting' },
];

// ─── Helper: safe number ──────────────────────────────────────────────────────
const num = (v: any): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};
// ─── RedTrackService ──────────────────────────────────────────────────────────
export const RedTrackService = {

  async testConnection(apiKey: string) {
    if (!apiKey) return { success: false, message: 'API Key is required' };
    try {
      const res = await fetch(`${BASE_URL}/campaigns?api_key=${apiKey}&per=1`);
      if (res.status === 401) throw new Error('API Key inválida');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Used by Dashboard for date-based charts
  async getReport(apiKey: string, from: string, to: string, _groupBy: string = 'date'): Promise<ReportRow[]> {
    if (!apiKey) return generateMockReport(7);

    try {
      // Use the actual RedTrack daily report grouping!
      const res = await fetch(
        `${BASE_URL}/report?api_key=${apiKey}&group=date&date_from=${from}&date_to=${to}&per=200`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const items: any[] = Array.isArray(raw) ? raw : (raw.items || raw.data || []);

      if (items.length === 0) {
        return generateMockReport(7);
      }

      return items.map((c: any) => {
        const cost = num(c.cost);
        const revenue = num(c.revenue);
        const conversions = num(c.conversions);
        const clicks = num(c.clicks);
        const impressions = num(c.impressions);
        
        return {
          date: c.date || c.created_at?.split('T')[0] || from,
          clicks,
          impressions,
          cost,
          revenue,
          conversions,
          profit: revenue - cost,
          roi: cost > 0 ? ((revenue - cost) / cost) * 100 : 0,
          roas: cost > 0 ? revenue / cost : 0,
          cpa: conversions > 0 ? cost / conversions : 0,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cr: clicks > 0 ? (conversions / clicks) * 100 : 0
        };
      });
    } catch (err) {
      console.warn('[RedDash] getReport fallback to mock:', err);
      return generateMockReport(7);
    }
  },

  async getCampaigns(apiKey: string, level: 'campaign' | 'adset' | 'ad' = 'campaign'): Promise<CampaignData[]> {
    if (!apiKey) return MOCK_CAMPAIGNS;

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let integrations: any[] = [];
    try {
      const saved = localStorage.getItem('@reddash:integrations');
      if (saved) integrations = JSON.parse(saved);
    } catch (e) { console.error(e); }

    const metaInt = integrations.find(i => i.id === 'meta' && i.connected);
    const tiktokInt = integrations.find(i => i.id === 'tiktok' && i.connected);

    if ((metaInt || tiktokInt) && level === 'campaign') {
      try {
        let platformCampaigns: CampaignData[] = [];
        if (metaInt) {
          try {
            const mc = await PlatformAdsService.getMetaCampaigns({
              accessToken: metaInt.accessToken || '',
              accountId: metaInt.accountId || metaInt.selectedAdAccount || '',
              connected: true
            });
            platformCampaigns = [...platformCampaigns, ...mc];
          } catch (e) { console.warn('Meta live pull error:', e); }
        }
        if (tiktokInt) {
          try {
            const tc = await PlatformAdsService.getTikTokCampaigns({
              accessToken: tiktokInt.accessToken || '',
              accountId: tiktokInt.accountId || tiktokInt.selectedAdAccount || '',
              connected: true
            });
            platformCampaigns = [...platformCampaigns, ...tc];
          } catch (e) { console.warn('TikTok live pull error:', e); }
        }

        if (platformCampaigns.length > 0) {
          const res = await fetch(`${BASE_URL}/report?api_key=${apiKey}&group=sub4&date_from=${thirtyDaysAgo}&date_to=${today}&per=200`);
          if (res.ok) {
            const raw = await res.json();
            const redtrackRows: any[] = Array.isArray(raw) ? raw : (raw.items || raw.data || []);
            return platformCampaigns.map(camp => {
              const rtMatch = redtrackRows.find(row => String(row.sub4) === String(camp.id) || String(row._id) === String(camp.id));
              if (rtMatch) {
                const conversions = num(rtMatch.conversions);
                const revenue = num(rtMatch.revenue);
                const profit = revenue - camp.cost;
                return { ...camp, conversions, revenue, profit, roas: camp.cost > 0 ? revenue / camp.cost : 0, roi: camp.cost > 0 ? (profit / camp.cost) * 100 : 0, cpa: conversions > 0 ? camp.cost / conversions : 0, cr: camp.clicks > 0 ? (conversions / camp.clicks) * 100 : 0 };
              }
              return camp;
            });
          }
          return platformCampaigns;
        }
      } catch (err) { console.warn('[RedDash] Error in live integration mode:', err); }
    }

    const groupMap: Record<string, string> = { campaign: 'sub6', adset: 'sub7', ad: 'sub8' };
    const group = groupMap[level];

    try {
      const res = await fetch(`${BASE_URL}/report?api_key=${apiKey}&group=${group}&date_from=${thirtyDaysAgo}&date_to=${today}&per=200`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const items: any[] = Array.isArray(raw) ? raw : (raw.items || raw.data || []);

      if (items.length === 0 || !items.some(item => item[group])) return MOCK_CAMPAIGNS;

      return items.filter(item => item[group] && String(item[group]).trim() !== '').map((item: any) => ({
        id: String(item._id || item.id || item[group]),
        name: String(item[group]),
        status: 'active',
        clicks: num(item.clicks),
        impressions: num(item.impressions),
        cost: num(item.cost),
        revenue: num(item.revenue),
        conversions: num(item.conversions),
        profit: num(item.profit ?? (num(item.revenue) - num(item.cost))),
        roi: num(item.roi ?? (num(item.cost) > 0 ? ((num(item.revenue) - num(item.cost)) / num(item.cost)) * 100 : 0)),
        roas: num(item.roas ?? (num(item.cost) > 0 ? num(item.revenue) / num(item.cost) : 0)),
        cpa: num(item.cpa ?? (num(item.conversions) > 0 ? num(item.cost) / num(item.conversions) : 0)),
        ctr: num(item.ctr ?? (num(item.impressions) > 0 ? (num(item.clicks) / num(item.impressions)) * 100 : 0)),
        cr: num(item.cr ?? (num(item.clicks) > 0 ? (num(item.conversions) / num(item.clicks)) * 100 : 0)),
      }));
    } catch (err) {
      console.warn('[RedDash] getCampaigns /report fallback to mock:', err);
      return MOCK_CAMPAIGNS;
    }
  },

  async getConversions(apiKey: string, from: string, to: string): Promise<ConversionData[]> {
    if (!apiKey) return MOCK_CONVERSIONS;
    try {
      const res = await fetch(
        `${BASE_URL}/conversions?api_key=${apiKey}&date_from=${from}&date_to=${to}&per=100`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      return raw.items || raw.data || (Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn('[RedDash] getConversions fallback to mock:', err);
      return MOCK_CONVERSIONS;
    }
  },
};
