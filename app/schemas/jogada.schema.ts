import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { ladoEquipeSchema } from './equipe.schema'

export const tipoJogadaSchema = z.enum([
  'FTM',
  '2PM',
  '3PM',
  'REB',
  'STL',
  'BLK',
  'TO',
  'FOU',
]);

export const criarJogadaInputSchema = z.object({
  jogadorId: z.string().min(1),
  tipo: tipoJogadaSchema.extract(['2PM', '3PM']),
  tempoMs: z.number().int().nonnegative(),
  equipe: ladoEquipeSchema,
  assistenciaId: z.string().min(1).optional(),
}).strict().superRefine((jogada, ctx) => {
  if (jogada.assistenciaId === jogada.jogadorId) {
    ctx.addIssue({
      code: 'custom',
      message: 'O jogador não pode dar assistência para si mesmo',
      path: ['assistenciaId'],
    })
  }
})

export const ajustarTempoJogadaInputSchema = z.object({
  tempoMs: z.number().int().nonnegative(),
}).strict()

export const deslocarJogadasInputSchema = z.object({
  deltaMs: z.number().int(),
}).strict()

export const baseJogadaSchema = z.object({
  diaId: z.string().min(1),
  jogoId: z.string().min(1),
  jogadorId: z.string().min(1),
  tipo: tipoJogadaSchema,
  tempoMs: z.number().int().nonnegative(),
  equipe: ladoEquipeSchema,
  assistenciaId: z.string().min(1).optional()
}).superRefine((jogada, ctx) => {
  if (
    jogada.assistenciaId
    && !['2PM', '3PM'].includes(jogada.tipo)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Assistência só pode existir em cestas de 2 ou 3 pontos',
      path: ['assistenciaId'],
    })
  }

  if (jogada.assistenciaId === jogada.jogadorId) {
    ctx.addIssue({
      code: 'custom',
      message: 'O jogador não pode dar assistência para si mesmo',
      path: ['assistenciaId'],
    })
  }
});

export const jogadaSchema = baseJogadaSchema.safeExtend({
  id: z.string().min(1),
  anotadoPor: z.string().min(1),
  anotadoEm: z.instanceof(Timestamp).transform(ts => ts.toDate()),
})

export type CriarJogadaInput = z.infer<typeof criarJogadaInputSchema>
export type AjustarTempoJogadaInput = z.infer<typeof ajustarTempoJogadaInputSchema>
export type DeslocarJogadasInput = z.infer<typeof deslocarJogadasInputSchema>
export type BaseJogada = z.infer<typeof baseJogadaSchema>;
export type Jogada = z.infer<typeof jogadaSchema>;
export type TipoJogada = z.infer<typeof tipoJogadaSchema>;
export type CriarJogadaResponse = {
  jogadaId: string
  criada: true
}
export type AjustarTempoJogadaResponse = {
  sucesso: true
  jogadaId: string
  tempoMs: number
}
export type DeslocarJogadasResponse = {
  sucesso: true
  total: number
  deltaMs: number
}
