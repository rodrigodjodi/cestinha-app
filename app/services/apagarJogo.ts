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
