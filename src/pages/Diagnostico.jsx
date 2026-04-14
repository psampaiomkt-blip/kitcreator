import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

const STATUS = {
  critico: { color: '#FF4D4D', label: 'Crítico', symbol: '✕' },
  atencao: { color: '#FFB020', label: 'Atenção', symbol: '!' },
  ok: { color: '#C8F135', label: 'OK', symbol: '✓' },
}

function ScoreCircle({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 200)
    return () => clearTimeout(t)
  }, [score])

  const offset = circ - (progress / 100) * circ
  const color = score < 40 ? '#FF4D4D' : score < 70 ? '#FFB020' : '#C8F135'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1A1A1A" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-[#F0EDE8] leading-none">{score}</span>
        <span className="block text-[10px] text-[#555] mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function CriterioCard({ criterio, locked }) {
  const config = STATUS[criterio.status] || STATUS.atencao
  const pct = (criterio.scoreObtido / criterio.scoreMaximo) * 100

  return (
    <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 overflow-hidden">
      {locked && (
        <div className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(10,10,10,0.7)' }}>
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[#555] text-xs">Plano Pro</span>
          </div>
        </div>
      )}

      <div className={locked ? 'blur-sm select-none' : ''}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: config.color + '18', color: config.color }}
            >
              {config.symbol}
            </div>
            <span className="text-[#F0EDE8] text-sm font-medium">{criterio.nome}</span>
          </div>
          <span className="text-[#444] text-xs tabular-nums">
            {criterio.scoreObtido}/{criterio.scoreMaximo}
          </span>
        </div>

        <div className="h-1 bg-[#2A2A2A] rounded-full mb-3 overflow-hidden">
          <div
            className="h-1 rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: config.color,
              transition: 'width 1s ease',
            }}
          />
        </div>

        {criterio.pontosPositivos && (
          <p className="text-[#5fa84a] text-xs leading-relaxed mb-1.5">
            ✓ {criterio.pontosPositivos}
          </p>
        )}

        {criterio.problema && (
          <p className="text-[#666] text-xs leading-relaxed">{criterio.problema}</p>
        )}

        {criterio.sugestao && (
          <p className="text-[#C8F135] text-xs mt-2 leading-relaxed">
            → {criterio.sugestao}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Diagnostico() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [userData, setUserData] = useState(null)

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

  const downloadPDF = () => {
    if (!analysis || !userData) return

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.width
    const H = doc.internal.pageSize.height
    const ml = 18   // margin left
    const mr = 18   // margin right
    const contentW = W - ml - mr
    let y = 0

    // ── HEADER (dark) ──────────────────────────────────────────
    doc.setFillColor(10, 10, 10)
    doc.rect(0, 0, W, 36, 'F')

    doc.setTextColor(200, 241, 53)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KitCreator', ml, 13)

    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Diagnóstico de Mídia Kit — Versão Gratuita', ml, 21)

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7.5)
    doc.text(
      `${userData.nome}  •  @${userData.instagram}  •  ${new Date().toLocaleDateString('pt-BR')}`,
      ml, 30
    )

    y = 48

    // ── SCORE ──────────────────────────────────────────────────
    const scoreColor =
      analysis.scoreTotal < 40 ? [220, 60, 60]
      : analysis.scoreTotal < 70 ? [210, 140, 20]
      : [60, 160, 60]

    doc.setTextColor(...scoreColor)
    doc.setFontSize(40)
    doc.setFont('helvetica', 'bold')
    doc.text(`${analysis.scoreTotal}`, ml, y)

    doc.setTextColor(140, 140, 140)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('/100', ml + 26, y - 2)

    y += 4
    doc.setFontSize(8.5)
    doc.setTextColor(90, 90, 90)
    doc.text(
      `${analysis.problemasCriticos} problema${analysis.problemasCriticos !== 1 ? 's' : ''} crítico${analysis.problemasCriticos !== 1 ? 's' : ''} identificado${analysis.problemasCriticos !== 1 ? 's' : ''}`,
      ml, y
    )

    // ── RESUMO GERAL ───────────────────────────────────────────
    y += 8
    doc.setFillColor(245, 245, 245)
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    const resumoLines = doc.splitTextToSize(analysis.resumoGeral, contentW - 8)
    const resumoH = resumoLines.length * 5.2 + 10
    doc.roundedRect(ml, y, contentW, resumoH, 2, 2, 'FD')
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8.5)
    doc.text(resumoLines, ml + 4, y + 7)
    y += resumoH + 8

    // ── ANÁLISE DETALHADA (apenas 3 critérios gratuitos) ───────
    doc.setTextColor(20, 20, 20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('ANÁLISE DETALHADA', ml, y)
    doc.setDrawColor(200, 241, 53)
    doc.setLineWidth(0.5)
    doc.line(ml, y + 2, ml + 55, y + 2)
    y += 9

    doc.setTextColor(130, 130, 130)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Exibindo 3 de 8 critérios — versão gratuita', ml, y)
    y += 8

    const sorted = [...analysis.criterios].sort(
      (a, b) => a.scoreObtido / a.scoreMaximo - b.scoreObtido / b.scoreMaximo
    )
    const visibleCriterios = sorted.slice(0, 3)

    visibleCriterios.forEach((c) => {
      const sc = STATUS[c.status] || STATUS.atencao
      const [cr, cg, cb] = c.status === 'critico' ? [210, 50, 50]
        : c.status === 'atencao' ? [200, 130, 10] : [50, 150, 50]

      const posLines = c.pontosPositivos
        ? doc.splitTextToSize(`✓ ${c.pontosPositivos}`, contentW - 7)
        : []
      const pLines = c.problema
        ? doc.splitTextToSize(c.problema, contentW - 7)
        : []
      const sLines = c.sugestao
        ? doc.splitTextToSize(`Sugestão: ${c.sugestao}`, contentW - 7)
        : []

      const contentHeight =
        (posLines.length > 0 ? posLines.length * 4.8 + 3 : 0) +
        (pLines.length > 0 ? pLines.length * 4.8 + 2 : 0) +
        (sLines.length > 0 ? sLines.length * 4.8 + 3 : 0)
      const blockH = 18 + contentHeight + 6

      if (y + blockH > H - 22) { doc.addPage(); y = 20 }

      // Card background
      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.25)
      doc.roundedRect(ml, y, contentW, blockH, 2, 2, 'FD')

      // Status left bar
      doc.setFillColor(cr, cg, cb)
      doc.rect(ml, y, 2.5, blockH, 'F')

      // Critério nome
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(25, 25, 25)
      doc.text(c.nome, ml + 6, y + 7)

      // Score + status
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(cr, cg, cb)
      doc.text(`${c.scoreObtido}/${c.scoreMaximo} pts  •  ${sc.label}`, ml + 6, y + 13)

      let lineY = y + 20

      // Pontos positivos
      if (posLines.length > 0) {
        doc.setTextColor(30, 110, 30)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(posLines, ml + 6, lineY)
        lineY += posLines.length * 4.8 + 3
      }

      // Problema
      if (pLines.length > 0) {
        doc.setTextColor(70, 70, 70)
        doc.setFontSize(8)
        doc.text(pLines, ml + 6, lineY)
        lineY += pLines.length * 4.8 + 2
      }

      // Sugestão
      if (sLines.length > 0) {
        doc.setTextColor(30, 100, 30)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.text(sLines, ml + 6, lineY)
        doc.setFont('helvetica', 'normal')
      }

      y += blockH + 5
    })

    // ── CRITÉRIOS BLOQUEADOS (teaser) ──────────────────────────
    if (y + 30 > H - 22) { doc.addPage(); y = 20 }

    const lockedCount = sorted.length - 3
    doc.setFillColor(15, 15, 15)
    doc.roundedRect(ml, y, contentW, 28, 2, 2, 'F')

    doc.setTextColor(200, 241, 53)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`+ ${lockedCount} critérios bloqueados na versão gratuita`, ml + 6, y + 9)

    doc.setTextColor(160, 160, 160)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Acesse o diagnóstico completo em kit-creator.netlify.app', ml + 6, y + 17)

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7.5)
    doc.text('Inclui todos os critérios, próximos passos detalhados e plano de ação.', ml + 6, y + 23)

    y += 36

    // ── FOOTER ─────────────────────────────────────────────────
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(ml, H - 12, W - mr, H - 12)
      doc.setTextColor(160, 160, 160)
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.text('Gerado por KitCreator - todos os direitos reservados', ml, H - 7)
      doc.text(`${i} / ${pages}`, W - mr, H - 7, { align: 'right' })
    }

    doc.save(`diagnostico-kit-${userData.instagram}.pdf`)
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#C8F135] animate-spin" />
      </div>
    )
  }

  const sorted = [...analysis.criterios].sort(
    (a, b) => a.scoreObtido / a.scoreMaximo - b.scoreObtido / b.scoreMaximo
  )
  const VISIBLE = 3
  const lockedCount = sorted.length - VISIBLE

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-16">
      <div className="max-w-xl mx-auto fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            KitCreator
          </span>
        </div>

        {/* Score + summary */}
        <div className="text-center mb-8">
          <ScoreCircle score={analysis.scoreTotal} />
          <h1 className="text-3xl font-serif text-[#F0EDE8] mt-4 mb-2">
            Diagnóstico do seu mídia kit
          </h1>
          <p className="text-[#666] text-sm max-w-md mx-auto leading-relaxed">
            {analysis.resumoGeral}
          </p>

          {analysis.problemasCriticos > 0 && (
            <div className="inline-flex items-center gap-2 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-full px-4 py-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] animate-pulse" />
              <span className="text-[#FF4D4D] text-sm">
                {analysis.problemasCriticos} problema
                {analysis.problemasCriticos > 1 ? 's críticos' : ' crítico'} identificado
                {analysis.problemasCriticos > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Criteria list */}
        <div className="mb-6">
          <p className="text-[#444] text-xs uppercase tracking-wider mb-4">
            Análise por critério — {VISIBLE} de {sorted.length} visíveis
          </p>
          <div className="space-y-3">
            {sorted.map((c, i) => (
              <CriterioCard key={c.nome} criterio={c} locked={i >= VISIBLE} />
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#161616] border border-[#C8F135]/15 rounded-2xl p-6 mb-6 text-center">
          <h2 className="text-[#F0EDE8] text-xl font-serif mb-3">
            Quer seu mídia kit ainda mais desejado pelas marcas?
          </h2>
          <p className="text-[#666] text-sm mb-5 leading-relaxed">
            Quer baixar seu diagnóstico completo com todos os pontos de melhoria detalhados e próximos passos? Clique no link abaixo.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full bg-[#C8F135] text-[#0A0A0A] font-bold rounded-xl py-4 text-sm hover:bg-[#d4f54d] active:scale-[0.98] transition-all mb-2"
          >
            quero meu diagnóstico completo →
          </button>
          <p className="text-[#444] text-xs">pix, cartão ou boleto | condições especiais</p>
        </div>

        {/* Download */}
        <div className="text-center mb-10">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 bg-[#C8F135] text-[#0A0A0A] font-semibold text-sm rounded-xl px-5 py-2.5 hover:bg-[#d4f54d] active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar meu diagnóstico
          </button>
          <p className="text-[#333] text-xs mt-2">Inclui todos os 8 critérios com sugestões detalhadas</p>
        </div>

        {/* Next steps */}
        {analysis.proximosPasso?.length > 0 && (
          <div className="border-t border-[#1A1A1A] pt-8">
            <p className="text-[#444] text-xs uppercase tracking-wider mb-4">
              Próximos passos prioritários
            </p>
            <div className="space-y-3">
              {analysis.proximosPasso.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-[#C8F135] text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[#666] text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
