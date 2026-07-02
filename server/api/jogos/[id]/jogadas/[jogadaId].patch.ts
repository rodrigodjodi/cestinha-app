import { ajustarTempoJogadaInputSchema } from '@/schemas/jogada.schema'
import { requireUser } from '#server/utils/require-user'
import { adminDb } from '#server/utils/firebase-admin'

function limitarTempoMs(tempoMs: number, duracaoSegundos: unknown) {
  const duracaoMs = typeof duracaoSegundos === 'number'
    ? Math.max(0, Math.round(duracaoSegundos * 1000))
    : Number.POSITIVE_INFINITY

  return Math.min(duracaoMs, Math.max(0, tempoMs))
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

  const validacaoInput = ajustarTempoJogadaInputSchema.safeParse(
    await readBody(event)
  )
  if (!validacaoInput.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados do ajuste nao passaram pela validacao.',
      data: validacaoInput.error.flatten(),
    })
  }

  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  const jogadaRef = adminDb.doc(`jogadas/${jogadaId}`)
  let tempoMs = validacaoInput.data.tempoMs

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
        message: 'Somente o anotador atribuido pode ajustar jogadas.',
      })
    }

    tempoMs = limitarTempoMs(tempoMs, jogo.timer?.duracao)
    transaction.update(jogadaRef, { tempoMs })
  })

  return {
    sucesso: true as const,
    jogadaId,
    tempoMs,
  }
})
