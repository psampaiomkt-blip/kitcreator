import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', instagram: '', consentimento: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Campo obrigatório'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.instagram.trim()) e.instagram = 'Campo obrigatório'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/.netlify/functions/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ geral: data.error || 'Erro ao continuar. Tente novamente.' })
        setLoading(false)
        return
      }

      const instagram = form.instagram.replace('@', '').trim()
      localStorage.setItem('kitcreator_user', JSON.stringify({
        ...form,
        instagram,
        uploads: data.uploads,
      }))

      if (data.uploads >= 2) {
        setErrors({ geral: 'Este email já utilizou as 2 análises gratuitas disponíveis.' })
        setLoading(false)
        return
      }

      navigate('/upload')
    } catch {
      setErrors({ geral: 'Erro de conexão. Tente novamente.' })
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, geral: undefined }))
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16">
      <div className="fade-up w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[#C8F135] font-mono text-xs tracking-[0.2em] uppercase">
            KitCreator
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-[#F0EDE8] leading-tight mb-3">
            Seu mídia kit está<br />perdendo parcerias.
          </h1>
          <p className="text-[#666] text-sm leading-relaxed">
            Analisamos o que está errado em 30 segundos.<br />Gratuito, sem cartão.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#C8F135] flex items-center justify-center">
              <span className="text-[#0A0A0A] text-xs font-bold">1</span>
            </div>
            <span className="text-[#F0EDE8] text-xs">Seus dados</span>
          </div>
          <div className="w-8 h-px bg-[#2A2A2A]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <span className="text-[#555] text-xs">2</span>
            </div>
            <span className="text-[#555] text-xs">Upload</span>
          </div>
          <div className="w-8 h-px bg-[#2A2A2A]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <span className="text-[#555] text-xs">3</span>
            </div>
            <span className="text-[#555] text-xs">Diagnóstico</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange('nome')}
              className="w-full bg-[#161616] border border-[#2A2A2A] text-[#F0EDE8] rounded-xl px-4 py-3.5 text-sm placeholder-[#444] focus:border-[#C8F135] focus:outline-none transition-colors"
            />
            {errors.nome && <p className="text-[#FF4D4D] text-xs mt-1 ml-1">{errors.nome}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email profissional"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full bg-[#161616] border border-[#2A2A2A] text-[#F0EDE8] rounded-xl px-4 py-3.5 text-sm placeholder-[#444] focus:border-[#C8F135] focus:outline-none transition-colors"
            />
            {errors.email && <p className="text-[#FF4D4D] text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-sm select-none">@</span>
              <input
                type="text"
                placeholder="seuhandle"
                value={form.instagram}
                onChange={handleChange('instagram')}
                className="w-full bg-[#161616] border border-[#2A2A2A] text-[#F0EDE8] rounded-xl px-4 pl-8 py-3.5 text-sm placeholder-[#444] focus:border-[#C8F135] focus:outline-none transition-colors"
              />
            </div>
            {errors.instagram && <p className="text-[#FF4D4D] text-xs mt-1 ml-1">{errors.instagram}</p>}
          </div>

          {/* Consent checkbox — obrigatório pela LGPD */}
          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="consentimento"
              checked={form.consentimento}
              onChange={handleChange('consentimento')}
              className="mt-0.5 w-4 h-4 rounded border-[#2A2A2A] bg-[#161616] accent-[#C8F135] flex-shrink-0 cursor-pointer"
            />
            <label htmlFor="consentimento" className="text-[#555] text-xs leading-relaxed cursor-pointer">
              Concordo em receber comunicações da KitCreator. Você pode cancelar a qualquer momento.
              Ao continuar, você aceita nossa{' '}
              <Link to="/privacidade" className="text-[#C8F135] underline" target="_blank">
                Política de Privacidade
              </Link>
              .
            </label>
          </div>

          {errors.geral && (
            <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-xl px-4 py-3">
              <p className="text-[#FF4D4D] text-sm">{errors.geral}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-4 text-sm font-semibold transition-all mt-2 ${
              loading
                ? 'bg-[#2A2A2A] text-[#444] cursor-not-allowed'
                : 'bg-[#C8F135] text-[#0A0A0A] hover:bg-[#d4f54d] active:scale-[0.98]'
            }`}
          >
            {loading ? 'Aguarde...' : 'Continuar →'}
          </button>

          <p className="text-center text-[#444] text-xs pt-1">
            Você tem direito a 2 análises gratuitas.
          </p>
        </form>
      </div>

      <div className="mt-16 text-[#2A2A2A] text-xs">
        KitCreator • Feito para criadores brasileiros
      </div>
    </div>
  )
}
