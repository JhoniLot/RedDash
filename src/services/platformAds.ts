import type { CampaignData } from './redtrack';

export interface PlatformCredentials {
  accessToken: string;
  accountId: string; // Meta: act_xxxx, TikTok: advertiser_id
  connected: boolean;
}

export const PlatformAdsService = {
  // ─── META ADS Graph API (Facebook) ──────────────────────────────────────────
  async getMetaCampaigns(creds: PlatformCredentials): Promise<CampaignData[]> {
    if (!creds.accessToken || !creds.accountId) return [];

    // Ensure accountId has the 'act_' prefix required by Facebook
    const actId = creds.accountId.startsWith('act_') ? creds.accountId : `act_${creds.accountId}`;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Fetch Facebook Campaigns with costs, impressions, clicks and statuses
      // We use the Facebook Graph API insights & campaign endpoints
      const url = `https://graph.facebook.com/v18.0/${actId}/campaigns?fields=id,name,status,effective_status,insights.time_range({"since":"${thirtyDaysAgo}","until":"${today}"}){spend,impressions,inline_link_clicks}&access_token=${creds.accessToken}&limit=100`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const data = json.data || [];

      return data.map((item: any) => {
        const insights = item.insights?.data?.[0] || {};
        const cost = Number(insights.spend || 0);
        const clicks = Number(insights.inline_link_clicks || 0);
        const impressions = Number(insights.impressions || 0);
        const isMetaActive = item.effective_status === 'ACTIVE' || item.status === 'ACTIVE';

        return {
          id: String(item.id),
          name: `[Meta] ${item.name}`,
          status: isMetaActive ? 'active' : 'paused',
          clicks,
          impressions,
          cost,
          revenue: 0, // Will be merged with tracker conversion revenue
          conversions: 0,
          profit: -cost,
          roi: -100,
          roas: 0,
          cpa: 0,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cr: 0,
        } as CampaignData;
      });
    } catch (err) {
      console.error('[RedDash Meta API] Error fetching campaigns:', err);
      throw err;
    }
  },

  async toggleMetaCampaign(accessToken: string, campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v18.0/${campaignId}?status=${status}&access_token=${accessToken}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error('[RedDash Meta API] Error toggling status:', err);
      return false;
    }
  },

  // ─── TIKTOK MARKETING API ────────────────────────────────────────────────────
  async getTikTokCampaigns(creds: PlatformCredentials): Promise<CampaignData[]> {
    if (!creds.accessToken || !creds.accountId) return [];

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // 1. Fetch campaigns details (names & statuses)
      const detailsUrl = `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${creds.accountId}&page_size=100`;
      const detailsRes = await fetch(detailsUrl, {
        headers: {
          'Access-Token': creds.accessToken,
          'Content-Type': 'application/json',
        },
      });
      if (!detailsRes.ok) throw new Error(`TikTok HTTP ${detailsRes.status}`);
      const detailsJson = await detailsRes.json();
      if (detailsJson.code !== 0) throw new Error(detailsJson.message || 'TikTok API error');
      
      const campaignList = detailsJson.data?.list || [];

      // 2. Fetch campaign insights/costs
      const reportUrl = `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=${creds.accountId}&report_type=BASIC&dimensions=["campaign_id"]&metrics=["spend","impressions","clicks"]&start_date=${thirtyDaysAgo}&end_date=${today}&page_size=100`;
      const reportRes = await fetch(reportUrl, {
        headers: {
          'Access-Token': creds.accessToken,
          'Content-Type': 'application/json',
        },
      });
      let insightsList: any[] = [];
      if (reportRes.ok) {
        const reportJson = await reportRes.json();
        if (reportJson.code === 0) {
          insightsList = reportJson.data?.list || [];
        }
      }

      return campaignList.map((item: any) => {
        const insight = insightsList.find((ins: any) => ins.dimensions?.campaign_id === item.campaign_id) || {};
        const cost = Number(insight.metrics?.spend || 0);
        const clicks = Number(insight.metrics?.clicks || 0);
        const impressions = Number(insight.metrics?.impressions || 0);
        const isTikTokActive = item.operation_status === 'ENABLE';

        return {
          id: String(item.campaign_id),
          name: `[TikTok] ${item.campaign_name}`,
          status: isTikTokActive ? 'active' : 'paused',
          clicks,
          impressions,
          cost,
          revenue: 0,
          conversions: 0,
          profit: -cost,
          roi: -100,
          roas: 0,
          cpa: 0,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cr: 0,
        } as CampaignData;
      });
    } catch (err) {
      console.error('[RedDash TikTok API] Error fetching campaigns:', err);
      throw err;
    }
  },

  async toggleTikTokCampaign(accessToken: string, advertiserId: string, campaignId: string, status: 'ENABLE' | 'DISABLE'): Promise<boolean> {
    try {
      const url = `https://business-api.tiktok.com/open_api/v1.3/campaign/update/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advertiser_id: advertiserId,
          campaign_id: campaignId,
          operation_status: status, // ENABLE or DISABLE
        }),
      });
      const json = await res.json();
      return json.code === 0;
    } catch (err) {
      console.error('[RedDash TikTok API] Error toggling status:', err);
      return false;
    }
  },
};
