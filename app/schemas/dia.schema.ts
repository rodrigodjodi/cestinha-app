import {z} from "zod";

export const baseDiaSchema = z.object({
    grupoId: z.string().min(1),
    data: z.iso.date(),
    numJogos: z.number().int().nonnegative().default(0),
    status: z.enum([
        '0.inscrevendo',
        '1.jogando',
        '2.concluido'
    ]).default('0.inscrevendo'),
})
export const diaSchema = baseDiaSchema.extend({
    criadoPor: z.string().min(1),
})
export type BaseDia = z.output<typeof baseDiaSchema>
export type Dia = z.output<typeof diaSchema>