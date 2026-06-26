import { requireUser } from '#server/utils/require-user'
import { adminDb } from '#server/utils/firebase-admin'

const pontosPorTipo: Record<string, number> = {
  FTM: 1,
  '2PM': 2,
  '3PM': 3,
}

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const jogoId = getRouterParam(event, 'id')
  const jogadaId = getRouterParam(event, 'jogadaId')

  if (!jogoId || !jogadaId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'O id do jogo e da jogada sao obrigatorios.',
    })
  }

  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  const jogadaRef = adminDb.doc(`jogadas/${jogadaId}`)

  await adminDb.runTransaction(async transaction => {
    const jogoSnapshot = await transaction.get(jogoRef)
    const jogadaSnapshot = await transaction.get(jogadaRef)

    if (!jogoSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogo-nao-encontrado',
        message: 'O jogo informado nao foi encontrado.',
      })
    }

    if (!jogadaSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogada-nao-encontrada',
        message: 'A jogada informada nao foi encontrada.',
      })
    }

    const jogo = jogoSnapshot.data()!
    const jogada = jogadaSnapshot.data()!

    if (jogada.jogoId !== jogoId) {
      throw createError({
        statusCode: 409,
        statusMessage: 'jogada-de-outro-jogo',
        message: 'A jogada informada nao pertence a este jogo.',
      })
    }

    const jogadorDoUsuarioSnapshot = await transaction.get(
      adminDb.collection('jogadores')
        .where('grupoId', '==', jogo.grupoId)
        .where('usuarioId', '==', user.uid)
        .limit(1)
    )

    if (jogadorDoUsuarioSnapshot.empty) {
      throw createError({
        statusCode: 403,
        statusMessage: 'usuario-fora-do-grupo',
        message: 'O usuario nao pertence ao grupo deste jogo.',
      })
    }

    if (!jogo.anotadorId || jogo.anotadorId !== user.uid) {
      throw createError({
        statusCode: 403,
        statusMessage: 'usuario-nao-e-anotador',
        message: 'Somente o anotador atribuido pode excluir jogadas.',
      })
    }

    const pontos = pontosPorTipo[jogada.tipo] ?? 0
    if (pontos > 0 && typeof jogada.equipe === 'string') {
      const placarAtualEquipe = jogo.placar?.[jogada.equipe]
      const placarAtual = typeof placarAtualEquipe === 'number'
        ? placarAtualEquipe
        : 0

      transaction.update(jogoRef, {
        [`placar.${jogada.equipe}`]: Math.max(0, placarAtual - pontos),
      })
    }

    transaction.delete(jogadaRef)
  })

  return {
    sucesso: true as const,
    jogadaId,
  }
})
