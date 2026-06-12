import { z } from 'zod'
function extrairYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
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
  jogoId: z.string().min(1),
  videoUrl: z
    .string()
    .trim()
    .min(1, 'Informe uma URL')
    .refine(
      (url) => extrairYoutubeId(url) !== null,
      'Não parece um URL válida do YouTube'
    )
    .transform((url) => extrairYoutubeId(url)!)
})

export type Youtube = z.output<typeof youtubeSchema>