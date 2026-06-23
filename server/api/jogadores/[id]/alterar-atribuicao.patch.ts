import {
  alterarAtribuicaoJogadorInputSchema,
  jogadorSchema,
  type AlterarAtribuicaoJogadorResponse,
} from '@/schemas/jogador.schema'
import { adminDb } from '#server/utils/firebase-admin'
import { requireUser } from '#server/utils/require-user'

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const jogadorId = getRouterParam(event, 'id')
  const validacao = alterarAtribuicaoJogadorInputSchema.safeParse(await readBody(event))

  if (!jogadorId || !validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados fornecidos nÃ£o passaram pela validaÃ§Ã£o.',
      data: validacao.success ? undefined : validacao.error.flatten(),
    })
  }

  const { atribuicao } = validacao.data

  return adminDb.runTransaction(async transaction => {
    const jogadorRef = adminDb.collection('jogadores').doc(jogadorId)
    const jogadorSnapshot = await transaction.get(jogadorRef)

    if (!jogadorSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'jogador-nao-encontrado',
        message: 'Jogador nÃ£o encontrado.',
      })
    }

    const validacaoJogador = jogadorSchema.safeParse({
      id: jogadorSnapshot.id,
      ...jogadorSnapshot.data(),
    })

    if (!validacaoJogador.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'jogador-invalido',
        message: 'O jogador possui dados invÃ¡lidos.',
      })
    }

    const jogador = validacaoJogador.data
    const solicitanteSnapshot = await transaction.get(
      adminDb
        .collection('jogadores')
        .where('grupoId', '==', jogador.grupoId)
        .where('usuarioId', '==', user.uid)
        .limit(1)
    )

    if (solicitanteSnapshot.empty) {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-membro',
        message: 'Ã‰ necessÃ¡rio ser membro do grupo para alterar jogadores.',
      })
    }

    const solicitanteDocumento = solicitanteSnapshot.docs[0]!
    const validacaoSolicitante = jogadorSchema.safeParse({
      id: solicitanteDocumento.id,
      ...solicitanteDocumento.data(),
    })

    if (!validacaoSolicitante.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'jogador-solicitante-invalido',
        message: 'O jogador associado ao usuÃ¡rio possui dados invÃ¡lidos.',
      })
    }

    if (validacaoSolicitante.data.atribuicao !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-autorizado',
        message: 'Somente administradores podem alterar atribuiÃ§Ãµes.',
      })
    }

    transaction.update(jogadorRef, { atribuicao })

    const response: AlterarAtribuicaoJogadorResponse = {
      jogadorId,
      atribuicao,
    }
    return response
  })
})
