import { Timestamp } from 'firebase-admin/firestore'
import {
  criarJogadaInputSchema,
  type CriarJogadaResponse,
} from '@/schemas/jogada.schema'
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

  if (!jogoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'jogo-id-invalido',
      message: 'O id do jogo é obrigatório.',
    })
  }

  const validacaoInput = criarJogadaInputSchema.safeParse(
    await readBody(event)
  )
  if (!validacaoInput.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados da jogada não passaram pela validação.',
      data: validacaoInput.error.flatten(),
    })
  }

  const input = validacaoInput.data
  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  const jogadaRef = adminDb.collection('jogadas').doc()

  await adminDb.runTransaction(async transaction => {
    const jogoSnapshot = await transaction.get(jogoRef)

    if (!jogoSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogo-nao-encontrado',
        message: 'O jogo informado não foi encontrado.',
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
        message: 'O usuário não pertence ao grupo deste jogo.',
      })
    }

    if (!jogo.anotadorId || jogo.anotadorId !== user.uid) {
      throw createError({
        statusCode: 403,
        statusMessage: 'usuario-nao-e-anotador',
        message: 'Somente o anotador atribuído pode criar jogadas.',
      })
    }

    const jogadoresDaEquipe = jogo.equipes?.[input.equipe]?.jogadores

    if (
      !Array.isArray(jogadoresDaEquipe)
      || !jogadoresDaEquipe.includes(input.jogadorId)
    ) {
      throw createError({
        statusCode: 422,
        statusMessage: 'jogador-fora-da-equipe',
        message: 'O jogador não pertence à equipe informada.',
      })
    }

    if (
      input.assistenciaId
      && !jogadoresDaEquipe.includes(input.assistenciaId)
    ) {
      throw createError({
        statusCode: 422,
        statusMessage: 'assistente-fora-da-equipe',
        message: 'A assistência deve ser de outro jogador da mesma equipe.',
      })
    }

    const jogada = {
      id: jogadaRef.id,
      jogoId,
      diaId: jogo.diaId,
      jogadorId: input.jogadorId,
      tipo: input.tipo,
      tempoMs: input.tempoMs,
      equipe: input.equipe,
      ...(input.assistenciaId
        ? { assistenciaId: input.assistenciaId }
        : {}),
      anotadoPor: user.uid,
      anotadoEm: Timestamp.now(),
    }

    transaction.set(jogadaRef, jogada)

    const pontos = pontosPorTipo[input.tipo] ?? 0
    if (pontos > 0) {
      const placarAtualEquipe = jogo.placar?.[input.equipe]
      const placarAtual = typeof placarAtualEquipe === 'number'
        ? placarAtualEquipe
        : 0

      transaction.update(jogoRef, {
        [`placar.${input.equipe}`]: placarAtual + pontos,
      })
    }
  })

  const resposta: CriarJogadaResponse = {
    jogadaId: jogadaRef.id,
    criada: true,
  }

  return resposta
})
