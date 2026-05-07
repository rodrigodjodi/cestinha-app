import { z } from "zod";
import { zTimestampToDate } from "./timestamp.schema";
// nomenclatura: base usamos na criação e edição, e o schema
// é o que usamos para ler os dados do banco, onde as datas já
// estão convertidas para Date
export const baseJogadorSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  grupoId: z.string().min(1),
  usuarioId: z.string().min(1).nullable(),
});

export const jogadorSchema = baseJogadorSchema.extend({
  criadoEm: zTimestampToDate,
});

export type Jogador = z.output<typeof jogadorSchema>;
export type CriacaoJogador = z.output<typeof baseJogadorSchema>;
