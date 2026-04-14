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

        <p className="text-[#666] text-xs leading-relaxed">{criterio.problema}</p>

        {criterio.status !== 'ok' && (
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
    const margin = 20
    let y = 0

    // Header bar
    doc.setFillColor(10, 10, 10)
    doc.rect(0, 0, W, 32, 'F')
    doc.setTextColor(200, 241, 53)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('KitCreator', margin, 14)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Diagnóstico de Mídia Kit', margin, 21)
    doc.setTextColor(70, 70, 70)
    doc.text(
      `${userData.nome} • @${userData.instagram} • ${new Date().toLocaleDateString('pt-BR')}`,
      margin, 28
    )

    y = 46

    // Score
    const scoreColor =
      analysis.scoreTotal < 40 ? [255, 77, 77]
      : analysis.scoreTotal < 70 ? [255, 176, 32]
      : [200, 241, 53]
    doc.setTextColor(...scoreColor)
    doc.setFontSize(42)
    doc.setFont('helvetica', 'bold')
    doc.text(`${analysis.scoreTotal}`, margin, y)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(14)
    doc.text('/100', margin + 28, y)

    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(
      `${analysis.problemasCriticos} problema(s) crítico(s) identificado(s)`,
      margin, y
    )

    y += 10
    // Summary box
    doc.setFillColor(24, 24, 24)
    const summaryLines = doc.splitTextToSize(analysis.resumoGeral, W - margin * 2 - 8)
    doc.roundedRect(margin, y, W - margin * 2, summaryLines.length * 5 + 8, 2, 2, 'F')
    doc.setTextColor(160, 160, 160)
    doc.setFontSize(9)
    doc.text(summaryLines, margin + 4, y + 6)
    y += summaryLines.length * 5 + 16

    // Pricing
    if (analysis.faixaPrecoSugerida) {
      doc.setFillColor(200, 241, 53, 0.08)
      doc.setDrawColor(200, 241, 53)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, y, W - margin * 2, 12, 2, 2, 'FD')
      doc.setTextColor(200, 241, 53)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Faixa de preço sugerida:', margin + 4, y + 8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(240, 237, 232)
      doc.text(analysis.faixaPrecoSugerida, margin + 52, y + 8)
      y += 20
    }

    // Criteria
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('ANÁLISE DETALHADA', margin, y)
    y += 8

    const sorted = [...analysis.criterios].sort(
      (a, b) => a.scoreObtido / a.scoreMaximo - b.scoreObtido / b.scoreMaximo
    )

    sorted.forEach((c) => {
      if (y > 262) { doc.addPage(); y = 20 }

      const sc = STATUS[c.status] || STATUS.atencao
      const [r, g, b] = c.status === 'critico' ? [255, 77, 77]
        : c.status === 'atencao' ? [255, 176, 32] : [100, 200, 80]

      // Left accent line
      doc.setDrawColor(r, g, b)
      doc.setLineWidth(0.8)
      doc.line(margin, y, margin, y + 22)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(240, 237, 232)
      doc.text(`${c.nome}`, margin + 4, y + 5)

      doc.setTextColor(r, g, b)
      doc.setFontSize(8)
      doc.text(`${c.scoreObtido}/${c.scoreMaximo} pts • ${sc.label}`, margin + 4, y + 11)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      const pLines = doc.splitTextToSize(c.problema, W - margin * 2 - 10)
      doc.text(pLines, margin + 4, y + 17)

      if (c.status !== 'ok') {
        const sLines = doc.splitTextToSize(`→ ${c.sugestao}`, W - margin * 2 - 10)
        const nextY = y + 17 + pLines.length * 4.5
        if (nextY + sLines.length * 4.5 < 275) {
          doc.setTextColor(160, 200, 60)
          doc.text(sLines, margin + 4, nextY)
          y += 17 + (pLines.length + sLines.length) * 4.5 + 6
        } else {
          y += 17 + pLines.length * 4.5 + 6
        }
      } else {
        y += 17 + pLines.length * 4.5 + 6
      }
    })

    // Next steps
    if (analysis.proximosPasso?.length) {
      if (y > 220) { doc.addPage(); y = 20 }

      // Section background
      const stepsHeight = analysis.proximosPasso.length * 14 + 24
      doc.setFillColor(10, 10, 10)
      doc.roundedRect(margin - 4, y - 6, W - margin * 2 + 8, stepsHeight, 3, 3, 'F')

      doc.setTextColor(200, 241, 53)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('PRÓXIMOS PASSOS', margin, y + 2)
      y += 12

      analysis.proximosPasso.forEach((s, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        // Number badge
        doc.setFillColor(200, 241, 53)
        doc.circle(margin + 3, y - 1, 3, 'F')
        doc.setTextColor(10, 10, 10)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(`${i + 1}`, margin + 1.8, y + 1)

        doc.setTextColor(220, 220, 220)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(s, W - margin * 2 - 12)
        doc.text(lines, margin + 9, y + 1)
        y += lines.length * 5 + 4
      })
      y += 6
    }

    // Footer
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(7)
      doc.text('Gerado por KitCreator - todos os direitos reservados', margin, 290)
      doc.text(`${i}/${pages}`, W - margin, 290, { align: 'right' })
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

        {/* Pricing suggestion */}
        {analysis.faixaPrecoSugerida && (
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8F135]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#C8F135] text-sm font-bold">R$</span>
            </div>
            <div>
              <p className="text-[#444] text-xs">Faixa de preço sugerida para o seu perfil</p>
              <p className="text-[#F0EDE8] text-sm font-medium mt-0.5">
                {analysis.faixaPrecoSugerida}
              </p>
            </div>
          </div>
        )}

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
            Seu mídia kit não é só um PDF.<br />
            É o que decide se uma marca te chama… ou te ignora.<br />
            Cansada(o) de ser ignorada(o) pelas marcas?<br />
            A decisão que muda isso está a um clique.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full bg-[#C8F135] text-[#0A0A0A] font-bold rounded-xl py-4 text-sm hover:bg-[#d4f54d] active:scale-[0.98] transition-all mb-2"
          >
            Quero meu mídia kit mais profissional →
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
            Baixar diagnóstico completo (PDF)
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
