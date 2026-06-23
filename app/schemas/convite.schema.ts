import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'

export const baseConviteSchema = z.object({
  grupoId: z.string().min(1),
})

export const conviteSchema = baseConviteSchema.extend({
  id: z.string().min(1),
  criadoEm: z.instanceof(Timestamp).transform(timestamp => timestamp.toDate()),
})

export const associarJogadorConviteInputSchema = z.object({
  jogadorId: z.string().min(1),
}).strict()

export type Convite = z.output<typeof conviteSchema>
export type AssociarJogadorConviteInput = z.input<
  typeof associarJogadorConviteInputSchema
>

export type AssociarJogadorConviteResponse = {
  jogadorId: string
  grupoId: string
  associada: true
  idempotente: boolean
}
