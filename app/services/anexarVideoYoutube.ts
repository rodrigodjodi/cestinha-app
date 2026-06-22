import { apiFetch } from '@/services/apiFetch'

export type AnexarVideoYoutubeParams = {
  jogoId: string
  grupoId: string
  youtubeId: string
}

export type VideoYoutubeAnexado = {
  youtubeId: string
  thumbPath: string
  thumbUrl: string
}

export function anexarVideoYoutube(params: AnexarVideoYoutubeParams) {
  return apiFetch<VideoYoutubeAnexado>('/api/jogos/anexar-video', {
    method: 'POST',
    body: params,
  })
}
