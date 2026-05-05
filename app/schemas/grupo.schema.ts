import { z } from 'zod'
import { zTimestampToDate } from './timestamp.schema'
const baseGrupoSchema = z.object({
  nome: z.string().min(2),
  usuarios: z.array(z.uuid()).min(1),
})

export const grupoSchema = baseGrupoSchema.extend({
  criadoEm: zTimestampToDate,
})

export type GrupoFirestore = z.input<typeof grupoSchema>
export type Grupo = z.output<typeof grupoSchema>