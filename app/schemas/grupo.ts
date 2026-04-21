import { z } from 'zod'
export const grupoSchema = z.object({
    nome: z.string().nonempty('O nome do grupo é obrigatório'),
    descricao: z.string().optional(),
    jogadores: z.array(z.uuid()).optional()
})

export type Grupo = z.infer<typeof grupoSchema>