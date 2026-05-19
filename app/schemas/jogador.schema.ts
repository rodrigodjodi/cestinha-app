import { z } from "zod";
import normalizarTexto from "@/utils/normalizarTexto";
// nomenclatura: base usamos na criação e edição, e o schema
// é o que usamos para ler os dados do banco, onde as datas já
// estão convertidas para Date
const atribuicaoJogadorSchema = z.enum([
  'admin',
  'membro',
  'avulso',
])
const objetoBaseJogadorSchema = z.object({
  nome: z.string("O nome é obrigatório").min(2, "O nome deve ter pelo menos 2 caracteres"),
  grupoId: z.string().min(1),
  usuarioId: z.string().min(1).nullable(),
  atribuicao: atribuicaoJogadorSchema.optional().default('avulso')
})
export const baseJogadorSchema = objetoBaseJogadorSchema.transform(data => ({
  ...data,
  nomeNormalizado: normalizarTexto(data.nome)
}))

// schema usado para calcular o output, recebe servertimestamp do firebase
export const jogadorSchema = objetoBaseJogadorSchema.extend({
  nomeNormalizado: z.string().min(2)
})


//valida o formulário
export type CriacaoJogador = z.input<typeof baseJogadorSchema>;
// valida antes de mandar pro Firebase
export type PayloadCriacaoJogador = z.output<typeof baseJogadorSchema>;
// valida objeto que vem do firebase
export type Jogador = z.output<typeof jogadorSchema>;
