import { z } from 'zod'

export const youtubeIdSchema = z.string().regex(
  /^[A-Za-z0-9_-]{11}$/,
  'ID do YouTube inválido'
)

function extrairYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})(?:[&#]|$)/,
    /youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return null
}

export const youtubeSchema = z.object({
  videoUrl: z
    .string()
    .trim()
    .min(1, 'Informe uma URL')
    .refine(
      (url) => extrairYoutubeId(url) !== null,
      'Não parece um URL válida do YouTube'
    )
    .transform((url) => youtubeIdSchema.parse(extrairYoutubeId(url)))
})

export const anexarVideoYoutubeSchema = z.object({
  jogoId: z.string().min(1),
  grupoId: z.string().min(1),
  youtubeId: youtubeIdSchema,
})

export type Youtube = z.output<typeof youtubeSchema>
export type AnexarVideoYoutube = z.infer<typeof anexarVideoYoutubeSchema>
