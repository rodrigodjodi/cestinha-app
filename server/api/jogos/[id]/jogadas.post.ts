import { Timestamp } from 'firebase-admin/firestore'
import {
  criarJogadaInputSchema,
  type CriarJogadaResponse,
} from '@/schemas/jogada.schema'
import { requireUser } from '#server/utils/require-user'
import { adminDb } from '#server/utils/firebase-admin'

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

  const jogoSnapshot = await adminDb.doc(`jogos/${jogoId}`).get()
  if (!jogoSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'jogo-nao-encontrado',
      message: 'O jogo informado não foi encontrado.',
    })
  }

  const jogo = jogoSnapshot.data()!
  const jogadorDoUsuarioSnapshot = await adminDb.collection('jogadores')
    .where('grupoId', '==', jogo.grupoId)
    .where('usuarioId', '==', user.uid)
    .limit(1)
    .get()

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

  const input = validacaoInput.data
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

  const jogadaRef = adminDb.collection('jogadas').doc()
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

  await jogadaRef.set(jogada)

  const resposta: CriarJogadaResponse = {
    jogadaId: jogadaRef.id,
    criada: true,
  }

  return resposta
})
