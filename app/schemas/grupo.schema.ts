import { z } from 'zod'
const baseGrupoSchema = z.object({
  nome: z.string('O nome é obrigatório').min(2, 'O nome deve ter pelo menos 2 caracteres'),
})

export const grupoSchema = baseGrupoSchema.extend({
  criadoPor: z.string().min(1),
  usuarios: z.array(z.string().min(1)).min(1)
})
export const criacaoGrupoSchema = baseGrupoSchema.extend({
  apelido: z.string('O apelido é obrigatório').min(2, 'O apelido deve ter pelo menos 2 caracteres'),
})
// usado para validar o formulário
export type FormCriacaoGrupo = z.input<typeof criacaoGrupoSchema>
// usado para validar o payload do request
export type BaseCriacaoGrupo = z.input<typeof baseGrupoSchema>
// valida o que vem do banco
export type Grupo = z.output<typeof grupoSchema>