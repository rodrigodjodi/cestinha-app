import { z } from "zod";
import { serverTimestamp, Timestamp } from "firebase/firestore";
export const escalacaoSchema = z.record(
  z.string().min(1),
  z.object({
    time: z.enum(['A', 'B']),
    ordem: z.number().int().optional()
  })
).default({});
export const baseJogoSchema = z.object({
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
  videoId: z.string().min(1).nullable(),
  status: z.enum(['0.ocioso', '1.rodando', '2.pausado', '3.finalizado']).default('0.ocioso'),
  iniciadoEm: z.instanceof(Timestamp).nullable(),
  pausadoEm: z.instanceof(Timestamp).nullable(),
  escalacao: escalacaoSchema,
});
export const jogoSchema = baseJogoSchema.extend({
  criadoPor: z.string().min(1),
  nome: z.string().min(1),
  id: z.string().min(1),
})

export type BaseJogo = z.input<typeof baseJogoSchema>
export type Jogo = z.output<typeof jogoSchema>
export type Escalacao = z.output<typeof escalacaoSchema>
