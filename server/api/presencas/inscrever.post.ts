import { Timestamp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '#server/utils/firebase-admin'
import { basePresencaSchema } from '@/schemas/presenca.schema'

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'nao-autenticado',
      message: 'Houve um problema de autenticação.',
    })
  }

  const decodedToken = await adminAuth.verifyIdToken(
    authorization.replace('Bearer ', '')
  )
  const validacao = basePresencaSchema.safeParse(await readBody(event))

  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados fornecidos não passaram pela validação.',
    })
  }

  const payload = validacao.data
  const jogadorRef = adminDb.doc(`jogadores/${payload.jogadorId}`)
  const presencaRef = adminDb.doc(
    `presencas/${payload.diaId}_${payload.jogadorId}`
  )

  await adminDb.runTransaction(async transaction => {
    const jogadorSnapshot = await transaction.get(jogadorRef)
    if (!jogadorSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogador-nao-encontrado',
        message: 'O jogador informado não foi encontrado.',
      })
    }

    const jogador = jogadorSnapshot.data()!
    if (jogador.grupoId !== payload.grupoId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-membro',
        message: 'O jogador não é membro do grupo.',
      })
    }

    let criadoPor = payload.jogadorId
    if (jogador.usuarioId !== decodedToken.uid) {
      const criadorQuery = adminDb.collection('jogadores')
        .where('grupoId', '==', payload.grupoId)
        .where('usuarioId', '==', decodedToken.uid)
        .limit(1)
      const criadorSnapshot = await transaction.get(criadorQuery)

      if (criadorSnapshot.empty) {
        throw createError({
          statusCode: 403,
          statusMessage: 'nao-membro',
          message: 'O usuário não é membro do grupo.',
        })
      }

      const criadorDocumento = criadorSnapshot.docs[0]!
      if (criadorDocumento.data().atribuicao !== 'admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'nao-autorizado',
          message: 'Somente admin pode confirmar presença de outros jogadores.',
        })
      }
      criadoPor = criadorDocumento.id
    }

    const situacao = jogador.atribuicao === 'avulso'
      ? '1.espera'
      : '0.confirmado'
    const agora = Timestamp.now()
    const presencaSnapshot = await transaction.get(presencaRef)

    if (!presencaSnapshot.exists) {
      transaction.set(presencaRef, {
        ...payload,
        situacao,
        criadoPor,
        criadoEm: agora,
        situacaoEm: agora,
      })
      return
    }

    const presencaAtual = presencaSnapshot.data()!
    const atualizacao: Record<string, unknown> = {
      ...payload,
      criadoPor,
      situacao,
    }
    if (
      presencaAtual.situacao !== situacao
      || !presencaAtual.situacaoEm
    ) {
      atualizacao.situacaoEm = agora
    }
    transaction.set(presencaRef, atualizacao, { merge: true })
  })

  return { presencaId: presencaRef.id }
})
