import { apiFetch } from '~/services/apiFetch'
import type { CriarJogo } from '@/schemas/jogo.schema'

export default async function useNovoJogo(
  diaId: MaybeRefOrGetter<string | undefined>,
  grupoId: MaybeRefOrGetter<string | undefined>,
  anotadorId: string | null
) {
  const diaIdValue = toValue(diaId)
  const grupoIdValue = toValue(grupoId)

  if (!grupoIdValue || !diaIdValue) {
    throw new Error('Dia e grupo são obrigatórios para criar um jogo')
  }

  const payload: CriarJogo = {
    diaId: diaIdValue,
    grupoId: grupoIdValue,
    anotadorId,
  }

  return apiFetch<{ jogoId: string }>('/api/jogos/criar', {
    method: 'POST',
    body: payload,
  })
}
