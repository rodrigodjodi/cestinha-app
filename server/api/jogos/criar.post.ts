import { Timestamp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '#server/utils/firebase-admin'
import { baseJogoSchema, criarJogoSchema } from '@/schemas/jogo.schema'
import { diaSchema } from '@/schemas/dia.schema'

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'nao-autenticado',
      message: 'Houve um problema de autenticação.',
    })
  }

  const token = authorization.replace('Bearer ', '')
  const decodedToken = await adminAuth.verifyIdToken(token)
  const validacao = criarJogoSchema.safeParse(await readBody(event))

  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados fornecidos não passaram pela validação.',
    })
  }

  const payload = validacao.data
  const jogoId = await adminDb.runTransaction(async (transaction) => {
    const diaRef = adminDb.doc(`dias/${payload.diaId}`)
    const diaSnapshot = await transaction.get(diaRef)

    if (!diaSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'dia-nao-encontrado',
        message: 'O dia especificado não foi encontrado.',
      })
    }

    const validacaoDia = diaSchema.safeParse({
      id: diaSnapshot.id,
      ...diaSnapshot.data(),
    })
    if (!validacaoDia.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'dia-invalido',
        message: 'O Dia não possui uma estrutura válida de Times.',
      })
    }

    const dia = validacaoDia.data
    if (dia.grupoId !== payload.grupoId) {
      throw createError({
        statusCode: 409,
        statusMessage: 'grupo-do-dia-divergente',
        message: 'O grupo informado não corresponde ao grupo do Dia.',
      })
    }

    const presencasQuery = adminDb.collection('presencas')
      .where('diaId', '==', payload.diaId)
      .where('grupoId', '==', payload.grupoId)
    const presencasSnapshot = await transaction.get(presencasQuery)
    const confirmados = new Set(
      presencasSnapshot.docs
        .map(documento => documento.data())
        .filter(presenca => presenca.situacao === '0.confirmado')
        .map(presenca => presenca.jogadorId)
        .filter((jogadorId): jogadorId is string => typeof jogadorId === 'string')
    )

    const timesDia = [
      dia.times.time1.jogadores,
      dia.times.time2.jogadores,
      dia.times.time3.jogadores,
    ]
    const quantidadeTimesPorJogador = new Map<string, number>()

    timesDia.forEach(jogadores => {
      jogadores.forEach(jogadorId => {
        quantidadeTimesPorJogador.set(
          jogadorId,
          (quantidadeTimesPorJogador.get(jogadorId) ?? 0) + 1
        )
      })
    })

    /* const confirmadosSemTimeDefinido = [...confirmados].filter(
      jogadorId => quantidadeTimesPorJogador.get(jogadorId) !== 1
    )
    if (confirmadosSemTimeDefinido.length) {
      throw createError({
        statusCode: 409,
        statusMessage: 'jogadores-sem-time',
        message: 'Há jogadores confirmados sem Time definido no Dia.',
      })
    } */

    const banco = timesDia
      .flat()
      .filter(jogadorId => confirmados.has(jogadorId))
    const jogoFinal = baseJogoSchema.parse({
      grupoId: payload.grupoId,
      diaId: payload.diaId,
      anotadorId: payload.anotadorId,
      equipes: {
        esquerda: {
          nome: 'Equipe esquerda',
          jogadores: [],
        },
        direita: {
          nome: 'Equipe direita',
          jogadores: [],
        },
      },
      banco,
      placar: {
        esquerda: 0,
        direita: 0,
      },
      timer: {
        status: 'ocioso',
        iniciadoEm: null,
        pausadoEm: null,
        finalizadoEm: null,
        tempoPausadoTotalMs: 0,
        duracao: 615,
      },
    })

    const numJogos = dia.numJogos
    const data = dia.data.split('-').reverse().join('/')
    const nome = `${data} - Jogo ${numJogos + 1}`
    const jogoRef = adminDb.collection('jogos').doc()

    transaction.set(jogoRef, {
      ...jogoFinal,
      criadoEm: Timestamp.now(),
      criadoPor: decodedToken.uid,
      nome,
    })
    transaction.update(diaRef, {
      numJogos: numJogos + 1,
    })

    return jogoRef.id
  })

  return { jogoId }
})
