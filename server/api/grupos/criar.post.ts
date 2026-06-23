import { Timestamp } from 'firebase-admin/firestore'
import { baseConviteSchema } from '@/schemas/convite.schema'
import {
  criacaoGrupoSchema,
  type CriarGrupoResponse,
} from '@/schemas/grupo.schema'
import { baseJogadorSchema } from '@/schemas/jogador.schema'
import { adminDb } from '#server/utils/firebase-admin'
import { requireUser } from '#server/utils/require-user'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const validacao = criacaoGrupoSchema.safeParse(await readBody(event))

  if (!validacao.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: 'Os dados fornecidos não passaram pela validação.',
      data: validacao.error.flatten(),
    })
  }

  const payloadGrupo = validacao.data
  const now = Timestamp.now()
  const grupoRef = adminDb.collection('grupos').doc()
  const jogadorRef = adminDb.collection('jogadores').doc()
  const conviteRef = adminDb.collection('convites').doc()
  const batch = adminDb.batch()

  batch.set(grupoRef, {
    nome: payloadGrupo.nome,
    usuarios: [user.uid],
    criadoPor: user.uid,
    criadoEm: now,
  })

  const jogador = baseJogadorSchema.parse({
    nome: payloadGrupo.apelido,
    grupoId: grupoRef.id,
    usuarioId: user.uid,
    atribuicao: 'admin',
  })
  batch.set(jogadorRef, {
    ...jogador,
    criadoEm: now,
  })

  const convite = baseConviteSchema.parse({
    grupoId: grupoRef.id,
  })
  batch.set(conviteRef, {
    ...convite,
    criadoEm: now,
  })

  await batch.commit()

  const response: CriarGrupoResponse = {
    grupoId: grupoRef.id,
    jogadorId: jogadorRef.id,
    conviteId: conviteRef.id,
  }

  return response
})
