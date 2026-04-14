const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

async function query(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
    },
    ...options,
  })
  const data = await res.json()
  return { data, status: res.status }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido' }) }
  }

  const { nome, email, instagram, consentimento } = body

  if (!nome || !email || !instagram) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Preencha todos os campos' }) }
  }

  const emailLower = email.toLowerCase().trim()

  // Check if user already exists
  const { data: existing } = await query(
    `usuarios?email=eq.${encodeURIComponent(emailLower)}&select=id,uploads`,
    { method: 'GET' }
  )

  if (existing && existing.length > 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ uploads: existing[0].uploads, novo: false }),
    }
  }

  // Create new user
  const { data, status } = await query('usuarios', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      nome: nome.trim(),
      email: emailLower,
      instagram: instagram.replace('@', '').trim(),
      consentimento_marketing: consentimento || false,
    }),
  })

  if (status >= 400) {
    console.error('Supabase error:', data)
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao salvar dados. Tente novamente.' }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ uploads: 0, novo: true }),
  }
}
