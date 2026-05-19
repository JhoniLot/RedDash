import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Share2, Trash2, Key, HelpCircle, ShieldAlert } from 'lucide-react';
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
  isReal?: boolean;
  accessToken?: string;
  accountId?: string;
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

  const [realModePlatforms, setRealModePlatforms] = useState<Record<string, boolean>>({});
  const [realInputs, setRealInputs] = useState<Record<string, { token: string; account: string }>>({});
  const [activeHelpPlatform, setActiveHelpPlatform] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const saveIntegrations = (newInts: Integration[]) => {
    setIntegrations(newInts);
    localStorage.setItem('@reddash:integrations', JSON.stringify(newInts));
  };

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
          isReal: false,
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

  const handleConnectSimulated = (id: string) => {
    const width = 800;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const oauthUrl = `${window.location.origin}/oauth-sim.html?platformId=${id}`;

    const popup = window.open(
      oauthUrl,
      `reddash-connect-${id}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      alert("Por favor, permita popups neste navegador para realizar a autorização da sua conta de anúncios.");
      return;
    }

    setConnectingId(id);

    const checker = setInterval(() => {
      if (popup.closed) {
        clearInterval(checker);
        resolveConnection(id);
      }
    }, 1000);
  };

  const handleConnectReal = (id: string) => {
    const inputs = realInputs[id] || { token: '', account: '' };
    if (!inputs.token.trim() || !inputs.account.trim()) {
      alert('Por favor, preencha o Token de Acesso e o ID da Conta de Anúncios.');
      return;
    }

    const updated = integrations.map(item => {
      if (item.id === id) {
        const adAccountLabel = id === 'meta' 
          ? `BM Conta (act_${inputs.account.trim()})` 
          : id === 'tiktok'
            ? `TikTok Conta (${inputs.account.trim()})`
            : `Google Conta (${inputs.account.trim()})`;
        return {
          ...item,
          connected: true,
          isReal: true,
          accessToken: inputs.token.trim(),
          accountId: inputs.account.trim(),
          accountName: id === 'meta' 
            ? 'Meta Ads API Real' 
            : id === 'tiktok' 
              ? 'TikTok Ads API Real' 
              : 'Google Ads API Real',
          adAccounts: [adAccountLabel],
          selectedAdAccount: adAccountLabel
        };
      }
      return item;
    });
    saveIntegrations(updated);
  };

  const handleDisconnect = (id: string) => {
    const updated = integrations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          connected: false,
          isReal: undefined,
          accessToken: undefined,
          accountId: undefined,
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

  const handleInputChange = (id: string, field: 'token' | 'account', value: string) => {
    setRealInputs(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { token: '', account: '' }),
        [field]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl space-y-6"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => {
          const isRealMode = !!realModePlatforms[item.id];
          const currentInput = realInputs[item.id] || { token: '', account: '' };

          return (
            <div key={item.id} className="card p-6 flex flex-col justify-between relative overflow-hidden group border border-border/60 hover:border-border transition-all">
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
                        className="text-[9px] font-bold uppercase tracking-wider"
                      >
                        {item.connected && item.isReal ? 'API Real Conectada' : 'Ads Manager API'}
                      </span>
                    </div>
                  </div>

                  <span className={item.connected ? (item.isReal ? 'tag-success bg-green-500/10 text-green-400 border-green-500/20' : 'tag-success') : 'tag-neutral'}>
                    {item.connected ? (item.isReal ? 'Real (API)' : 'Simulado') : 'Desconectado'}
                  </span>
                </div>

                <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Advanced Help Button */}
              {!item.connected && (
                <button
                  onClick={() => setActiveHelpPlatform(activeHelpPlatform === item.id ? null : item.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 mb-4 outline-none transition-colors"
                >
                  <HelpCircle size={12} />
                  Como conseguir essas credenciais reais?
                </button>
              )}

              {/* Connection Actions Container */}
              <div className="mt-auto pt-4 border-t border-border/40 space-y-4">
                {item.connected ? (
                  <div className="space-y-4">
                    {/* Account detail */}
                    <div className="bg-background/40 border border-border p-3.5 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{item.accountName}</p>
                        {item.isReal ? (
                          <p className="text-[10px] text-green-400 mt-1 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Token: {item.accessToken ? `${item.accessToken.slice(0, 8)}••••••••` : 'Ativo'}
                          </p>
                        ) : (
                          <p className="text-[10px] text-[--color-text-muted] mt-0.5">Simulador Ativo</p>
                        )}
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
                        Conta de Anúncios Ativa
                      </label>
                      <select
                        value={item.selectedAdAccount}
                        onChange={(e) => handleSelectAdAccount(item.id, e.target.value)}
                        className="w-full bg-[--color-background] border border-border text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-white/20 font-medium"
                      >
                        {item.adAccounts?.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Tab Select Mode */}
                    <div className="flex gap-1.5 p-1 bg-background/60 border border-border/80 rounded-lg mb-4 text-[10px]">
                      <button
                        onClick={() => setRealModePlatforms(prev => ({ ...prev, [item.id]: false }))}
                        className={`flex-1 py-1.5 font-bold uppercase rounded-md transition-all ${!isRealMode ? 'bg-surface text-white shadow-sm' : 'text-[--color-text-secondary] hover:text-white'}`}
                      >
                        Simulador (Rápido)
                      </button>
                      <button
                        onClick={() => setRealModePlatforms(prev => ({ ...prev, [item.id]: true }))}
                        className={`flex-1 py-1.5 font-bold uppercase rounded-md transition-all ${isRealMode ? 'bg-surface text-white shadow-sm' : 'text-[--color-text-secondary] hover:text-white'}`}
                      >
                        Conexão Real (API)
                      </button>
                    </div>

                    {isRealMode ? (
                      /* Real Manual API Inputs */
                      <div className="space-y-3.5 bg-background/30 p-3 rounded-lg border border-border/50">
                        <div>
                          <label className="block text-[9px] font-bold text-[--color-text-secondary] uppercase tracking-wider mb-1">
                            Token de Acesso (Access Token)
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Insira seu Token da API..."
                              value={currentInput.token}
                              onChange={(e) => handleInputChange(item.id, 'token', e.target.value)}
                              className="w-full bg-[--color-background] border border-border text-white text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-primary/40 transition-colors"
                            />
                            <Key size={12} className="absolute left-3 top-2.5 text-[--color-text-muted]" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-[--color-text-secondary] uppercase tracking-wider mb-1">
                            {item.id === 'meta' ? 'ID da Conta de Anúncios (Ad Account ID)' : 'ID do Anunciante (Advertiser ID)'}
                          </label>
                          <input
                            type="text"
                            placeholder={item.id === 'meta' ? 'Ex: act_123456789 ou 123456789' : 'Ex: 70984129587123984'}
                            value={currentInput.account}
                            onChange={(e) => handleInputChange(item.id, 'account', e.target.value)}
                            className="w-full bg-[--color-background] border border-border text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>

                        <button
                          onClick={() => handleConnectReal(item.id)}
                          className="w-full bg-primary text-black font-bold py-2.5 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
                        >
                          Salvar e Conectar Real
                        </button>
                      </div>
                    ) : (
                      /* Simulated popup flow */
                      <button
                        onClick={() => handleConnectSimulated(item.id)}
                        style={{ '--hover-color': item.color } as React.CSSProperties}
                        className="w-full bg-white/5 border border-border/60 hover:bg-[var(--hover-color)] hover:text-black hover:border-transparent text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                      >
                        <Share2 size={13} />
                        Conectar Conta (Simulador)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Drawer / Modal for help instructions */}
      <AnimatePresence>
        {activeHelpPlatform && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-surface-2 rounded-lg flex items-center justify-center">
                    {renderBrandLogo(activeHelpPlatform, 18)}
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Como obter credenciais do {activeHelpPlatform === 'meta' ? 'Meta Ads' : 'TikTok Ads'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveHelpPlatform(null)}
                  className="text-xs text-[--color-text-secondary] hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                >
                  Fechar
                </button>
              </div>

              {activeHelpPlatform === 'meta' ? (
                <div className="space-y-4 text-xs text-[--color-text-secondary] leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">1</span>
                      Passo 1: Criar Usuário do Sistema
                    </p>
                    <p>Acesse o seu <strong>Gerenciador de Negócios (Business Manager)</strong>, vá em <em>Configurações do Negócio &gt; Usuários &gt; Usuários do Sistema</em> e clique em Adicionar.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">2</span>
                      Passo 2: Conceder Ativos
                    </p>
                    <p>Selecione o usuário do sistema criado, clique em <strong>Atribuir Ativos</strong> e selecione a sua <strong>Conta de Anúncios</strong>. Marque todas as caixas de controle completo de campanhas e salve.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">3</span>
                      Passo 3: Gerar Token Vitalício
                    </p>
                    <p>Clique no botão <strong>Gerar Novo Token</strong>. Selecione o seu aplicativo (ou crie um básico de negócios no portal de Devs do Meta), marque as permissões: <code>ads_read</code> e <code>ads_management</code>. Clique em Gerar. Esse Token gerado nunca expira!</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">4</span>
                      Passo 4: Pegar ID da Conta
                    </p>
                    <p>Vá em <em>Configurações do Negócio &gt; Contas &gt; Contas de Anúncios</em>. Copie a sequência numérica listada ao lado do nome da sua conta (ex: <code>9811094857129</code>).</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-[--color-text-secondary] leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">1</span>
                      Passo 1: Acessar Portal de Negócios
                    </p>
                    <p>Acesse o <strong>TikTok Ads Manager</strong> da sua conta de anúncios, clique no menu superior de ferramentas de negócios e vá para a aba de desenvolvedores/configurações avançadas.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">2</span>
                      Passo 2: Gerar Token de Desenvolvedor
                    </p>
                    <p>Vá na seção de <strong>Developer Access Tokens (Tokens de Acesso a APIs)</strong> e gere um token permanente para ler dados. Este token tem formato longo e fornece acesso direto às chaves de leitura de campanhas do TikTok Ads.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px]">3</span>
                      Passo 3: Pegar o Advertiser ID
                    </p>
                    <p>O ID da conta do TikTok (Advertiser ID) pode ser encontrado facilmente no canto superior direito do seu painel do TikTok Ads Manager (uma sequência longa de números como <code>70984129587123984</code>).</p>
                  </div>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex gap-2.5 items-start">
                <ShieldAlert size={14} className="text-primary mt-0.5 shrink-0" />
                <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                  <strong>Nota de Segurança:</strong> As suas credenciais reais de API são armazenadas localmente de forma segura no seu próprio navegador e são transmitidas diretamente para a API oficial do {activeHelpPlatform === 'meta' ? 'Facebook' : 'TikTok'}, sem passar por intermediários.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Integrations;
