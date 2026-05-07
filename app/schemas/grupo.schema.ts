import { z } from 'zod'
import { zTimestampToDate } from './timestamp.schema'
const baseGrupoSchema = z.object({
  nome: z.string('O nome é obrigatório').min(2, 'O nome deve ter pelo menos 2 caracteres'),
  usuarios: z.array(z.string().min(1)).min(1),
})

export const grupoSchema = baseGrupoSchema.extend({
  criadoEm: zTimestampToDate,
  criadoPor: z.string().min(1),
})
export const criacaoGrupoSchema = baseGrupoSchema.extend({
  apelido: z.string('O apelido é obrigatório').min(2, 'O apelido deve ter pelo menos 2 caracteres'),
})
export type CriacaoGrupo = z.input<typeof criacaoGrupoSchema>
export type Grupo = z.output<typeof grupoSchema>