import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, LogOut, Copy, Check, Link2, Info, Sparkles } from 'lucide-react';
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
  const { 
    apiKey, 
    setApiKey, 
    isConnected, 
    setIsConnected,
    userPlan,
    customLogo,
    setCustomLogo,
    customName,
    setCustomName
  } = useAppContext();
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

        {/* Configurações White-Label */}
        {userPlan === 'enterprise' ? (
          <div className="card p-5 border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Personalização White-Label</h3>
                <p className="text-xs text-[--color-text-secondary]">Substitua a identidade do RedDash pela sua marca</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[--color-text-secondary] mb-2">
                  Nome da sua Agência
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[--color-background] border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[--color-text-muted] focus:border-primary outline-none transition-all"
                  placeholder="Ex: Prime Tech Agency"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[--color-text-secondary] mb-2">
                  URL da Logo da sua Agência
                </label>
                <input
                  type="text"
                  value={customLogo}
                  onChange={(e) => setCustomLogo(e.target.value)}
                  className="w-full bg-[--color-background] border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[--color-text-muted] focus:border-primary outline-none transition-all font-mono"
                  placeholder="Ex: https://suaagencia.com.br/logo.png"
                />
              </div>

              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-[11px] text-primary leading-relaxed">
                  💡 <strong>Dica:</strong> A sua marca e logo serão aplicadas automaticamente no cabeçalho e na barra lateral da dashboard em tempo real!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-5 opacity-70 relative overflow-hidden border border-dashed border-border">
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Sparkles size={16} />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Personalização White-Label 🔒</h4>
              <p className="text-[10px] text-[--color-text-secondary] max-w-[280px] mb-3">
                Remova a marca do RedDash e configure a sua própria logo e nome para apresentar relatórios premium para seus clientes!
              </p>
              <button
                onClick={() => {
                  alert('Acesse a aba "Planos" no menu lateral para fazer o upgrade para o plano Enterprise e desbloquear esta funcionalidade!');
                }}
                className="bg-primary/20 hover:bg-primary/30 border border-primary/35 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all active:scale-[0.98]"
              >
                Desbloquear no Plano Enterprise
              </button>
            </div>
            
            {/* Blurry mock fields so they can see what it is */}
            <div className="filter blur-[1.5px] select-none pointer-events-none">
              <h3 className="text-sm font-semibold text-white mb-1">White-Label Branding</h3>
              <p className="text-xs text-[--color-text-secondary] mb-4">Mock display preferences</p>
              <div className="h-9 bg-white/5 rounded-lg mb-3" />
              <div className="h-9 bg-white/5 rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
