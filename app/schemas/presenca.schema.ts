import { z } from "zod"

const situacaoSchema = z.enum([
    '0.confirmado',
    '1.espera',
    '2.negativa'
])
// apenas para o formulário
export const formPresencaSchema = z.object({
    nome: z.string('O nome é obrigatório').min(2, 'Informe ao menos 2 caracteres para o nome'),
})
// dados que importam para a criacao
export const basePresencaSchema = z.object({
    jogadorId: z.string().min(1),
    grupoId: z.string().min(1),
    diaId: z.string().min(1),
})
export const presencaSchema = basePresencaSchema.extend({
    situacao: situacaoSchema,
    criadoPor: z.string().min(1),
})
export type FormPresenca = z.input<typeof formPresencaSchema>
export type Inscricao = z.input<typeof basePresencaSchema>
export type Presenca = z.output<typeof presencaSchema>