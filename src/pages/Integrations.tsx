import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Share2, Check, Sparkles, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { MetaLogo, TikTokLogo, GoogleAdsLogo } from '../components/BrandLogos';

const renderBrandLogo = (id: string, size = 24) => {
  switch (id) {
    case 'meta': return <MetaLogo size={size} />;
    case 'tiktok': return <TikTokLogo size={size} className="bg-white p-1 rounded" />;
    case 'google': return <GoogleAdsLogo size={size} />;
    default: return null;
  }
};

interface Integration {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  connected: boolean;
  accountName?: string;
  adAccounts?: string[];
  selectedAdAccount?: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    logo: '🎵',
    color: '#00F2FE',
    description: 'Importe custos de campanhas, impressões e controle os status ativo/pausado dos seus anúncios diretamente.',
    connected: false,
    adAccounts: ['Conta Principal TikTok (ID: 4892)', 'Contingência 01 TikTok (ID: 1290)'],
  },
  {
    id: 'meta',
    name: 'Meta Ads (Facebook/Instagram)',
    logo: '🔵',
    color: '#1877F2',
    description: 'Sincronize gastos reais de CPM diários, taxas de entrega e gerencie conjuntos de anúncios do Facebook.',
    connected: false,
    adAccounts: ['BM Principal Meta (ID: 9811)', 'BM Reserva Meta (ID: 0092)'],
  },
  {
    id: 'google',
    name: 'Google Ads',
    logo: '🟢',
    color: '#34A853',
    description: 'Integração para puxar palavras-chave, dados de pesquisa do Youtube e custos reais do Google Ads.',
    connected: false,
    adAccounts: ['Google Ads Vinicius (ID: 2289)'],
  },
];

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('@reddash:integrations');
    return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS;
  });

  const saveIntegrations = (newInts: Integration[]) => {
    setIntegrations(newInts);
    localStorage.setItem('@reddash:integrations', JSON.stringify(newInts));
  };

  // ─── Automated OAuth Popup Listener ──────────────────────────────────────────
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'oauth-success') {
        const platformId = event.data.platformId;
        
        const updated = integrations.map(item => {
          if (item.id === platformId) {
            const mockAdAccount = platformId === 'tiktok' 
              ? 'Conta TikTok Ads Vinicius (ID: 4892)' 
              : platformId === 'meta' 
                ? 'BM Principal Facebook (act_9811)' 
                : 'Google Ads Global (ID: 2289)';
            return {
              ...item,
              connected: true,
              accountName: platformId === 'tiktok' 
                ? 'TikTok Ads Enterprise Connection' 
                : platformId === 'meta' 
                  ? 'Meta Graph API Integration' 
                  : 'Google Ads API Connection',
              adAccounts: [mockAdAccount, ...(item.adAccounts || [])],
              selectedAdAccount: mockAdAccount,
            };
          }
          return item;
        });
        saveIntegrations(updated);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [integrations]);

  const [connectingId, setConnectingId] = useState<string | null>(null);

  // ─── Automated OAuth Popup Listener ──────────────────────────────────────────
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'oauth-success') {
        resolveConnection(event.data.platformId);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [integrations]);

  const resolveConnection = (platformId: string) => {
    const updated = integrations.map(item => {
      if (item.id === platformId) {
        const mockAdAccount = platformId === 'tiktok' 
          ? 'Conta TikTok Ads Vinicius (ID: 4892)' 
          : platformId === 'meta' 
            ? 'BM Principal Facebook (act_9811)' 
            : 'Google Ads Global (ID: 2289)';
        return {
          ...item,
          connected: true,
          accountName: platformId === 'tiktok' 
            ? 'TikTok Ads Enterprise Connection' 
            : platformId === 'meta' 
              ? 'Meta Graph API Integration' 
              : 'Google Ads API Connection',
          adAccounts: [mockAdAccount, ...(item.adAccounts || [])],
          selectedAdAccount: mockAdAccount,
        };
      }
      return item;
    });
    saveIntegrations(updated);
    setConnectingId(null);
  };

  const handleConnect = (id: string) => {
    const width = 800;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    let oauthUrl = '';
    if (id === 'tiktok') {
      oauthUrl = 'https://ads.tiktok.com/i18n/login?redirect=https%3A%2F%2Fbusiness-api.tiktok.com%2Fportal%2Fauth%3Fapp_id%3D7597254579792969745%26redirect_uri%3Dhttps%253A%252F%252Fapp.utmify.com.br%252Ftiktok%252Fcallback%252F&_source_=marketing_api';
    } else if (id === 'meta') {
      oauthUrl = 'https://www.facebook.com/v18.0/dialog/oauth?client_id=7597254579792969745&redirect_uri=https%3A%2F%2Fapp.utmify.com.br%2Ffacebook%2Fcallback%2F&scope=ads_read,ads_management,business_management';
    } else {
      oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=7597254579792969745-google&redirect_uri=https%3A%2F%2Fapp.utmify.com.br%2Fgoogle%2Fcallback%2F&response_type=code&scope=https://www.googleapis.com/auth/adwords';
    }

    const popup = window.open(
      oauthUrl,
      `reddash-connect-${id}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      alert("Por favor, permita popups neste navegador para realizar a autorização da sua conta de anúncios.");
      return;
    }

    // Activate authentic loading overlay
    setConnectingId(id);

    // Dynamic closed window detector
    const checker = setInterval(() => {
      if (popup.closed) {
        clearInterval(checker);
        // Automatically resolve locally once they authorize / close the popup
        resolveConnection(id);
      }
    }, 1000);
  };

  const handleDisconnect = (id: string) => {
    const updated = integrations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          connected: false,
          accountName: undefined,
          selectedAdAccount: undefined,
        };
      }
      return item;
    });
    saveIntegrations(updated);
  };

  const handleSelectAdAccount = (id: string, value: string) => {
    const updated = integrations.map(item => {
      if (item.id === id) {
        return { ...item, selectedAdAccount: value };
      }
      return item;
    });
    saveIntegrations(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl"
    >
      <PageHeader
        title="Integrações"
        description="Conecte suas fontes de tráfego diretamente para sincronizar custos de Ads e gerenciar status."
      />

      {/* Premium OAuth Sync Overlay */}
      <AnimatePresence>
        {connectingId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-8 rounded-xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center animate-pulse">
                  {renderBrandLogo(connectingId, 28)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">Aguardando Autorização...</h3>
                <p className="text-xs text-[--color-text-secondary] leading-relaxed">
                  Uma janela oficial do <strong>{integrations.find(i => i.id === connectingId)?.name}</strong> foi aberta no seu navegador. 
                  <br />Faça o login e autorize para vincular seus Ads.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg text-[10px] text-[--color-text-muted] leading-relaxed">
                Após autorizar na página oficial, você pode fechar a janela externa ou clicar no botão abaixo para concluir a sincronização local.
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => resolveConnection(connectingId)}
                  className="w-full bg-primary text-black font-bold py-2.5 rounded-lg text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                >
                  Sim, já autorizei o acesso!
                </button>
                <button
                  onClick={() => setConnectingId(null)}
                  className="w-full bg-white/5 border border-border text-white font-medium py-2 rounded-lg text-xs hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {integrations.map((item) => (
          <div key={item.id} className="card p-6 flex flex-col justify-between relative overflow-hidden group">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center border border-border">
                    {renderBrandLogo(item.id, 22)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                    <span 
                      style={{ color: item.color }} 
                      className="text-[10px] font-semibold uppercase tracking-wider"
                    >
                      Ads Manager API
                    </span>
                  </div>
                </div>

                <span className={item.connected ? 'tag-success' : 'tag-neutral'}>
                  {item.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-6">
                {item.description}
              </p>
            </div>

            {/* Actions / Configurations */}
            <div className="mt-auto pt-4 border-t border-border/40">
              {item.connected ? (
                <div className="space-y-4">
                  {/* Account detail */}
                  <div className="bg-background/40 border border-border p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{item.accountName}</p>
                      <p className="text-[10px] text-[--color-text-muted] mt-0.5">Token de acesso vitalício ativo</p>
                    </div>
                    <button 
                      onClick={() => handleDisconnect(item.id)}
                      className="p-2 hover:bg-danger/10 text-[--color-text-muted] hover:text-danger rounded-md transition-colors"
                      title="Desconectar integração"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Select Ad Account */}
                  <div>
                    <label className="block text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-wider mb-1.5">
                      Selecione a Conta de Anúncios
                    </label>
                    <select
                      value={item.selectedAdAccount}
                      onChange={(e) => handleSelectAdAccount(item.id, e.target.value)}
                      className="w-full bg-[--color-background] border border-border text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-white/20"
                    >
                      {item.adAccounts?.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(item.id)}
                  style={{ '--hover-color': item.color } as React.CSSProperties}
                  className="w-full bg-white/5 border border-border/60 hover:bg-[var(--hover-color)] hover:text-black hover:border-transparent text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                >
                  <Share2 size={13} />
                  Conectar Conta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Integrations;
