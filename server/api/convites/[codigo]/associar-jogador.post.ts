import { FieldValue } from 'firebase-admin/firestore'
import {
  associarJogadorConviteInputSchema,
  baseConviteSchema,
  type AssociarJogadorConviteResponse,
} from '@/schemas/convite.schema'
import { grupoSchema } from '@/schemas/grupo.schema'
import { jogadorSchema } from '@/schemas/jogador.schema'
import { adminDb } from '#server/utils/firebase-admin'
import { requireUser } from '#server/utils/require-user'

export default defineEventHandler(
  async (event): Promise<AssociarJogadorConviteResponse> => {
    const user = await requireUser(event)
    const codigo = getRouterParam(event, 'codigo')

    if (!codigo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'convite-nao-encontrado',
        message: 'O convite informado não foi encontrado.',
      })
    }

    const validacaoInput = associarJogadorConviteInputSchema.safeParse(
      await readBody(event)
    )
    if (!validacaoInput.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'dados-invalidos',
        message: 'Informe somente um jogadorId válido.',
        data: validacaoInput.error.flatten(),
      })
    }

    const { jogadorId } = validacaoInput.data

    return adminDb.runTransaction(async transaction => {
      const conviteRef = adminDb.collection('convites').doc(codigo)
      const conviteSnapshot = await transaction.get(conviteRef)

      if (!conviteSnapshot.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'convite-nao-encontrado',
          message: 'O convite informado não foi encontrado.',
        })
      }

      const validacaoConvite = baseConviteSchema.safeParse(
        conviteSnapshot.data()
      )
      if (!validacaoConvite.success) {
        throw createError({
          statusCode: 404,
          statusMessage: 'convite-invalido',
          message: 'O convite informado não referencia um grupo válido.',
        })
      }

      const grupoRef = adminDb
        .collection('grupos')
        .doc(validacaoConvite.data.grupoId)
      const jogadorRef = adminDb.collection('jogadores').doc(jogadorId)
      const jogadoresDoUsuarioQuery = adminDb
        .collection('jogadores')
        .where('usuarioId', '==', user.uid)

      const [
        grupoSnapshot,
        jogadorSnapshot,
        jogadoresDoUsuarioSnapshot,
      ] = await Promise.all([
        transaction.get(grupoRef),
        transaction.get(jogadorRef),
        transaction.get(jogadoresDoUsuarioQuery),
      ])

      if (!grupoSnapshot.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'grupo-nao-encontrado',
          message: 'O grupo associado ao convite não foi encontrado.',
        })
      }
      if (!jogadorSnapshot.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'jogador-nao-encontrado',
          message: 'O jogador informado não foi encontrado.',
        })
      }

      const validacaoGrupo = grupoSchema.safeParse({
        id: grupoSnapshot.id,
        ...grupoSnapshot.data(),
      })
      if (!validacaoGrupo.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'grupo-invalido',
          message: 'O grupo associado ao convite possui dados inválidos.',
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
          message: 'O jogador informado possui dados inválidos.',
        })
      }

      const grupo = validacaoGrupo.data
      const jogador = validacaoJogador.data

      if (jogador.grupoId !== grupo.id) {
        throw createError({
          statusCode: 409,
          statusMessage: 'jogador-de-outro-grupo',
          message: 'O jogador informado não pertence ao grupo do convite.',
        })
      }
      if (jogador.usuarioId && jogador.usuarioId !== user.uid) {
        throw createError({
          statusCode: 409,
          statusMessage: 'jogador-indisponivel',
          message: 'Este jogador já está associado a outro usuário.',
        })
      }

      const outroJogadorDoGrupo = jogadoresDoUsuarioSnapshot.docs.find(
        documento => {
          const dados = documento.data()
          return dados.grupoId === grupo.id && documento.id !== jogador.id
        }
      )
      if (outroJogadorDoGrupo) {
        throw createError({
          statusCode: 409,
          statusMessage: 'usuario-ja-possui-jogador',
          message: 'Você já possui outro jogador associado neste grupo.',
        })
      }

      const idempotente = jogador.usuarioId === user.uid
      const precisaAdicionarUsuario = !grupo.usuarios.includes(user.uid)

      if (!idempotente) {
        transaction.update(jogadorRef, {
          usuarioId: user.uid,
        })
      }
      if (precisaAdicionarUsuario) {
        transaction.update(grupoRef, {
          usuarios: FieldValue.arrayUnion(user.uid),
        })
      }

      return {
        jogadorId: jogador.id,
        grupoId: grupo.id,
        associada: true,
        idempotente,
      }
    })
  }
)
