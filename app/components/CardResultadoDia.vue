<script setup lang="ts">
import type { Jogo } from '~/schemas/jogo.schema'
import type { Jogada } from '~/schemas/jogada.schema'
import type { Jogador } from '~/schemas/jogador.schema'

type LinhaResultado = {
  jogadorId: string
  nome: string
  total: number
}

type ResultadoDia = {
  pontuadores: LinhaResultado[]
  assistencias: LinhaResultado[]
  cestasTres: LinhaResultado[]
  vitorias: LinhaResultado[]
  jogosComVencedor: number
}

const props = defineProps<{
  jogadores: Jogador[]
  jogadas: Jogada[]
  jogos: Jogo[]
  pending?: boolean
  error?: unknown
}>()

const resultado = ref<ResultadoDia | null>(null)
const montando = ref(false)

const jogadoresMap = computed(() => new Map(
  props.jogadores.map(jogador => [jogador.id, jogador])
))
const temResultado = computed(() => resultado.value !== null)
const totalJogadas = computed(() => props.jogadas.length)
const totalJogos = computed(() => props.jogos.length)
const botaoLabel = computed(() =>
  temResultado.value ? 'Atualizar estatísticas' : 'Montar estatísticas'
)

const pontosPorTipo: Partial<Record<Jogada['tipo'], number>> = {
  FTM: 1,
  '2PM': 2,
  '3PM': 3,
}

function resolverNomeJogador(jogadorId: string) {
  return jogadoresMap.value.get(jogadorId)?.nome ?? 'Jogador'
}

function incrementar(mapa: Map<string, number>, jogadorId: string, total: number) {
  mapa.set(jogadorId, (mapa.get(jogadorId) ?? 0) + total)
}

function ordenarResultado(mapa: Map<string, number>) {
  return [...mapa.entries()]
    .filter(([, total]) => total > 0)
    .map(([jogadorId, total]) => ({
      jogadorId,
      nome: resolverNomeJogador(jogadorId),
      total,
    }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'))
}

function montarEstatisticas() {
  montando.value = true

  const pontos = new Map<string, number>()
  const assistencias = new Map<string, number>()
  const cestasTres = new Map<string, number>()
  const vitorias = new Map<string, number>()
  let jogosComVencedor = 0

  for (const jogada of props.jogadas) {
    const pontosJogada = pontosPorTipo[jogada.tipo] ?? 0
    if (pontosJogada > 0) {
      incrementar(pontos, jogada.jogadorId, pontosJogada)
    }

    if (jogada.assistenciaId) {
      incrementar(assistencias, jogada.assistenciaId, 1)
    }

    if (jogada.tipo === '3PM') {
      incrementar(cestasTres, jogada.jogadorId, 1)
    }
  }

  for (const jogo of props.jogos) {
    if (jogo.placar.esquerda === jogo.placar.direita) continue

    const ladoVencedor = jogo.placar.esquerda > jogo.placar.direita
      ? 'esquerda'
      : 'direita'

    jogosComVencedor += 1
    for (const jogadorId of jogo.equipes[ladoVencedor].jogadores) {
      incrementar(vitorias, jogadorId, 1)
    }
  }

  resultado.value = {
    pontuadores: ordenarResultado(pontos),
    assistencias: ordenarResultado(assistencias),
    cestasTres: ordenarResultado(cestasTres).slice(0, 5),
    vitorias: ordenarResultado(vitorias),
    jogosComVencedor,
  }

  montando.value = false
}
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <h2 class="text-xl font-bold">Resultado do dia</h2>
      <UBadge class="ml-auto" color="neutral" variant="soft">
        {{ totalJogos }} jogos
      </UBadge>
      <UBadge color="neutral" variant="soft">
        {{ totalJogadas }} jogadas
      </UBadge>
    </div>

    <UAlert
      v-if="error"
      class="mb-4"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar os dados"
    />

    <UButton
      color="primary"
      icon="i-lucide-refresh-cw"
      :loading="pending || montando"
      :disabled="Boolean(error)"
      @click="montarEstatisticas"
    >
      {{ botaoLabel }}
    </UButton>

    <div v-if="resultado" class="mt-6 grid gap-4 md:grid-cols-2">
      <section class="rounded-lg border border-default p-4">
        <h3 class="mb-3 font-semibold">Pontuadores</h3>
        <ol v-if="resultado.pontuadores.length" class="space-y-2">
          <li
            v-for="item in resultado.pontuadores"
            :key="item.jogadorId"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span>{{ item.nome }}</span>
            <span class="font-semibold tabular-nums">{{ item.total }}</span>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">Nenhum ponto registrado.</p>
      </section>

      <section class="rounded-lg border border-default p-4">
        <h3 class="mb-3 font-semibold">Assistências</h3>
        <ol v-if="resultado.assistencias.length" class="space-y-2">
          <li
            v-for="item in resultado.assistencias"
            :key="item.jogadorId"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span>{{ item.nome }}</span>
            <span class="font-semibold tabular-nums">{{ item.total }}</span>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">Nenhuma assistência registrada.</p>
      </section>

      <section class="rounded-lg border border-default p-4">
        <h3 class="mb-3 font-semibold">Top 5 cestas de 3</h3>
        <ol v-if="resultado.cestasTres.length" class="space-y-2">
          <li
            v-for="item in resultado.cestasTres"
            :key="item.jogadorId"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span>{{ item.nome }}</span>
            <span class="font-semibold tabular-nums">{{ item.total }}</span>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">Nenhuma cesta de 3 registrada.</p>
      </section>

      <section class="rounded-lg border border-default p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="font-semibold">Vitórias</h3>
          <UBadge color="success" variant="soft">
            {{ resultado.jogosComVencedor }} jogos
          </UBadge>
        </div>
        <ol v-if="resultado.vitorias.length" class="space-y-2">
          <li
            v-for="item in resultado.vitorias"
            :key="item.jogadorId"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span>{{ item.nome }}</span>
            <span class="font-semibold tabular-nums">{{ item.total }}</span>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">Nenhuma vitória registrada.</p>
      </section>
    </div>
  </UCard>
</template>
