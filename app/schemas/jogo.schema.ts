import { z } from "zod";
import { Timestamp } from "firebase/firestore";
export const escalacaoSchema = z.record(
  z.string().min(1),
  z.object({
    time: z.enum(['A', 'B']),
    ordem: z.number().int().optional()
  })
).nullable().default({});
export const jogoStatusSchema = z.enum([
  'ocioso',
  'rodando',
  'pausado',
  'finalizado'
])
const timerSchema = z.object({
  status: jogoStatusSchema.default('ocioso'),
  iniciadoEm: z.instanceof(Timestamp).nullable().default(null),
  pausadoEm: z.instanceof(Timestamp).nullable().default(null),
  finalizadoEm: z.instanceof(Timestamp).nullable().default(null),
  tempoPausadoTotalMs: z.int().nonnegative().default(0),
  duracao: z.int().nonnegative().default(615)
})
export const baseJogoSchema = z.object({
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
  videoId: z.string().min(1).nullable().default(null),
  escalacao: escalacaoSchema,
  anotadorId: z.string().min(1).nullable().default(null),
  timer: timerSchema
});
export const jogoSchema = baseJogoSchema.extend({
  criadoPor: z.string().min(1),
  nome: z.string().min(1),
  id: z.string().min(1),
})

export type BaseJogo = z.input<typeof baseJogoSchema>
export type Jogo = z.output<typeof jogoSchema>
export type Escalacao = z.output<typeof escalacaoSchema>
export type JogoStatus = z.infer<typeof jogoStatusSchema>