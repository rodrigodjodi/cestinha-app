import type {
  CriarGrupoResponse,
  FormCriacaoGrupo,
} from '@/schemas/grupo.schema'
import { apiFetch } from '@/services/apiFetch'

export function criarGrupo(payload: FormCriacaoGrupo) {
  return apiFetch<CriarGrupoResponse>('/api/grupos/criar', {
    method: 'POST',
    body: payload,
  })
}
