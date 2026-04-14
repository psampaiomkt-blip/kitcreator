import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Resize and compress image before sending to API
async function compressImage(file) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const MAX = 1200
      let { width, height } = img

      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
      URL.revokeObjectURL(url)
      resolve({ images: [base64], mediaType: 'image/jpeg', pageCount: 1 })
    }

    img.src = url
  })
}

// Convert ALL pages of PDF to images using pdfjs (max 8 pages)
async function pdfToImages(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = Math.min(pdf.numPages, 8)
  const images = []

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.6 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise

    images.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1])
  }

  return { images, mediaType: 'image/jpeg', pageCount: totalPages }
}

// Loading screen shown during API call
function LoadingAnalysis() {
  const messages = [
    'Lendo seu mídia kit...',
    'Identificando problemas críticos...',
    'Calculando score de profissionalismo...',
    'Comparando com benchmarks do mercado...',
    'Preparando seu diagnóstico...',
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % messages.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[#2A2A2A] border-t-[#C8F135] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#C8F135]" />
        </div>
      </div>
      <div className="text-center">
        <p
          key={idx}
          className="text-[#F0EDE8] text-sm fade-up"
        >
          {messages[idx]}
        </p>
        <p className="text-[#444] text-xs mt-2">Isso leva cerca de 30 segundos</p>
      </div>
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  // Guard: must have user data from step 1
  useEffect(() => {
    const user = localStorage.getItem('kitcreator_user')
    if (!user) navigate('/')
  }, [navigate])

  const processFile = useCallback(async (f) => {
    if (!f) return
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!valid.includes(f.type)) {
      setError('Formato não suportado. Use JPG, PNG, WEBP ou PDF.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 20MB.')
      return
    }
    setFile(f)
    setError(null)

    if (f.type === 'application/pdf') {
      setPreview({ type: 'pdf', name: f.name })
    } else {
      const url = URL.createObjectURL(f)
      setPreview({ type: 'image', url, name: f.name })
    }
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      processFile(e.dataTransfer.files[0])
    },
    [processFile]
  )

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      let imageData
      if (file.type === 'application/pdf') {
        imageData = await pdfToImages(file)
      } else {
        imageData = await compressImage(file)
      }

      const userData = JSON.parse(localStorage.getItem('kitcreator_user') || '{}')

      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageData.images,
          mediaType: imageData.mediaType,
          pageCount: imageData.pageCount,
          userData,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao analisar. Tente novamente.')
      }

      const analysis = await response.json()
      sessionStorage.setItem('kitcreator_analysis', JSON.stringify(analysis))
      navigate('/diagnostico')
    } catch (err) {
      setError(err.message || 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  if (loading) return <LoadingAnalysis />

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16">
      <div className="fade-up w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            KitCreator
          </span>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#2A2A2A] border border-[#C8F135]/30 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#C8F135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#555] text-xs">Seus dados</span>
          </div>
          <div className="w-8 h-px bg-[#333]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#C8F135] flex items-center justify-center">
              <span className="text-[#0A0A0A] text-xs font-bold">2</span>
            </div>
            <span className="text-[#F0EDE8] text-xs">Upload</span>
          </div>
          <div className="w-8 h-px bg-[#2A2A2A]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <span className="text-[#555] text-xs">3</span>
            </div>
            <span className="text-[#555] text-xs">Diagnóstico</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#F0EDE8] mb-2">
            Envie seu mídia kit atual
          </h1>
          <p className="text-[#666] text-sm">
            PDF ou imagem • A IA analisa em segundos
          </p>
        </div>

        {/* Upload zone */}
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#C8F135] bg-[#C8F135]/5 scale-[1.01]'
                : 'border-[#2A2A2A] hover:border-[#444]'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center">
                <svg className="w-7 h-7 text-[#C8F135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-[#F0EDE8] text-sm font-medium">
                  Arraste aqui ou clique para selecionar
                </p>
                <p className="text-[#444] text-xs mt-1">JPG, PNG, WEBP ou PDF • Máx 20MB</p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => processFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4">
            {preview.type === 'image' ? (
              <img
                src={preview.url}
                alt="Preview do kit"
                className="w-full max-h-52 object-contain rounded-xl mb-3"
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#2A2A2A] rounded-xl mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#C8F135]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#C8F135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#F0EDE8] text-sm font-medium truncate max-w-[240px]">
                    {preview.name}
                  </p>
                  <p className="text-[#555] text-xs">PDF • Primeira página será analisada</p>
                </div>
              </div>
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); setError(null) }}
              className="text-[#555] text-xs hover:text-[#888] transition-colors"
            >
              Trocar arquivo
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-xl px-4 py-3">
            <p className="text-[#FF4D4D] text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file}
          className={`w-full mt-4 py-4 rounded-xl font-semibold text-sm transition-all ${
            file
              ? 'bg-[#C8F135] text-[#0A0A0A] hover:bg-[#d4f54d] active:scale-[0.98]'
              : 'bg-[#161616] text-[#333] cursor-not-allowed border border-[#2A2A2A]'
          }`}
        >
          Analisar meu mídia kit →
        </button>

        <p className="text-center text-[#333] text-xs mt-3">
          Análise gratuita. Seus arquivos não são armazenados.
        </p>
      </div>
    </div>
  )
}
