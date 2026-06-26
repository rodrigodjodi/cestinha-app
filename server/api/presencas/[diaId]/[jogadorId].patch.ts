import { Timestamp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '#server/utils/firebase-admin'
import { alterarSituacaoPresencaSchema } from '@/schemas/presenca.schema'

export default defineEventHandler(async event => {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'nao-autenticado',
    })
  }

  const diaId = getRouterParam(event, 'diaId')
  const jogadorId = getRouterParam(event, 'jogadorId')
  if (!diaId || !jogadorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'parametros-invalidos',
    })
  }

  const validacao = alterarSituacaoPresencaSchema.safeParse(
    await readBody(event)
  )
  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
    })
  }

  const decodedToken = await adminAuth.verifyIdToken(
    authorization.replace('Bearer ', '')
  )
  const { grupoId, situacao } = validacao.data

  await adminDb.runTransaction(async transaction => {
    const diaRef = adminDb.doc(`dias/${diaId}`)
    const jogadorRef = adminDb.doc(`jogadores/${jogadorId}`)
    const presencaRef = adminDb.doc(`presencas/${diaId}_${jogadorId}`)
    const jogosDiaQuery = adminDb.collection('jogos')
      .where('grupoId', '==', grupoId)
      .where('diaId', '==', diaId)
      .limit(1)
    const adminQuery = adminDb.collection('jogadores')
      .where('grupoId', '==', grupoId)
      .where('usuarioId', '==', decodedToken.uid)
      .limit(1)

    const diaSnapshot = await transaction.get(diaRef)
    const jogadorSnapshot = await transaction.get(jogadorRef)
    const presencaSnapshot = await transaction.get(presencaRef)
    const jogosDiaSnapshot = await transaction.get(jogosDiaQuery)
    const adminSnapshot = await transaction.get(adminQuery)

    if (!diaSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'dia-nao-encontrado',
      })
    }
    if (!jogadorSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogador-nao-encontrado',
      })
    }
    if (!presencaSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'presenca-nao-encontrada',
      })
    }

    const dia = diaSnapshot.data()!
    const jogador = jogadorSnapshot.data()!
    const presenca = presencaSnapshot.data()!
    const admin = adminSnapshot.docs[0]?.data()

    if (
      dia.grupoId !== grupoId
      || jogador.grupoId !== grupoId
      || presenca.grupoId !== grupoId
      || presenca.diaId !== diaId
      || presenca.jogadorId !== jogadorId
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'dados-divergentes',
      })
    }
    if (admin?.atribuicao !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-autorizado',
        message: 'Somente admin pode alterar a situação de outro jogador.',
      })
    }
    if (!jogosDiaSnapshot.empty) {
      throw createError({
        statusCode: 409,
        statusMessage: 'dia-com-jogos',
      })
    }

    transaction.update(presencaRef, {
      situacao,
      situacaoEm: Timestamp.now(),
    })

    if (situacao === '1.espera') {
      transaction.update(diaRef, {
        times: {
          time1: {
            ...dia.times.time1,
            jogadores: dia.times.time1.jogadores.filter(
              (id: string) => id !== jogadorId
            ),
          },
          time2: {
            ...dia.times.time2,
            jogadores: dia.times.time2.jogadores.filter(
              (id: string) => id !== jogadorId
            ),
          },
          time3: {
            ...dia.times.time3,
            jogadores: dia.times.time3.jogadores.filter(
              (id: string) => id !== jogadorId
            ),
          },
        },
      })
    }
  })

  return { sucesso: true }
})
