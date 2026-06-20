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

export const baseJogadaSchema = z.object({
  diaId: z.string().min(1),
  jogoId: z.string().min(1),
  jogadorId: z.string().min(1),
  tipo: tipoJogadaSchema,
  tempoMs: z.number().int().nonnegative().nullable().default(null),
  equipe: ladoEquipeSchema,
  assistenciaId: z.string().min(1).optional()
});

export const jogadaSchema = baseJogadaSchema.extend({
  id: z.string().min(1),
  anotadoPor: z.string().min(1),
  anotadoEm: z.instanceof(Timestamp),
})
export type BaseJogada = z.infer<typeof baseJogadaSchema>;
export type Jogada = z.infer<typeof jogadaSchema>;
export type TipoJogada = z.infer<typeof tipoJogadaSchema>;
