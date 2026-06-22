import { randomUUID } from 'node:crypto'
import { getDownloadURL } from 'firebase-admin/storage'
import { requireUser } from '#server/utils/require-user'
import { adminDb, adminStorage } from '#server/utils/firebase-admin'
import { anexarVideoYoutubeSchema } from '@/schemas/youtube.schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const validacao = anexarVideoYoutubeSchema.safeParse(await readBody(event))

  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados do vídeo são inválidos.',
    })
  }

  const { jogoId, grupoId, youtubeId } = validacao.data
  const jogoRef = adminDb.doc(`jogos/${jogoId}`)
  const jogoSnapshot = await jogoRef.get()

  if (!jogoSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'jogo-nao-encontrado',
      message: 'O jogo informado não foi encontrado.',
    })
  }

  const jogo = jogoSnapshot.data()
  if (jogo?.grupoId !== grupoId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'grupo-do-jogo-divergente',
      message: 'O grupo informado não corresponde ao grupo do jogo.',
    })
  }
  if (jogo?.anotadorId !== user.uid) {
    throw createError({
      statusCode: 403,
      statusMessage: 'sem-permissao',
      message: 'Somente o anotador pode anexar o vídeo.',
    })
  }

  const thumbnailResponse = await fetch(
    `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
  )
  if (!thumbnailResponse.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'thumbnail-indisponivel',
      message: 'Não foi possível obter a thumbnail do YouTube.',
    })
  }

  const thumbPath = `grupos/${grupoId}/jogos/${jogoId}/thumb.jpg`
  const thumbFile = adminStorage.bucket().file(thumbPath)
  const downloadToken = randomUUID()
  await thumbFile.save(Buffer.from(await thumbnailResponse.arrayBuffer()), {
    resumable: false,
    metadata: {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })
  const thumbUrl = await getDownloadURL(thumbFile)

  await jogoRef.update({
    'video.youtubeId': youtubeId,
    'video.thumbPath': thumbPath,
    'video.thumbUrl': thumbUrl,
  })

  return {
    youtubeId,
    thumbPath,
    thumbUrl,
  }
})
