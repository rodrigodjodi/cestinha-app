import { z } from 'zod'

export const timeDiaIdSchema = z.enum([
  'time1',
  'time2',
  'time3',
])

export const ladoEquipeSchema = z.enum([
  'esquerda',
  'direita',
])

export const listaJogadoresSchema = z.array(z.string().min(1)).superRefine((jogadores, ctx) => {
  const jogadoresEncontrados = new Set<string>()

  jogadores.forEach((jogadorId, index) => {
    if (jogadoresEncontrados.has(jogadorId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Um jogador não pode aparecer mais de uma vez na mesma lista',
        path: [index],
      })
    }

    jogadoresEncontrados.add(jogadorId)
  })
})

export const timeDiaSchema = z.object({
  nome: z.string().min(1).optional(),
  jogadores: listaJogadoresSchema,
})

export const equipeJogoSchema = z.object({
  nome: z.string().min(1),
  jogadores: listaJogadoresSchema,
})

export type TimeDiaId = z.infer<typeof timeDiaIdSchema>
export type LadoEquipe = z.infer<typeof ladoEquipeSchema>
export type TimeDia = z.infer<typeof timeDiaSchema>
export type EquipeJogo = z.infer<typeof equipeJogoSchema>
