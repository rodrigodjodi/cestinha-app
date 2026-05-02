import { z } from 'zod'

export const usuarioSchema = z.object({
  email: z.email('Email inválido'),
  nome: z.string('Campo obrigatório').min(2, 'O nome deve ter pelo menos 2 caracteres'),
  criadoEm: z.string().transform((str) => new Date(str)),
})

export type Usuario = z.output<typeof usuarioSchema>