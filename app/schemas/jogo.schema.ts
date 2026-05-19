import { z } from "zod";
export const baseJogoSchema = z.object({
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
  videoId: z.string().min(1).nullable(),
});

export type BaseJogo = z.input<typeof baseJogoSchema>
