import { z } from "zod";
import normalizarTexto from "@/utils/normalizarTexto";
// nomenclatura: base usamos na criação e edição, e o schema
// é o que usamos para ler os dados do banco, onde as datas já
// estão convertidas para Date
export const atribuicaoJogadorSchema = z.enum([
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

export const criarJogadorInputSchema = z.object({
  nome: z.string("O nome é obrigatório").min(2, "O nome deve ter pelo menos 2 caracteres"),
  grupoId: z.string().min(1),
  atribuicao: atribuicaoJogadorSchema.exclude(['admin']),
}).strict()

export const alterarAtribuicaoJogadorInputSchema = z.object({
  atribuicao: atribuicaoJogadorSchema,
}).strict()

// schema usado para calcular o output, recebe servertimestamp do firebase
export const jogadorSchema = objetoBaseJogadorSchema.extend({
  nomeNormalizado: z.string().min(2),
  id: z.string().min(1),
  fotoUrl: z.string().optional(),
})


// valida o formulário e o body da criação
export type CriacaoJogador = z.input<typeof criarJogadorInputSchema>;
// valida antes de mandar pro Firebase
export type PayloadCriacaoJogador = z.output<typeof baseJogadorSchema>;
// valida objeto que vem do firebase
export type Jogador = z.output<typeof jogadorSchema>;
export type AtribuicaoJogador = z.output<typeof atribuicaoJogadorSchema>;
export type CriarJogadorResponse = {
  jogadorId: string
}
export type AlterarAtribuicaoJogadorInput = z.input<typeof alterarAtribuicaoJogadorInputSchema>
export type AlterarAtribuicaoJogadorResponse = {
  jogadorId: string
  atribuicao: AtribuicaoJogador
}
