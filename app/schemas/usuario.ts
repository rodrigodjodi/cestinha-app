import { z } from 'zod'

export const usuarioSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string('Campo obrigatório').min(6, 'A senha deve ter pelo menos 6 caracteres'),
  nome: z.string('Campo obrigatório').min(2, 'O nome deve ter pelo menos 2 caracteres'),
})
export type Usuario = z.output<typeof usuarioSchema>