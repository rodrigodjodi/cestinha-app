import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'
// nomenclatura: base usamos na criação e edição, e o schema 
// é o que usamos para ler os dados do banco, onde as datas já 
// estão convertidas para Date
export const baseUsuarioSchema = z.object({
  email: z.email('Email inválido'),
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
})

export const usuarioSchema = baseUsuarioSchema.extend({
  criadoEm: z.instanceof(Timestamp).transform(ts => ts.toDate()),
})

export type Usuario = z.output<typeof usuarioSchema>