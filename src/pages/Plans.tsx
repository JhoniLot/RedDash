import React from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Sparkles, User, Users, Shield, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';

interface PricingPlan {
  id: 'solo' | 'agency' | 'enterprise';
  name: string;
  price: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  stripeUrl: string;
  popular?: boolean;
}

const Plans: React.FC = () => {
  const { userPlan, setUserPlan } = useAppContext();

  const pricingPlans: PricingPlan[] = [
    {
      id: 'solo',
      name: 'Plano Solo',
      price: 'R$ 97',
      description: 'Ideal para 1 afiliado ou produtor individual.',
      icon: User,
      stripeUrl: 'https://buy.stripe.com/6oUcN6cPX3TAcM44NPdfG03',
      features: [
        'Conexão com 1 conta RedTrack',
        'Sincronização ao vivo de Meta Ads',
        'Sincronização ao vivo de TikTok Ads',
        'Controle de status ativas/pausadas',
        'Exportação de relatórios em CSV',
        'Suporte premium por e-mail'
      ]
    },
    {
      id: 'agency',
      name: 'Plano Agency / Team',
      price: 'R$ 197',
      description: 'Perfeito para agências de tráfego e times pequenos.',
      icon: Users,
      stripeUrl: 'https://buy.stripe.com/fZu14o7vD89Q3bu1BDdfG04',
      popular: true,
      features: [
        'Tudo do Plano Solo',
        'Multi-clientes (Workspaces separados)',
        'Time de até 5 pessoas',
        'Suporte prioritário por WhatsApp',
        'Dashboard integrada com conversões S2S'
      ]
    },
    {
      id: 'enterprise',
      name: 'Plano Enterprise / White-label',
      price: 'R$ 397',
      description: 'O nível máximo de autoridade e profissionalismo.',
      icon: Shield,
      stripeUrl: 'https://buy.stripe.com/6oU28s7vDbm28vOfstdfG05',
      features: [
        'Tudo do Plano Agency',
        '100% White-label (Sem marca RedDash)',
        'Logomarca customizada da sua Agência',
        'Domínio customizado (Opcional)',
        'Apresentação premium para seus clientes',
        'Suporte VIP do nosso time de engenharia'
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Planos & Assinatura" 
        subtitle="Escolha o plano ideal para alavancar os resultados da sua operação de tráfego com o RedTrack."
      />

      {/* Simulador de Plano (WOW FACTOR) */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-white">Ambiente de Simulação de Planos</h3>
          </div>
          <p className="text-xs text-[--color-text-secondary]">
            Como você está no painel de administração local, você pode mudar o seu plano instantaneamente para testar os recursos premium na hora!
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {pricingPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setUserPlan(plan.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all border
                ${userPlan === plan.id 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white/[0.02] border-border text-[--color-text-secondary] hover:bg-white/5 hover:text-white'}`}
            >
              Simular {plan.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => {
          const Icon = plan.icon;
          const isActive = userPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-surface rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden
                ${isActive 
                  ? 'border-primary ring-1 ring-primary shadow-xl shadow-primary/5 bg-gradient-to-b from-surface to-primary/5' 
                  : plan.popular 
                    ? 'border-primary/40 hover:border-primary/80' 
                    : 'border-border hover:border-border-hover'}`}
            >
              {/* Popular Badge */}
              {plan.popular && !isActive && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}

              {/* Active Plan Badge */}
              {isActive && (
                <div className="absolute top-0 right-0 bg-success text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Plano Ativo
                </div>
              )}

              <div>
                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border
                    ${isActive 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-surface-2 border-border text-[--color-text-secondary]'}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{plan.name}</h3>
                    <p className="text-[11px] text-[--color-text-secondary]">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 my-5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-[--color-text-muted]">/ mês</span>
                </div>

                <hr className="border-border my-4" />

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check size={14} className="text-success mt-0.5 shrink-0" />
                      <span className="text-xs text-[--color-text-secondary] leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {isActive ? (
                  <div className="w-full bg-success/10 border border-success/20 text-success text-center py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                    Você já está usando este plano!
                  </div>
                ) : (
                  <a
                    href={plan.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                      ${plan.popular 
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10' 
                        : 'bg-white/[0.02] border border-border text-white hover:bg-white/5'}`}
                  >
                    Assinar Agora
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Trust Badge */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
            <CreditCard size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Pagamento 100% Seguro via Stripe</h4>
            <p className="text-[10px] text-[--color-text-secondary]">
              Suas transações são criptografadas diretamente pelo gateway de pagamento oficial do Stripe. Liberação imediata.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-[--color-text-muted]">
          <span>💳 Cartão de Crédito</span>
          <span>⚡ Pix Instantâneo</span>
          <span>🛡️ Garantia de 7 dias</span>
        </div>
      </div>
    </div>
  );
};

export default Plans;
