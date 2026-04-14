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

const PROMPT = (userData, pageCount = 1) => `Você é um estrategista sênior de marketing de influência no Brasil — pensa como as melhores agências do setor (Squid, Youpix, Bornlogic, Moove) e como os gerentes de marketing de grandes marcas que recebem centenas de mídia kits por mês. Você avalia kits com o olhar de quem decide se vai fechar ou não uma parceria, e sabe equilibrar crítica com reconhecimento do que já está bom.

SEU PRINCÍPIO: Diagnóstico honesto, baseado apenas no que está visível no kit. Nunca invente dados, nunca suponha números que não aparecem. Aponte tanto os pontos fortes quanto os pontos de melhoria — um bom diagnóstico é equilibrado.

PADRÕES DO MERCADO QUE VOCÊ CONHECE:
- Benchmarks de engajamento Instagram Brasil (2024): nano 1k-10k → 4-8%; micro 10k-100k → 2-5%; médio 100k-500k → 1,5-3%; macro 500k+ → 0,5-1,5%
- Mídia kits de referência do mercado incluem: posicionamento único claro, dados demográficos com prints do Insights, taxa de engajamento calculada explicitamente, cases com métricas verificáveis, tabela de formatos clara, identidade visual consistente e contato profissional
- Red flags reais: números sem fonte, engajamento não calculado, cases sem métricas, ausência de dados de audiência, design confuso, contato genérico

Analise este mídia kit (${pageCount} página${pageCount > 1 ? 's' : ''}) com atenção a TODAS as páginas antes de avaliar cada critério. Seja cirúrgico: cite o que você viu no kit para embasar cada avaliação.

Dados do influenciador:
- Nome: ${userData?.nome || 'Não informado'}
- Instagram: @${userData?.instagram || 'não informado'}

CRITÉRIOS DE AVALIAÇÃO:

1. Taxa de engajamento (máx 20 pts)
   O kit informa a taxa de engajamento de forma explícita e com cálculo correto (curtidas + comentários ÷ seguidores × 100)? Está compatível com o benchmark do porte e nicho aparente? Kits que omitem esse dado são eliminados automaticamente por marcas profissionais.

2. Dados demográficos da audiência (máx 18 pts)
   Apresenta faixa etária, gênero predominante e localização com dados específicos — preferencialmente com print do Instagram Insights? A marca precisa confirmar que a audiência é o seu público antes de qualquer negociação.

3. Prova de resultado de campanhas anteriores (máx 15 pts)
   Há cases com métricas reais e verificáveis (alcance, cliques, cupons usados, conversões)? Cases sem números não provam nada. Ausência total desse bloco é o segundo maior eliminador de kits no mercado.

4. Posicionamento e nicho claro (máx 12 pts)
   A bio define com clareza: quem é, para quem fala, qual nicho e qual diferencial único? Uma marca precisa enxergar o fit com seu produto em menos de 10 segundos de leitura.

5. Formatos e entregáveis especificados (máx 12 pts)
   Lista os formatos disponíveis (reels, stories, feed, carrossel, UGC, live, link na bio)? Informa prazos e número de revisões? Marcas precisam disso para aprovação interna e briefing da agência.

6. Consistência dos números (máx 10 pts)
   Os dados são matematicamente coerentes entre si? Seguidores declarados × engajamento declarado batem com as curtidas médias aparentes? Inconsistências são red flag imediata de dados manipulados.

7. Design e legibilidade (máx 8 pts)
   O kit é escaneável em menos de 10 segundos? Hierarquia visual clara, tipografia legível, identidade coerente? Design confuso faz marcas abandonarem antes de ler o conteúdo.

8. Contato e CTA (máx 5 pts)
   Tem email profissional, WhatsApp Business ou link de agendamento? CTA direto e visível? Fricção no contato custa parcerias.

IMPORTANTE: Retorne SOMENTE o JSON abaixo — sem markdown, sem texto antes ou depois:

{
  "scoreTotal": <soma exata de todos os scoreObtido>,
  "criterios": [
    {
      "nome": "Taxa de engajamento",
      "scoreObtido": <0-20>,
      "scoreMaximo": 20,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<o que está bom neste critério, baseado no que foi visto — null se nada positivo>",
      "problema": "<o que está errado ou ausente, citando o que foi visto no kit — null se status ok>",
      "sugestao": "<ação prática e específica para corrigir — null se status ok>"
    },
    {
      "nome": "Dados demográficos da audiência",
      "scoreObtido": <0-18>,
      "scoreMaximo": 18,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Prova de resultado de campanhas",
      "scoreObtido": <0-15>,
      "scoreMaximo": 15,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Posicionamento e nicho",
      "scoreObtido": <0-12>,
      "scoreMaximo": 12,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Formatos e entregáveis",
      "scoreObtido": <0-12>,
      "scoreMaximo": 12,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Consistência dos números",
      "scoreObtido": <0-10>,
      "scoreMaximo": 10,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Design e legibilidade",
      "scoreObtido": <0-8>,
      "scoreMaximo": 8,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    },
    {
      "nome": "Contato e CTA",
      "scoreObtido": <0-5>,
      "scoreMaximo": 5,
      "status": "<critico|atencao|ok>",
      "pontosPositivos": "<pontos positivos ou null>",
      "problema": "<problema ou null>",
      "sugestao": "<sugestão ou null>"
    }
  ],
  "resumoGeral": "<2-3 frases equilibradas: reconheça o que o kit tem de bom e aponte o que mais impacta negativamente as chances de parceria>",
  "problemasCriticos": <contagem de critérios com status critico>,
  "proximosPasso": [
    "<ação prioritária mais impactante>",
    "<segunda ação>",
    "<terceira ação>"
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
