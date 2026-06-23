import type { Jogada } from '~/schemas/jogada.schema'

export type Placar = {
  esquerda: number
  direita: number
}

export function calcularPlacarAteTempo(
  jogadas: Jogada[],
  tempoLimiteMs: number
): Placar {
  return jogadas.reduce<Placar>((placar, jogada) => {
    if (jogada.tempoMs > tempoLimiteMs) {
      return placar
    }

    const pontos = jogada.tipo === '2PM'
      ? 2
      : jogada.tipo === '3PM'
        ? 3
        : 0

    if (!pontos) return placar

    return {
      ...placar,
      [jogada.equipe]: placar[jogada.equipe] + pontos,
    }
  }, {
    esquerda: 0,
    direita: 0,
  })
}
