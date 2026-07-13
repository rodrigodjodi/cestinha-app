import { apiFetch } from '@/services/apiFetch'

export type ApagarJogoParams = {
  jogoId: string
  grupoId: string
}

export function apagarJogo({ jogoId, grupoId }: ApagarJogoParams) {
  return apiFetch<{ sucesso: true }>(`/api/jogos/${jogoId}`, {
    method: 'DELETE',
    body: { grupoId },
  })
}

export type RenomearJogoParams = {
  jogoId: string
  grupoId: string
  nome: string
}

export function renomearJogo({ jogoId, grupoId, nome }: RenomearJogoParams) {
  return apiFetch<{ sucesso: true }>(`/api/jogos/${jogoId}`, {
    method: 'PATCH',
    body: { grupoId, nome },
  })
}
