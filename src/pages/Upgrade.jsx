import { useNavigate } from 'react-router-dom'

// Substitua pelo link real do seu produto no Kiwify
const KIWIFY_URL = 'https://pay.kiwify.com.br/SEU_LINK_AQUI'

const features = [
  'Diagnóstico completo — todos os 8 critérios detalhados com explicações',
  'Mídia kit reescrito pela IA — bio, engajamento correto, tabela de preços, audiência',
  'PDF profissional para download — 3 opções de tema visual',
  'Atualização automática mensal — kit se atualiza conforme seus números evoluem',
  'Destaque no catálogo — seu perfil aparece para marcas que buscam influenciadores',
  'Score mensal de evolução — comparativo com benchmarks do seu nicho',
  'Kits ilimitados — um para cada nicho ou plataforma (Instagram, TikTok, LinkedIn)',
  'Alertas de oportunidade — marcas buscando perfis como o seu na sua cidade',
  'Histórico de 12 meses — linha do tempo da evolução do perfil',
]

export default function Upgrade() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-16">
      <div className="max-w-lg mx-auto fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            KitCreator Pro
          </span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-[#F0EDE8] leading-tight mb-3">
            Seu kit profissional<br />em minutos.
          </h1>
          <p className="text-[#666] text-sm leading-relaxed max-w-sm mx-auto">
            A IA corrige todos os problemas identificados no diagnóstico e entrega seu novo kit pronto para enviar a marcas.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-[#161616] border border-[#C8F135]/20 rounded-2xl p-6 mb-4">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[#555] text-base mb-1">R$</span>
              <span className="text-5xl font-bold text-[#F0EDE8] leading-none">29</span>
              <span className="text-[#555] text-base mb-1">/mês</span>
            </div>
            <p className="text-[#444] text-xs">
              ou <span className="text-[#F0EDE8]">R$ 239/ano</span> — economize 2 meses
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[#C8F135] text-sm mt-0.5 flex-shrink-0">✓</span>
                <span className="text-[#888] text-sm leading-snug">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={KIWIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#C8F135] text-[#0A0A0A] font-bold rounded-xl py-4 text-center text-sm hover:bg-[#d4f54d] active:scale-[0.98] transition-all"
          >
            Assinar o Plano Pro →
          </a>

          <p className="text-center text-[#444] text-xs mt-3">
            Pix, cartão ou boleto • Cancele a qualquer momento
          </p>
        </div>

        {/* Social proof placeholder */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
              <span className="text-[#555] text-xs">★</span>
            </div>
            <div>
              <p className="text-[#F0EDE8] text-sm leading-relaxed">
                "Mandei o kit novo para 3 marcas na mesma semana. Fechei 2 parcerias em 10 dias."
              </p>
              <p className="text-[#444] text-xs mt-1">@influenciadora • nicho lifestyle • SP</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/diagnostico')}
            className="text-[#444] text-sm hover:text-[#666] transition-colors"
          >
            ← Voltar ao diagnóstico
          </button>
        </div>
      </div>
    </div>
  )
}
