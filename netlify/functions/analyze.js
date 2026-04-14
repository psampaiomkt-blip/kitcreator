import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

async function getUploads(email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id,uploads`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  const data = await res.json()
  return data && data.length > 0 ? data[0] : null
}

async function incrementUpload(email) {
  const user = await getUploads(email)
  if (!user) return
  await fetch(
    `${SUPABASE_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploads: (user.uploads || 0) + 1 }),
    }
  )
}

const PROMPT = (userData, pageCount = 1) => `Você é um especialista sênior em marketing de influenciadores no Brasil, com profundo conhecimento do que marcas brasileiras buscam ao avaliar um parceiro criador de conteúdo.

Analise este mídia kit (${pageCount} página${pageCount > 1 ? 's' : ''} enviada${pageCount > 1 ? 's' : ''}) e avalie com base nos 8 critérios profissionais abaixo. Considere o conteúdo de TODAS as páginas ao avaliar cada critério — não julgue ausência de informação se ela está em outra página.

Dados do influenciador:
- Nome: ${userData?.nome || 'Não informado'}
- Instagram: @${userData?.instagram || 'não informado'}

CRITÉRIOS DE AVALIAÇÃO:

1. Taxa de engajamento (máx 20 pts)
   O kit mostra taxa de engajamento explícita e calculada corretamente (curtidas + comentários ÷ seguidores × 100)? Está dentro do benchmark do nicho? Marcas eliminam kits sem esse dado.

2. Dados demográficos da audiência (máx 18 pts)
   Tem faixa etária, gênero predominante e localização com dados específicos? Marcas precisam saber se a audiência é o público delas.

3. Prova de resultado de campanhas anteriores (máx 15 pts)
   Tem cases com métricas reais ("2.300 cliques", "cupom usado 47 vezes")? Kits sem isso parecem inexperientes.

4. Posicionamento e nicho claro (máx 12 pts)
   A bio comunica quem é, para quem fala e qual é a especialidade? Posicionamento vago não converte.

5. Formatos e entregáveis especificados (máx 12 pts)
   Lista claramente reels, stories, feed, UGC, live? Tem prazo de entrega informado? Marcas precisam saber o que estão comprando.

6. Consistência dos números entre plataformas (máx 10 pts)
   Os números informados são internamente consistentes? Seguidores × engajamento faz sentido matemático? Inconsistências são red flag.

7. Design e legibilidade profissional (máx 8 pts)
   É escaneável em menos de 12 segundos? Informação densa ou layout confuso fazem marcas abandonarem.

8. Informação de contato e CTA claros (máx 5 pts)
   Tem email profissional? CTA claro? Kits sem isso perdem parcerias por fricção.

Baseado no nicho aparente do kit, estime uma faixa de preço de mercado razoável para posts patrocinados no Instagram.

IMPORTANTE: Retorne SOMENTE o JSON a seguir — sem markdown, sem texto antes ou depois, sem explicações:

{
  "scoreTotal": <soma exata de todos os scoreObtido>,
  "criterios": [
    {
      "nome": "Taxa de engajamento",
      "scoreObtido": <0-20>,
      "scoreMaximo": 20,
      "status": "<critico se ratio < 0.4 | atencao se ratio < 0.7 | ok se >= 0.7>",
      "problema": "<descrição específica do que está errado ou ausente neste critério, em português>",
      "sugestao": "<ação prática e específica para corrigir, em português>"
    },
    {
      "nome": "Dados demográficos da audiência",
      "scoreObtido": <0-18>,
      "scoreMaximo": 18,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Prova de resultado de campanhas",
      "scoreObtido": <0-15>,
      "scoreMaximo": 15,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Posicionamento e nicho",
      "scoreObtido": <0-12>,
      "scoreMaximo": 12,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Formatos e entregáveis",
      "scoreObtido": <0-12>,
      "scoreMaximo": 12,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Consistência dos números",
      "scoreObtido": <0-10>,
      "scoreMaximo": 10,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Design e legibilidade",
      "scoreObtido": <0-8>,
      "scoreMaximo": 8,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    },
    {
      "nome": "Contato e CTA",
      "scoreObtido": <0-5>,
      "scoreMaximo": 5,
      "status": "<critico|atencao|ok>",
      "problema": "<descrição>",
      "sugestao": "<sugestão>"
    }
  ],
  "resumoGeral": "<2-3 frases diretas sobre o estado geral do kit e o que mais prejudica as chances de parceria>",
  "problemasCriticos": <contagem de critérios com status 'critico'>,
  "faixaPrecoSugerida": "<faixa de preço por post baseada no perfil aparente, ex: 'R$ 800 – R$ 2.000 por post'>",
  "proximosPasso": [
    "<ação prioritária mais impactante para melhorar o kit>",
    "<segunda ação mais importante>",
    "<terceira ação recomendada>"
  ]
}`

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Body inválido' }),
    }
  }

  const { images, mediaType, pageCount, userData } = body

  if (!images || images.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Imagem é obrigatória' }),
    }
  }

  // Check upload limit
  if (userData?.email) {
    const user = await getUploads(userData.email.toLowerCase())
    if (user && user.uploads >= 2) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'limite_atingido',
          message: 'Você já utilizou suas 2 análises gratuitas.',
        }),
      }
    }
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Build content array with all pages + prompt
  const imageContents = images.map((img) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType || 'image/jpeg',
      data: img,
    },
  }))

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: PROMPT(userData, pageCount || images.length),
            },
          ],
        },
      ],
    })

    const raw = response.content[0].text.trim()
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const analysis = JSON.parse(cleaned)

    // Increment upload counter
    if (userData?.email) {
      await incrementUpload(userData.email.toLowerCase())
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysis),
    }
  } catch (err) {
    console.error('Analyze error:', err)

    if (err instanceof SyntaxError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro ao processar resposta da IA. Tente novamente.' }),
      }
    }

    if (err.status === 429) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' }),
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao analisar o mídia kit. Tente novamente.' }),
    }
  }
}
