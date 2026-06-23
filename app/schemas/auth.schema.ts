import { z } from 'zod'

export const signupSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string('Campo obrigatório').min(6, 'A senha deve ter pelo menos 6 caracteres'),
  nome: z.string('Campo obrigatório').min(2, 'O nome deve ter pelo menos 2 caracteres'),
})
export const loginSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string('Campo obrigatório').min(6, 'A senha deve ter pelo menos 6 caracteres'),
})
export const recoverPasswordSchema = z.object({
  email: z.email('Email inválido'),
})

export type SignupData = z.output<typeof signupSchema>
export type LoginData = z.output<typeof loginSchema>
export type RecoverPasswordData = z.output<typeof recoverPasswordSchema>
