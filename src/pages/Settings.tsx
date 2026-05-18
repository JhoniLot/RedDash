import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, LogOut, Copy, Check, Link2, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const UTM_PLATFORMS = [
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    snippet: '&rt_campaign=__CAMPAIGN_NAME__&rt_adgroup=__AID_NAME__&rt_ad=__CID_NAME__',
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    snippet: '&rt_campaign={{campaign.name}}&rt_adgroup={{adset.name}}&rt_ad={{ad.name}}',
  },
  {
    id: 'google',
    name: 'Google Ads',
    snippet: '&rt_campaign={campaignname}&rt_adgroup={adgroupname}&rt_ad={creative}',
  },
];

const Settings: React.FC = () => {
  const { apiKey, setApiKey, isConnected, setIsConnected } = useAppContext();
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState('tiktok');

  const handleCopy = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activePlatformData = UTM_PLATFORMS.find(p => p.id === activePlatform)!;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await RedTrackService.testConnection(tempKey);
    setTesting(false);

    if (result.success) {
      setTestResult({ success: true, message: `Connected successfully — ${result.count} campaigns found.` });
      setApiKey(tempKey);
      setIsConnected(true);
    } else {
      setTestResult({ success: false, message: result.message });
    }
  };

  const handleDisconnect = () => {
    setApiKey('');
    setTempKey('');
    setIsConnected(false);
    setTestResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-2xl"
    >
      <PageHeader
        title="Settings"
        description="Manage your API connection and preferences"
      />

      <div className="space-y-4">
        {/* API Connection */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">RedTrack API</h3>
              <p className="text-xs text-[--color-text-secondary]">Connect your account to sync live data</p>
            </div>
            <div className="ml-auto">
              <span className={isConnected ? 'tag-success' : 'tag-neutral'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[--color-text-secondary] mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full bg-[--color-background] border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm text-white placeholder:text-[--color-text-muted] focus:border-white/20 outline-none transition-all font-mono"
                  placeholder="Paste your API key here..."
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors p-1"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testing || !tempKey}
                className="flex-1 bg-primary text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {testing
                  ? <RefreshCw size={15} className="animate-spin" />
                  : <CheckCircle2 size={15} />
                }
                {isConnected ? 'Update Connection' : 'Connect API'}
              </button>

              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="px-4 border border-danger/25 text-danger hover:bg-danger/5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <LogOut size={15} />
                  Disconnect
                </button>
              )}
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg flex items-start gap-3 border text-xs ${
                  testResult.success
                    ? 'bg-success/5 border-success/15 text-success'
                    : 'bg-danger/5 border-danger/15 text-danger'
                }`}
              >
                {testResult.success
                  ? <CheckCircle2 size={15} className="shrink-0 mt-px" />
                  : <XCircle size={15} className="shrink-0 mt-px" />
                }
                <span className="font-medium">{testResult.message}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── UTM Setup Card ── */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Link2 size={16} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ads Manager UTM Setup</h3>
              <p className="text-xs text-[--color-text-secondary]">Adicione no final do link do seu anúncio</p>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 mb-4">
            <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-300 leading-relaxed">
              Para as abas <strong>Ad Sets</strong> e <strong>Ads</strong> mostrarem os nomes reais, cole o parâmetro abaixo no final da URL de destino do seu anúncio.
            </p>
          </div>

          {/* Platform tabs */}
          <div className="flex bg-background border border-border p-1 rounded-lg mb-3 gap-1">
            {UTM_PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activePlatform === p.id
                    ? 'bg-surface text-white shadow'
                    : 'text-[--color-text-secondary] hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Snippet + copy */}
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-surface/30">
              <span className="text-xs text-[--color-text-secondary] font-mono">Cole no final da URL</span>
              <button
                onClick={() => handleCopy(activePlatformData.snippet, activePlatform)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                  copiedId === activePlatform
                    ? 'bg-success/15 text-success'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {copiedId === activePlatform ? <Check size={12} /> : <Copy size={12} />}
                {copiedId === activePlatform ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="px-3 py-3 text-xs font-mono text-primary overflow-x-auto break-all leading-relaxed whitespace-pre-wrap">
              {activePlatformData.snippet}
            </pre>
          </div>

          {/* Checklist */}
          <div className="mt-4 space-y-2.5">
            <p className="text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-wider">Checklist</p>
            {[
              { done: isConnected, text: 'API Key do RedTrack conectada' },
              { done: false, text: `Parâmetros colados no link (${activePlatformData.name})` },
              { done: false, text: 'Aguardar novos cliques — dados não retroagem' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                  item.done ? 'bg-success/20 text-success' : 'bg-white/5 text-[--color-text-secondary]'
                }`}>
                  {item.done ? <Check size={10} /> : <span className="font-bold">{i + 1}</span>}
                </div>
                <span className={`text-xs ${item.done ? 'text-success line-through decoration-success/40' : 'text-[--color-text-secondary]'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences (disabled) */}
        <div className="card p-5 opacity-40 pointer-events-none select-none">
          <h3 className="text-sm font-semibold text-white mb-1">Display Preferences</h3>
          <p className="text-xs text-[--color-text-secondary]">More settings coming soon.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
