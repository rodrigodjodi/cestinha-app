import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'

export const situacaoPresencaSchema = z.enum([
  '0.confirmado',
  '1.espera',
  '2.negativa',
])

export const formPresencaSchema = z.object({
  nome: z.string('O nome é obrigatório').min(2, 'Informe ao menos 2 caracteres para o nome'),
})

export const basePresencaSchema = z.object({
  jogadorId: z.string().min(1),
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
})

export const presencaSchema = basePresencaSchema.extend({
  id: z.string().min(1),
  situacao: situacaoPresencaSchema,
  criadoPor: z.string().min(1),
  criadoEm: z.instanceof(Timestamp),
  situacaoEm: z.instanceof(Timestamp),
})

export const alterarSituacaoPresencaSchema = z.object({
  grupoId: z.string().min(1),
  situacao: situacaoPresencaSchema.extract([
    '0.confirmado',
    '1.espera',
  ]),
})

export type FormPresenca = z.input<typeof formPresencaSchema>
export type Inscricao = z.input<typeof basePresencaSchema>
export type Presenca = z.output<typeof presencaSchema>
export type SituacaoPresenca = z.infer<typeof situacaoPresencaSchema>
