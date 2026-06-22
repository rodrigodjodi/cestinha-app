import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'
import { equipeJogoSchema, listaJogadoresSchema } from './equipe.schema'

export const criarJogoSchema = z.object({
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
  anotadorId: z.string().min(1).nullable(),
})

export const jogoStatusSchema = z.enum([
  'ocioso',
  'rodando',
  'pausado',
  'finalizado'
])
const timerSchema = z.object({
  status: jogoStatusSchema.default('ocioso'),
  iniciadoEm: z.instanceof(Timestamp).nullable().default(null),
  pausadoEm: z.instanceof(Timestamp).nullable().default(null),
  finalizadoEm: z.instanceof(Timestamp).nullable().default(null),
  tempoPausadoTotalMs: z.int().nonnegative().default(0),
  duracao: z.int().nonnegative().default(615)
})

const videoPadrao = {
  youtubeId: null,
  offsetMs: 0,
  thumbUrl: null,
  thumbPath: null,
} as const

export const videoSchema = z.object({
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable().default(null),
  offsetMs: z.number().int().nonnegative().default(0),
  thumbUrl: z.url().nullable().default(null),
  thumbPath: z.string().min(1).nullable().default(null),
}).default(videoPadrao)

export const baseJogoSchema = z.object({
  grupoId: z.string().min(1),
  diaId: z.string().min(1),
  video: videoSchema,
  anotadorId: z.string().min(1).nullable().default(null),
  timer: timerSchema,
  equipes: z.object({
    esquerda: equipeJogoSchema,
    direita: equipeJogoSchema,
  }),
  banco: listaJogadoresSchema,
  placar: z.object({
    esquerda: z.number().int().nonnegative(),
    direita: z.number().int().nonnegative(),
  }),
}).superRefine((jogo, ctx) => {
  const posicaoPorJogador = new Map<string, string>()
  const posicoes = [
    ['equipes', 'esquerda', jogo.equipes.esquerda.jogadores],
    ['equipes', 'direita', jogo.equipes.direita.jogadores],
    ['banco', null, jogo.banco],
  ] as const

  posicoes.forEach(([grupo, lado, jogadores]) => {
    const posicao = lado ?? grupo
    const jogadoresUnicos = new Set(jogadores)

    jogadoresUnicos.forEach((jogadorId) => {
      const posicaoAnterior = posicaoPorJogador.get(jogadorId)

      if (posicaoAnterior && posicaoAnterior !== posicao) {
        const index = jogadores.indexOf(jogadorId)

        ctx.addIssue({
          code: 'custom',
          message: `O jogador já pertence a ${posicaoAnterior}`,
          path: lado
            ? [grupo, lado, 'jogadores', index]
            : [grupo, index],
        })
      } else {
        posicaoPorJogador.set(jogadorId, posicao)
      }
    })
  })
});
export const jogoSchema = baseJogoSchema.safeExtend({
  criadoPor: z.string().min(1),
  nome: z.string().min(1),
  id: z.string().min(1),
})

export type BaseJogo = z.input<typeof baseJogoSchema>
export type CriarJogo = z.infer<typeof criarJogoSchema>
export type Jogo = z.output<typeof jogoSchema>
export type JogoStatus = z.infer<typeof jogoStatusSchema>
