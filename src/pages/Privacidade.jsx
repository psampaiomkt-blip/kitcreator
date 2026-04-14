import { Link } from 'react-router-dom'

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            ← KitCreator
          </Link>
        </div>

        <h1 className="text-3xl font-serif text-[#F0EDE8] mb-2">Política de Privacidade</h1>
        <p className="text-[#444] text-sm mb-10">Última atualização: abril de 2026</p>

        <div className="space-y-8 text-[#888] text-sm leading-relaxed">
          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">1. Quem somos</h2>
            <p>
              KitCreator é uma ferramenta de diagnóstico e geração de mídia kit para criadores de
              conteúdo brasileiros. Somos responsáveis pelo tratamento dos seus dados pessoais
              conforme descrito nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">2. Quais dados coletamos</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Nome completo</li>
              <li>Endereço de email</li>
              <li>Handle do Instagram</li>
              <li>Arquivos de mídia kit enviados para análise (não armazenados permanentemente)</li>
              <li>Data e hora do cadastro</li>
              <li>Número de análises realizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">3. Para que usamos seus dados</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Fornecer o serviço de diagnóstico de mídia kit</li>
              <li>Controlar o limite de análises gratuitas por email</li>
              <li>Enviar comunicações sobre o KitCreator, novos recursos e oportunidades — somente se você consentiu ao se cadastrar</li>
              <li>Melhorar nosso produto com base no uso agregado e anônimo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">4. Base legal (LGPD)</h2>
            <p>
              O tratamento dos seus dados é baseado no seu <strong className="text-[#F0EDE8]">consentimento</strong> (Art. 7º, I da
              Lei 13.709/2018) e na <strong className="text-[#F0EDE8]">execução do contrato</strong> de uso do serviço (Art. 7º, V).
              O consentimento para comunicações de marketing é opcional e pode ser revogado a
              qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">5. Compartilhamento de dados</h2>
            <p>
              Seus dados não são vendidos ou compartilhados com terceiros para fins comerciais.
              Utilizamos os seguintes fornecedores para operar o serviço:
            </p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>Supabase — armazenamento do banco de dados (servidores no Brasil)</li>
              <li>Netlify — hospedagem da aplicação (EUA, com adequação ao GDPR)</li>
              <li>Anthropic — processamento de IA para análise do kit (EUA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">6. Seus direitos</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li>Confirmar a existência do tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento para comunicações de marketing</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer direito, entre em contato:{' '}
              <span className="text-[#C8F135]">privacidade@kitcreator.com.br</span>
            </p>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">7. Retenção dos dados</h2>
            <p>
              Seus dados são mantidos enquanto você utilizar o serviço. Arquivos de mídia kit
              enviados para análise são processados em memória e não são armazenados
              permanentemente em nossos servidores.
            </p>
          </section>

          <section>
            <h2 className="text-[#F0EDE8] text-base font-medium mb-3">8. Contato</h2>
            <p>
              Dúvidas sobre esta política:{' '}
              <span className="text-[#C8F135]">privacidade@kitcreator.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
