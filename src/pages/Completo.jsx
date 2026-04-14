import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

const STATUS = {
  critico: { color: '#FF4D4D', label: 'Crítico' },
  atencao: { color: '#FFB020', label: 'Atenção' },
  ok: { color: '#C8F135', label: 'OK' },
}

const BONUS_CONTENT = {
  intro: 'A maioria dos influenciadores perde parcerias não pelo kit — mas pela forma como prospecta. Este guia reúne o que as marcas e agências esperam receber, e como você pode se destacar desde o primeiro contato.',
  oQueMarcasAnalisam: [
    'Fit entre o nicho do criador e o público-alvo da marca — é o primeiro filtro, sempre',
    'Taxa de engajamento real (não seguidores): marcas profissionais calculam isso antes de responder',
    'Qualidade dos comentários: comunidade ativa vs. comentários genéricos ou suspeitos',
    'Histórico de parcerias: cases com métricas reais geram muito mais confiança',
    'Profissionalismo na comunicação: resposta rápida, clareza e ausência de erros básicos',
    'Alinhamento de valores: marcas evitam criadores com posicionamentos conflitantes com a sua identidade',
  ],
  modelos: [
    {
      titulo: 'Modelo 1 — Primeiro contato (abordagem fria)',
      texto: `Olá, [Nome]!\n\nSou [Seu Nome], criador(a) de conteúdo de [nicho] com [X] seguidores no Instagram (@[handle]).\n\nAcompanho a [Marca] há algum tempo e vejo um alinhamento real entre o meu público — [descreva brevemente: ex: mulheres de 25-35 anos interessadas em lifestyle saudável] — e os valores da marca.\n\nGostaria de apresentar meu mídia kit para avaliação de uma possível parceria. Posso enviar?\n\nFico à disposição para conversar!\n[Seu nome] | @[handle]`,
    },
    {
      titulo: 'Modelo 2 — Follow-up após envio do kit',
      texto: `Olá, [Nome]! Tudo bem?\n\nPassando para verificar se recebeu o mídia kit que enviei em [data]. Fico feliz em tirar qualquer dúvida, adaptar algum formato ou apresentar cases adicionais conforme a necessidade da campanha.\n\nAguardo seu retorno!\n[Seu nome] | @[handle]`,
    },
    {
      titulo: 'Modelo 3 — Resposta a brief ou proposta recebida',
      texto: `Olá, [Nome]! Obrigado(a) pelo interesse.\n\nLi o brief com atenção e consigo atender ao que foi solicitado. Seguem minhas condições para o formato [X]:\n\n• [Formato 1]: R$ [valor]\n• [Formato 2]: R$ [valor]\n• Prazo de entrega: [X dias úteis após aprovação]\n• Revisões inclusas: [X]\n\nCaso queira ajustar o escopo, estou aberta(o) a conversar. Posso enviar contrato?\n\n[Seu nome] | @[handle]`,
    },
  ],
  dicas: [
    { titulo: 'Canal certo para cada tipo de marca', texto: 'Email: maior credibilidade para marcas médias e grandes. LinkedIn: ideal para agências e gerentes de marketing. DM no Instagram: funciona para marcas pequenas e nativas do digital. Evite WhatsApp pessoal no primeiro contato.' },
    { titulo: 'Melhor momento para enviar', texto: 'Terça a quinta-feira, entre 9h–11h ou 14h–16h. Evite segundas (acúmulo da semana) e sextas (modo fim de semana). E-mails enviados pela manhã têm taxa de abertura ~30% maior.' },
    { titulo: 'Personalização mínima que faz diferença', texto: 'Mencione um produto ou campanha recente da marca. Mostre que você realmente usa ou conhece. Uma mensagem genérica enviada para 100 marcas converte menos do que 10 mensagens personalizadas.' },
    { titulo: 'Follow-up sem ser invasivo', texto: 'Se não houver resposta em 5 dias úteis, envie um follow-up uma única vez. Se ainda não responder, siga em frente. Insistência prejudica sua imagem para futuras oportunidades.' },
  ],
  erros: [
    'Enviar o kit sem nenhuma personalização para a marca',
    'Focar em número de seguidores ao invés de engajamento e relevância',
    'Usar email pessoal (@gmail, @hotmail) como contato profissional',
    'Não fazer follow-up — a maioria das marcas recebe centenas de kits',
    'Aceitar parcerias fora do nicho só pelo dinheiro (afasta a audiência real)',
    'Não ter os entregáveis e prazos especificados — gera retrabalho e conflitos',
    'Pedir valores sem justificativa — sempre mostre o que a marca recebe pelo investimento',
  ],
}

function generatePDF(analysis, userData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.width
  const H = doc.internal.pageSize.height
  const ml = 18
  const mr = 18
  const contentW = W - ml - mr
  let y = 0

  const addPage = () => { doc.addPage(); y = 22 }
  const checkPage = (needed) => { if (y + needed > H - 18) addPage() }

  // ── HEADER ─────────────────────────────────────────────────
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, W, 38, 'F')

  // Accent line
  doc.setFillColor(200, 241, 53)
  doc.rect(0, 38, W, 1.5, 'F')

  doc.setTextColor(200, 241, 53)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('KitCreator', ml, 13)

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Diagnóstico Completo de Mídia Kit', ml, 22)

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(7.5)
  doc.text(
    `${userData.nome}  •  @${userData.instagram}  •  ${new Date().toLocaleDateString('pt-BR')}`,
    ml, 32
  )

  y = 52

  // ── SCORE ──────────────────────────────────────────────────
  const scoreRgb =
    analysis.scoreTotal < 40 ? [220, 60, 60]
    : analysis.scoreTotal < 70 ? [210, 140, 20]
    : [60, 170, 60]

  doc.setTextColor(...scoreRgb)
  doc.setFontSize(44)
  doc.setFont('helvetica', 'bold')
  doc.text(`${analysis.scoreTotal}`, ml, y)

  doc.setTextColor(130, 130, 130)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('/100', ml + 28, y - 2)

  y += 5
  doc.setFontSize(8.5)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `${analysis.problemasCriticos} problema${analysis.problemasCriticos !== 1 ? 's' : ''} crítico${analysis.problemasCriticos !== 1 ? 's' : ''} identificado${analysis.problemasCriticos !== 1 ? 's' : ''}`,
    ml, y
  )

  // ── RESUMO GERAL ───────────────────────────────────────────
  y += 9
  doc.setFillColor(245, 245, 245)
  doc.setDrawColor(215, 215, 215)
  doc.setLineWidth(0.3)
  const resumoLines = doc.splitTextToSize(analysis.resumoGeral, contentW - 8)
  const resumoH = resumoLines.length * 5.2 + 10
  doc.roundedRect(ml, y, contentW, resumoH, 2, 2, 'FD')
  doc.setTextColor(55, 55, 55)
  doc.setFontSize(8.5)
  doc.text(resumoLines, ml + 4, y + 7)
  y += resumoH + 12

  // ── ANÁLISE COMPLETA (8 critérios) ─────────────────────────
  checkPage(20)
  doc.setTextColor(15, 15, 15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DIAGNÓSTICO COMPLETO', ml, y)
  doc.setFillColor(200, 241, 53)
  doc.rect(ml, y + 2.5, 60, 1, 'F')
  y += 10

  const sorted = [...analysis.criterios].sort(
    (a, b) => a.scoreObtido / a.scoreMaximo - b.scoreObtido / b.scoreMaximo
  )

  sorted.forEach((c) => {
    const sc = STATUS[c.status] || STATUS.atencao
    const [cr, cg, cb] = c.status === 'critico' ? [210, 50, 50]
      : c.status === 'atencao' ? [200, 130, 10] : [40, 150, 40]

    const posLines = c.pontosPositivos
      ? doc.splitTextToSize(`✓  ${c.pontosPositivos}`, contentW - 9)
      : []
    const pLines = c.problema
      ? doc.splitTextToSize(c.problema, contentW - 9)
      : []
    const sLines = c.sugestao
      ? doc.splitTextToSize(`→  ${c.sugestao}`, contentW - 9)
      : []

    const bodyH =
      (posLines.length > 0 ? posLines.length * 4.8 + 4 : 0) +
      (pLines.length > 0 ? pLines.length * 4.8 + 3 : 0) +
      (sLines.length > 0 ? sLines.length * 4.8 + 3 : 0)
    const blockH = 19 + bodyH + 6

    checkPage(blockH + 4)

    doc.setFillColor(249, 249, 249)
    doc.setDrawColor(228, 228, 228)
    doc.setLineWidth(0.2)
    doc.roundedRect(ml, y, contentW, blockH, 2, 2, 'FD')

    doc.setFillColor(cr, cg, cb)
    doc.rect(ml, y, 2.5, blockH, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(20, 20, 20)
    doc.text(c.nome, ml + 6, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(cr, cg, cb)
    doc.text(`${c.scoreObtido}/${c.scoreMaximo} pts  •  ${sc.label}`, ml + 6, y + 13)

    let lineY = y + 19

    if (posLines.length > 0) {
      doc.setTextColor(25, 105, 25)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(posLines, ml + 6, lineY)
      lineY += posLines.length * 4.8 + 4
    }

    if (pLines.length > 0) {
      doc.setTextColor(65, 65, 65)
      doc.setFontSize(8)
      doc.text(pLines, ml + 6, lineY)
      lineY += pLines.length * 4.8 + 3
    }

    if (sLines.length > 0) {
      doc.setTextColor(10, 80, 10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.text(sLines, ml + 6, lineY)
      doc.setFont('helvetica', 'normal')
    }

    y += blockH + 5
  })

  // ── PRÓXIMOS PASSOS ────────────────────────────────────────
  if (analysis.proximosPasso?.length) {
    const stepsH = analysis.proximosPasso.reduce((acc, s) => {
      return acc + doc.splitTextToSize(s, contentW - 16).length * 5 + 6
    }, 0)
    checkPage(stepsH + 30)

    doc.setFillColor(10, 10, 10)
    doc.roundedRect(ml, y, contentW, stepsH + 22, 3, 3, 'F')

    doc.setTextColor(200, 241, 53)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PRÓXIMOS PASSOS', ml + 5, y + 10)
    doc.setFillColor(200, 241, 53)
    doc.rect(ml + 5, y + 12, 45, 0.8, 'F')

    let stepY = y + 20
    analysis.proximosPasso.forEach((s, i) => {
      doc.setFillColor(200, 241, 53)
      doc.circle(ml + 8, stepY - 1, 3, 'F')
      doc.setTextColor(10, 10, 10)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(`${i + 1}`, ml + 6.6, stepY + 1)

      const lines = doc.splitTextToSize(s, contentW - 18)
      doc.setTextColor(210, 210, 210)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.text(lines, ml + 14, stepY + 1)
      stepY += lines.length * 5 + 6
    })

    y += stepsH + 28
  }

  // ── BÔNUS: GUIA DE PROSPECÇÃO ──────────────────────────────
  addPage()

  // Bonus header
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFillColor(200, 241, 53)
  doc.rect(0, 28, W, 1.2, 'F')

  doc.setTextColor(200, 241, 53)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('★  BÔNUS EXCLUSIVO', ml, 12)

  doc.setTextColor(240, 240, 240)
  doc.setFontSize(13)
  doc.text('Guia de Prospecção para Marcas', ml, 22)

  y = 38

  // Intro
  const introLines = doc.splitTextToSize(BONUS_CONTENT.intro, contentW)
  doc.setTextColor(70, 70, 70)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(introLines, ml, y)
  y += introLines.length * 5.2 + 10

  // O que as marcas analisam
  checkPage(15)
  doc.setTextColor(15, 15, 15)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('O que as marcas analisam antes de responder', ml, y)
  doc.setFillColor(200, 241, 53)
  doc.rect(ml, y + 2, 80, 0.8, 'F')
  y += 9

  BONUS_CONTENT.oQueMarcasAnalisam.forEach((item) => {
    checkPage(10)
    const lines = doc.splitTextToSize(`•  ${item}`, contentW - 4)
    doc.setTextColor(55, 55, 55)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(lines, ml + 2, y)
    y += lines.length * 5 + 2.5
  })

  y += 6

  // Modelos de mensagem
  BONUS_CONTENT.modelos.forEach((modelo) => {
    checkPage(50)

    doc.setTextColor(15, 15, 15)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.text(modelo.titulo, ml, y)
    y += 7

    const modeloLines = doc.splitTextToSize(modelo.texto, contentW - 8)
    const boxH = modeloLines.length * 4.8 + 10
    doc.setFillColor(248, 248, 248)
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.25)
    doc.roundedRect(ml, y, contentW, boxH, 2, 2, 'FD')
    doc.setFillColor(200, 241, 53)
    doc.rect(ml, y, 2.5, boxH, 'F')
    doc.setTextColor(55, 55, 55)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(modeloLines, ml + 6, y + 7)
    y += boxH + 10
  })

  // Dicas
  checkPage(20)
  doc.setTextColor(15, 15, 15)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Dicas práticas para aumentar suas chances', ml, y)
  doc.setFillColor(200, 241, 53)
  doc.rect(ml, y + 2, 78, 0.8, 'F')
  y += 10

  BONUS_CONTENT.dicas.forEach((dica) => {
    const titleLines = doc.splitTextToSize(dica.titulo, contentW - 8)
    const textLines = doc.splitTextToSize(dica.texto, contentW - 8)
    const boxH = (titleLines.length + textLines.length) * 5 + 10
    checkPage(boxH + 5)

    doc.setFillColor(248, 255, 232)
    doc.setDrawColor(180, 220, 60)
    doc.setLineWidth(0.25)
    doc.roundedRect(ml, y, contentW, boxH, 2, 2, 'FD')

    doc.setTextColor(30, 80, 10)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text(titleLines, ml + 5, y + 7)

    doc.setTextColor(55, 55, 55)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(textLines, ml + 5, y + 7 + titleLines.length * 5)

    y += boxH + 5
  })

  // Erros comuns
  checkPage(20)
  y += 4
  doc.setFillColor(10, 10, 10)
  const errosH = BONUS_CONTENT.erros.length * 9 + 18
  doc.roundedRect(ml, y, contentW, errosH, 3, 3, 'F')

  doc.setTextColor(255, 100, 100)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Erros que fazem marcas ignorarem influenciadores', ml + 5, y + 9)
  doc.setDrawColor(255, 100, 100)
  doc.setLineWidth(0.5)
  doc.line(ml + 5, y + 11, ml + 100, y + 11)

  let errY = y + 18
  BONUS_CONTENT.erros.forEach((erro) => {
    doc.setTextColor(190, 190, 190)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`✕  ${erro}`, ml + 5, errY)
    errY += 9
  })

  y += errosH + 10

  // ── FOOTER ─────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(215, 215, 215)
    doc.setLineWidth(0.3)
    doc.line(ml, H - 12, W - mr, H - 12)
    doc.setTextColor(160, 160, 160)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Gerado por KitCreator - todos os direitos reservados', ml, H - 7)
    doc.text(`${i} / ${pages}`, W - mr, H - 7, { align: 'right' })
  }

  doc.save(`diagnostico-completo-${userData.instagram}.pdf`)
}

export default function Completo() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [userData, setUserData] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('kitcreator_analysis')
    const user = localStorage.getItem('kitcreator_user')
    if (!raw || !user) {
      navigate('/')
      return
    }
    try {
      setAnalysis(JSON.parse(raw))
      setUserData(JSON.parse(user))
    } catch {
      navigate('/')
    }
  }, [navigate])

  const handleDownload = () => {
    if (!analysis || !userData) return
    setDownloading(true)
    setTimeout(() => {
      generatePDF(analysis, userData)
      setDownloading(false)
    }, 100)
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#C8F135] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16">
      <div className="fade-up w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            KitCreator
          </span>
        </div>

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-[#C8F135]/10 border border-[#C8F135]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#C8F135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-serif text-[#F0EDE8] mb-3">
          Seu diagnóstico completo está pronto
        </h1>
        <p className="text-[#666] text-sm leading-relaxed mb-2">
          Inclui todos os 8 critérios com pontos positivos, problemas e sugestões de melhoria — além do bônus com modelos de prospecção para marcas.
        </p>

        {/* Score preview */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 mb-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#444] text-xs uppercase tracking-wider">Score do seu kit</span>
            <span
              className="text-2xl font-bold"
              style={{
                color: analysis.scoreTotal < 40 ? '#FF4D4D'
                  : analysis.scoreTotal < 70 ? '#FFB020' : '#C8F135'
              }}
            >
              {analysis.scoreTotal}<span className="text-[#444] text-sm font-normal">/100</span>
            </span>
          </div>

          <div className="space-y-1.5 text-left">
            {[
              { label: 'Diagnóstico completo (8 critérios)', done: true },
              { label: 'Pontos positivos do seu kit', done: true },
              { label: 'Plano de ação priorizado', done: true },
              { label: 'Bônus: Guia de prospecção para marcas', done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#C8F135] text-xs">✓</span>
                <span className="text-[#888] text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full rounded-xl py-4 font-bold text-sm transition-all mb-3 ${
            downloading
              ? 'bg-[#2A2A2A] text-[#444] cursor-not-allowed'
              : 'bg-[#C8F135] text-[#0A0A0A] hover:bg-[#d4f54d] active:scale-[0.98]'
          }`}
        >
          {downloading ? 'Gerando PDF...' : 'Baixar meu diagnóstico completo →'}
        </button>

        <p className="text-[#333] text-xs">
          PDF gerado diretamente no seu navegador — sem espera
        </p>
      </div>
    </div>
  )
}
