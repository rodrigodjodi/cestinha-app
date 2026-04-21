import * as z from 'zod'

export const JogoSchema = z.object({
    grupoId: z.string(),
    youtubeUrl: z.string().url()
})

export type JogoInput = z.infer<typeof JogoSchema>