import { z } from 'zod'
import { requireUser } from '#server/utils/require-user'
import { adminDb, adminStorage } from '#server/utils/firebase-admin'

const apagarJogoSchema = z.object({
  grupoId: z.string().min(1),
})

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const jogoId = getRouterParam(event, 'id')
  const validacao = apagarJogoSchema.safeParse(await readBody(event))

  if (!jogoId || !validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
    })
  }

  const { grupoId } = validacao.data
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

  if (typeof jogo.video?.thumbPath === 'string') {
    await adminStorage.bucket().file(jogo.video.thumbPath).delete({
      ignoreNotFound: true,
    })
  }

  const jogadasSnapshot = await adminDb.collection('jogadas')
    .where('jogoId', '==', jogoId)
    .get()
  const referencias = jogadasSnapshot.docs.map(documento => documento.ref)

  for (let inicio = 0; inicio < referencias.length; inicio += 500) {
    const batch = adminDb.batch()
    referencias.slice(inicio, inicio + 500).forEach(referencia => {
      batch.delete(referencia)
    })
    await batch.commit()
  }

  await jogoRef.delete()

  return { sucesso: true as const }
})
