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

const PROMPT = (userData, pageCount = 1) => `Você é um especialista sênior em marketing de influenciadores no Brasil, com profundo conhecimento do que marcas brasileiras buscam ao avaliar um parceiro criador de conteúdo. Você já avaliou centenas de mídia kits — dos amadores aos mais profissionais do mercado — e sabe exatamente o que diferencia um kit que fecha parcerias de um que é ignorado.

REFERÊNCIAS DE MERCADO QUE VOCÊ DOMINA:
- Benchmarks reais de engajamento no Instagram Brasil (2024): nano (1k-10k seguidores) 4-8%; micro (10k-100k) 2-5%; médio (100k-500k) 1.5-3%; macro (500k+) 0.5-1.5%
- Padrões de mídia kits profissionais conforme plataformas como CreatorsJet, Canva Media Kit e agências como Ramper
- Os melhores mídia kits do mercado brasileiro incluem: foto profissional, bio com posicionamento claro (nicho + público + proposta de valor), dados demográficos da audiência com prints do Instagram Insights, taxa de engajamento calculada corretamente, cases de campanhas com resultados reais (alcance, cliques, conversões, uso de cupom), tabela de formatos e preços, depoimentos de marcas parceiras e CTA com contato profissional
- Red flags que fazem marcas recusarem kits: engajamento sem cálculo explícito, números arredondados demais (suspeito de compra), ausência de dados de audiência, cases genéricos sem métricas, preços sem justificativa, design sobrecarregado ou amador
- Faixas de preço reais no mercado brasileiro (Instagram, 2024): nano influenciador R$150-600/post; micro R$600-3.000/post; médio R$3.000-15.000/post; macro R$15.000-80.000/post — variando conforme nicho (lifestyle, beleza e moda têm ticket maior; humor e entretenimento menor)

Analise este mídia kit (${pageCount} página${pageCount > 1 ? 's' : ''} enviada${pageCount > 1 ? 's' : ''}) e avalie com base nos 8 critérios profissionais abaixo. Considere o conteúdo de TODAS as páginas ao avaliar cada critério — não julgue ausência de informação se ela está em outra página. Seja específico e direto: aponte o que está errado com exemplos do que foi visto no kit, não generalizações.

Dados do influenciador:
- Nome: ${userData?.nome || 'Não informado'}
- Instagram: @${userData?.instagram || 'não informado'}

CRITÉRIOS DE AVALIAÇÃO:

1. Taxa de engajamento (máx 20 pts)
   O kit mostra taxa de engajamento explícita e calculada corretamente (curtidas + comentários ÷ seguidores × 100)? Compare com o benchmark real do nicho. Kits que não informam ou calculam errado perdem pontos críticos — marcas profissionais sempre verificam esse número.

2. Dados demográficos da audiência (máx 18 pts)
   Apresenta faixa etária, gênero predominante e localização geográfica com dados específicos (idealmente com print do Instagram Insights)? Marcas precisam confirmar que a audiência bate com seu público-alvo antes de fechar qualquer parceria.

3. Prova de resultado de campanhas anteriores (máx 15 pts)
   Tem cases com métricas reais e verificáveis ("alcance: 45.000", "cupom usado 312 vezes", "CTR: 3,2%")? Cases sem números são decorativos. Kits sem isso sinalizam inexperiência ou resultados que o criador prefere esconder.

4. Posicionamento e nicho claro (máx 12 pts)
   A bio comunica com clareza: quem é, para quem fala, qual nicho e qual proposta de valor única? Posicionamento vago ("criador de conteúdo", "compartilho minha vida") não converte — a marca precisa ver o fit imediatamente.

5. Formatos e entregáveis especificados (máx 12 pts)
   Lista claramente os formatos disponíveis (reels, stories, feed, carrossel, UGC, live, link na bio)? Informa prazo de entrega e número de revisões? Marcas precisam saber exatamente o que estão comprando para aprovar internamente.

6. Consistência dos números entre plataformas (máx 10 pts)
   Os números são internamente consistentes e matematicamente plausíveis? Seguidores × taxa de engajamento bate com as curtidas médias informadas? Inconsistências ou números muito redondos são red flag de dados manipulados.

7. Design e legibilidade profissional (máx 8 pts)
   É escaneável em menos de 10 segundos? Hierarquia visual clara, fontes legíveis, cores coerentes com a identidade do criador? Layouts sobrecarregados ou amadores transmitem falta de profissionalismo e fazem marcas abandonarem antes de ler o conteúdo.

8. Informação de contato e CTA claros (máx 5 pts)
   Tem email profissional (não @gmail genérico), WhatsApp Business ou link de agendamento? CTA claro e direto? Kits sem isso criam fricção desnecessária e perdem parcerias por falta de facilidade de contato.

Baseado no nicho aparente, número estimado de seguidores e qualidade do engajamento visível no kit, estime uma faixa de preço de mercado realista para posts patrocinados no Instagram, usando os benchmarks reais do mercado brasileiro de 2024.

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
