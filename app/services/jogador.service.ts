import type {
  AlterarAtribuicaoJogadorResponse,
  AtribuicaoJogador,
  CriacaoJogador,
  CriarJogadorResponse,
} from '@/schemas/jogador.schema'
import { apiFetch } from '@/services/apiFetch'

export function criarJogador(payload: CriacaoJogador) {
  return apiFetch<CriarJogadorResponse>('/api/jogadores/criar', {
    method: 'POST',
    body: payload,
  })
}

export function alterarAtribuicaoJogador(
  jogadorId: string,
  atribuicao: AtribuicaoJogador
) {
  return apiFetch<AlterarAtribuicaoJogadorResponse>(
    `/api/jogadores/${jogadorId}/alterar-atribuicao`,
    {
      method: 'PATCH',
      body: { atribuicao },
    }
  )
}
