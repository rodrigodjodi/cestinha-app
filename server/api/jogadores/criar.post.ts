import { Timestamp } from 'firebase-admin/firestore'
import {
  baseJogadorSchema,
  criarJogadorInputSchema,
  jogadorSchema,
  type CriarJogadorResponse,
} from '@/schemas/jogador.schema'
import { adminDb } from '#server/utils/firebase-admin'
import { requireUser } from '#server/utils/require-user'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const validacao = criarJogadorInputSchema.safeParse(await readBody(event))

  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados fornecidos não passaram pela validação.',
      data: validacao.error.flatten(),
    })
  }

  const input = validacao.data
  return adminDb.runTransaction(async transaction => {
    const criadorSnapshot = await transaction.get(
      adminDb
        .collection('jogadores')
        .where('grupoId', '==', input.grupoId)
        .where('usuarioId', '==', user.uid)
        .limit(1)
    )
    if (criadorSnapshot.empty) {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-membro',
        message: 'É necessário ser membro do grupo para adicionar jogadores.',
      })
    }

    const criadorDocumento = criadorSnapshot.docs[0]!
    const validacaoCriador = jogadorSchema.safeParse({
      id: criadorDocumento.id,
      ...criadorDocumento.data(),
    })
    if (!validacaoCriador.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'jogador-criador-invalido',
        message: 'O jogador associado ao usuário possui dados inválidos.',
      })
    }

    const criador = validacaoCriador.data
    if (criador.atribuicao === 'avulso') {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-autorizado',
        message: 'Avulsos não podem criar jogadores.',
      })
    }
    const payload = baseJogadorSchema.parse({
      ...input,
      usuarioId: null,
    })
    const duplicadoSnapshot = await transaction.get(
      adminDb
        .collection('jogadores')
        .where('grupoId', '==', payload.grupoId)
        .where('nomeNormalizado', '==', payload.nomeNormalizado)
        .limit(1)
    )
    if (!duplicadoSnapshot.empty) {
      throw createError({
        statusCode: 409,
        statusMessage: 'jogador-ja-existe',
        message: 'Já existe um jogador com esse nome no grupo.',
      })
    }

    const jogadorRef = adminDb.collection('jogadores').doc()
    transaction.set(jogadorRef, {
      ...payload,
      criadoEm: Timestamp.now(),
    })

    const response: CriarJogadorResponse = {
      jogadorId: jogadorRef.id,
    }
    return response
  })
})
