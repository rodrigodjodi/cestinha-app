import { z } from 'zod'
import { requireUser } from '#server/utils/require-user'
import { adminDb } from '#server/utils/firebase-admin'

const renomearJogoSchema = z.object({
  grupoId: z.string().min(1),
  nome: z.string().min(1),
})

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const jogoId = getRouterParam(event, 'id')
  const validacao = renomearJogoSchema.safeParse(await readBody(event))

  if (!jogoId || !validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
    })
  }

  const { grupoId, nome } = validacao.data
  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  const jogoSnapshot = await jogoRef.get()

  if (!jogoSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'jogo-nao-encontrado',
    })
  }

  const jogo = jogoSnapshot.data()!
  if (jogo.grupoId !== grupoId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'grupo-do-jogo-divergente',
    })
  }

  const jogadorSolicitanteSnapshot = await adminDb.collection('jogadores')
    .where('grupoId', '==', grupoId)
    .where('usuarioId', '==', user.uid)
    .limit(1)
    .get()
  const ehAdministrador = jogadorSolicitanteSnapshot.docs[0]?.data()
    .atribuicao === 'admin'

  if (jogo.anotadorId !== user.uid && !ehAdministrador) {
    throw createError({
      statusCode: 403,
      statusMessage: 'nao-autorizado',
    })
  }

  await jogoRef.update({ nome })

  return { sucesso: true as const }
})
