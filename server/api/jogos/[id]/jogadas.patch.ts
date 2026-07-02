import { deslocarJogadasInputSchema } from '@/schemas/jogada.schema'
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

  if (!jogoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'jogo-id-invalido',
      message: 'O id do jogo e obrigatorio.',
    })
  }

  const validacaoInput = deslocarJogadasInputSchema.safeParse(
    await readBody(event)
  )
  if (!validacaoInput.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados do deslocamento nao passaram pela validacao.',
      data: validacaoInput.error.flatten(),
    })
  }

  const { deltaMs } = validacaoInput.data
  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  let total = 0

  await adminDb.runTransaction(async transaction => {
    const jogoSnapshot = await transaction.get(jogoRef)

    if (!jogoSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogo-nao-encontrado',
        message: 'O jogo informado nao foi encontrado.',
      })
    }

    const jogo = jogoSnapshot.data()!
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

    const jogadasSnapshot = await transaction.get(
      adminDb.collection('jogadas').where('jogoId', '==', jogoId)
    )

    total = jogadasSnapshot.size
    for (const documento of jogadasSnapshot.docs) {
      const jogada = documento.data()
      const tempoAtualMs = typeof jogada.tempoMs === 'number'
        ? jogada.tempoMs
        : 0

      transaction.update(documento.ref, {
        tempoMs: limitarTempoMs(tempoAtualMs + deltaMs, jogo.timer?.duracao),
      })
    }
  })

  return {
    sucesso: true as const,
    total,
    deltaMs,
  }
})
