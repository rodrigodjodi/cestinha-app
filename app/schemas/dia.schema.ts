import { z } from 'zod'
import { timeDiaSchema } from './equipe.schema'

export const baseDiaSchema = z.object({
  grupoId: z.string().min(1),
  data: z.iso.date(),
  numJogos: z.number().int().nonnegative().default(0),
  status: z.enum([
    '0.inscrevendo',
    '1.jogando',
    '2.concluido',
  ]).default('0.inscrevendo'),
  times: z.object({
    time1: timeDiaSchema,
    time2: timeDiaSchema,
    time3: timeDiaSchema,
  }),
}).superRefine((dia, ctx) => {
  const timePorJogador = new Map<string, string>()

  Object.entries(dia.times).forEach(([time, dadosTime]) => {
    dadosTime.jogadores.forEach((jogadorId, index) => {
      const timeAnterior = timePorJogador.get(jogadorId)

      if (timeAnterior && timeAnterior !== time) {
        ctx.addIssue({
          code: 'custom',
          message: `O jogador já pertence ao ${timeAnterior}`,
          path: ['times', time, 'jogadores', index],
        })
      } else {
        timePorJogador.set(jogadorId, time)
      }
    })
  })
})
export const diaSchema = baseDiaSchema.safeExtend({
  criadoPor: z.string().min(1),
})
export type BaseDia = z.output<typeof baseDiaSchema>
export type Dia = z.output<typeof diaSchema>
