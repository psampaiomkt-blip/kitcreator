import { useNavigate } from 'react-router-dom'

const KIWIFY_URL = 'https://pay.kiwify.com.br/zfYDXzh'

const steps = [
  'Diagnóstico completo: todos os 8 critérios detalhados com pontos positivos, problemas e sugestões de melhoria.',
  'Mídia Kit reescrito pela IA a partir do diagnóstico — personalizado para o seu perfil e nicho.',
  'Bônus: Guia de prospecção para marcas — modelos de mensagem, dicas de abordagem e os erros que fazem marcas ignorarem influenciadores.',
  'Seu mídia kit pronto para prospectar de forma profissional as suas próximas parcerias.',
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
            Seu mídia kit ainda mais<br />desejado pelas marcas<br />
            <span className="text-[#C8F135]">(em minutos)</span>
          </h1>
          <p className="text-[#666] text-sm leading-relaxed max-w-sm mx-auto">
            A IA corrige os pontos do diagnóstico e entrega seu mídia kit atualizado, pronto para apresentar parcerias estratégicas às marcas.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-[#161616] border border-[#C8F135]/20 rounded-2xl p-6 mb-4">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#C8F135] text-[#0A0A0A] text-xs font-bold px-2.5 py-1 rounded-full">
                5% OFF apenas neste mês
              </span>
            </div>
            <div className="flex items-end gap-3 mb-1">
              <span className="text-[#555] text-sm line-through">R$ 49,90</span>
              <div className="flex items-end gap-1">
                <span className="text-[#555] text-base mb-1">R$</span>
                <span className="text-5xl font-bold text-[#F0EDE8] leading-none">47</span>
                <span className="text-3xl font-bold text-[#F0EDE8] leading-none">,41</span>
              </div>
            </div>
            <p className="text-[#444] text-xs">Pagamento único</p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#C8F135]/10 border border-[#C8F135]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C8F135] text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-[#888] text-sm leading-snug pt-0.5">{step}</span>
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
            quero um mídia kit desejado pelas marcas →
          </a>

          <p className="text-center text-[#444] text-xs mt-3">
            pix, cartão ou boleto | condições especiais
          </p>
        </div>
      </div>
    </div>
  )
}
