<script setup lang="ts">
import { useScreenOrientation } from '@vueuse/core'
import type { LadoEquipe } from '~/schemas/equipe.schema'
import type { Jogador } from '~/schemas/jogador.schema'
import { calcularPlacarAteTempo } from '~/utils/calcularPlacarAteTempo'

type AnotacaoPendente = {
  jogadorId: string
  equipe: LadoEquipe
  tempoMs: number
}

type EscolhaAnotacaoJogada = {
  tipo: '2PM' | '3PM'
  assistenciaId?: string
}

const jogoStore = useJogoStore()
const toast = useToast()
const user = useCurrentUser()
const orientation = useScreenOrientation()
const {
  jogo,
  jogadas,
  equipeEsquerda,
  equipeDireita,
  status,
  iniciadoEm,
  pausadoEm,
  finalizadoEm,
  duracao,
  tempoPausadoTotalMs,
} = storeToRefs(jogoStore)

const isLandscape = computed(() => {
  return orientation.orientation.value?.includes('landscape')
})

const agora = ref(Date.now())
let interval: ReturnType<typeof setInterval> | null = null
const anotacaoPendente = ref<AnotacaoPendente | null>(null)
const modalAnotacaoAberto = ref(false)
const enviandoAnotacao = ref(false)

const podeAnotar = computed(() =>
  Boolean(
    jogo.value?.anotadorId
    && jogo.value.anotadorId === user.value?.uid
  )
)

const tempoDecorridoSegundos = computed(() => {
  if (!iniciadoEm.value) return 0

  let referencia = agora.value
  if (status.value === 'pausado') {
    referencia = pausadoEm.value ?? referencia
  }
  if (status.value === 'finalizado') {
    referencia = finalizadoEm.value ?? referencia
  }

  return Math.max(
    0,
    Math.floor(
      (
        referencia
        - iniciadoEm.value
        - (tempoPausadoTotalMs.value ?? 0)
      ) / 1000
    )
  )
})

const tempoDecorridoMs = computed(() => {
  if (status.value === 'finalizado') {
    return (duracao.value ?? tempoDecorridoSegundos.value) * 1000
  }

  return tempoDecorridoSegundos.value * 1000
})

const placar = computed(() =>
  calcularPlacarAteTempo(jogadas.value, tempoDecorridoMs.value)
)

const candidatosAssistencia = computed<Jogador[]>(() => {
  const pendente = anotacaoPendente.value
  if (!pendente) return []

  const jogadoresEquipe = pendente.equipe === 'esquerda'
    ? equipeEsquerda.value
    : equipeDireita.value

  return jogadoresEquipe.filter(jogador => jogador.id !== pendente.jogadorId)
})

function scoreFormatado(valor: number) {
  return String(valor).padStart(2, '0')
}

function iniciarTicker() {
  if (interval) return

  interval = setInterval(() => {
    agora.value = Date.now()
  }, 1000)
}

function pararTicker() {
  if (!interval) return

  clearInterval(interval)
  interval = null
}

function iniciarAnotacao(jogadorId: string, equipe: LadoEquipe) {
  if (!podeAnotar.value) {
    toast.add({
      title: 'Anotação indisponível',
      description: 'Somente o anotador do jogo pode marcar ações ao vivo.',
      color: 'warning',
    })
    return
  }

  anotacaoPendente.value = {
    jogadorId,
    equipe,
    tempoMs: tempoDecorridoMs.value,
  }
  modalAnotacaoAberto.value = true
}

async function confirmarAnotacao(escolha: EscolhaAnotacaoJogada) {
  if (!anotacaoPendente.value || enviandoAnotacao.value) return

  enviandoAnotacao.value = true
  try {
    await jogoStore.anotarJogada({
      ...anotacaoPendente.value,
      ...escolha,
    })
    modalAnotacaoAberto.value = false
    anotacaoPendente.value = null
    toast.add({
      title: 'Jogada anotada',
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível anotar a jogada:', error)
    toast.add({
      title: 'Não foi possível anotar a jogada',
      description: 'Revise a escolha e tente novamente.',
      color: 'error',
    })
  } finally {
    enviandoAnotacao.value = false
  }
}

function limparAnotacaoPendente() {
  if (!modalAnotacaoAberto.value) {
    anotacaoPendente.value = null
  }
}

watch(status, value => {
  if (value === 'rodando') {
    iniciarTicker()
    return
  }

  agora.value = Date.now()
  pararTicker()
}, { immediate: true })

onBeforeUnmount(pararTicker)
</script>

<template>
  <UAlert
    v-if="!jogo"
    color="neutral"
    variant="soft"
    icon="i-lucide-loader-circle"
    title="Carregando placar"
  />

  <div
    v-else
    class="scoreboard-layout"
    :class="isLandscape ? 'scoreboard-layout-landscape' : 'scoreboard-layout-portrait'"
  >
    <UCard class="timer-zone overflow-hidden" :ui="{ body: 'flex h-full min-h-0 flex-col p-2' }">
      <Timer :size="isLandscape ? 'large' : 'compact'" />

      <div v-if="isLandscape" class="score-row score-row-landscape">
        <span class="score-team text-primary">
          {{ jogo.equipes.esquerda.nome }}
        </span>
        <span class="score-total">
          {{ scoreFormatado(placar.esquerda) }}
          <span class="score-separator">x</span>
          {{ scoreFormatado(placar.direita) }}
        </span>
        <span class="score-team text-error">
          {{ jogo.equipes.direita.nome }}
        </span>
      </div>
    </UCard>

    <UCard
      v-if="isLandscape"
      class="team-zone team-zone-left"
      :ui="{ body: 'flex h-full min-h-0 flex-col gap-2 p-3' }"
    >
      <div class="team-actions-header text-primary">
        {{ jogo.equipes.esquerda.nome }}
      </div>

      <div class="player-list">
        <ItemJogadorSelecao
          v-for="jogador in equipeEsquerda"
          :key="jogador.id"
          :jogador="jogador"
          subtitulo=""
          :disabled="!podeAnotar || enviandoAnotacao"
          :selected="jogador.id === anotacaoPendente?.jogadorId"
          class="w-full min-w-0"
          @toggle="iniciarAnotacao(jogador.id, 'esquerda')"
        />
      </div>
    </UCard>

    <UCard
      v-if="isLandscape"
      class="team-zone team-zone-right"
      :ui="{ body: 'flex h-full min-h-0 flex-col gap-2 p-3' }"
    >
      <div class="team-actions-header text-right text-error">
        {{ jogo.equipes.direita.nome }}
      </div>

      <div class="player-list">
        <ItemJogadorSelecao
          v-for="jogador in equipeDireita"
          :key="jogador.id"
          :jogador="jogador"
          subtitulo=""
          :disabled="!podeAnotar || enviandoAnotacao"
          :selected="jogador.id === anotacaoPendente?.jogadorId"
          class="w-full min-w-0"
          @toggle="iniciarAnotacao(jogador.id, 'direita')"
        />
      </div>
    </UCard>

    <UCard
      v-if="!isLandscape"
      class="actions-zone"
      :ui="{ body: 'h-full min-h-0 p-2 sm:p-3' }"
    >
      <div class="actions-grid">
        <section class="team-actions">
          <div class="team-actions-header text-primary">
            {{ jogo.equipes.esquerda.nome }}
          </div>
          <div class="player-list">
            <ItemJogadorSelecao
              v-for="jogador in equipeEsquerda"
              :key="jogador.id"
              :jogador="jogador"
              subtitulo=""
              :disabled="!podeAnotar || enviandoAnotacao"
              :selected="jogador.id === anotacaoPendente?.jogadorId"
              class="w-full min-w-0"
              @toggle="iniciarAnotacao(jogador.id, 'esquerda')"
            />
          </div>
        </section>

        <section class="team-actions">
          <div class="team-actions-header text-error">
            {{ jogo.equipes.direita.nome }}
          </div>
          <div class="player-list">
            <ItemJogadorSelecao
              v-for="jogador in equipeDireita"
              :key="jogador.id"
              :jogador="jogador"
              subtitulo=""
              :disabled="!podeAnotar || enviandoAnotacao"
              :selected="jogador.id === anotacaoPendente?.jogadorId"
              class="w-full min-w-0"
              @toggle="iniciarAnotacao(jogador.id, 'direita')"
            />
          </div>
        </section>
      </div>
    </UCard>

    <UCard
      v-if="!isLandscape"
      class="score-zone"
      :ui="{ body: 'p-3' }"
    >
      <div class="score-row">
        <span class="score-team text-primary">
          {{ jogo.equipes.esquerda.nome }}
        </span>
        <span class="score-total">
          {{ scoreFormatado(placar.esquerda) }}
          <span class="score-separator">x</span>
          {{ scoreFormatado(placar.direita) }}
        </span>
        <span class="score-team text-error">
          {{ jogo.equipes.direita.nome }}
        </span>
      </div>
    </UCard>
  </div>

  <ModalAnotacaoJogada
    v-model:open="modalAnotacaoAberto"
    :jogador-id="anotacaoPendente?.jogadorId ?? null"
    :candidatos-assistencia="candidatosAssistencia"
    :enviando="enviandoAnotacao"
    @confirmar="confirmarAnotacao"
    @close="limparAnotacaoPendente"
  />
</template>

<style scoped>
.scoreboard-layout {
  display: grid;
  height: 100%;
  min-height: 0;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--ui-bg-muted);
}

.scoreboard-layout-portrait {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 5.5rem minmax(0, 1fr) auto;
  grid-template-areas:
    "timer"
    "actions"
    "score";
}

.scoreboard-layout-landscape {
  grid-template-columns: minmax(10rem, 0.62fr) minmax(18rem, 1.76fr) minmax(10rem, 0.62fr);
  grid-template-rows: minmax(0, 1fr);
  grid-template-areas: "left timer right";
}

.timer-zone {
  grid-area: timer;
  min-height: 0;
}

.team-zone,
.actions-zone,
.score-zone {
  min-width: 0;
  min-height: 0;
}

.team-zone-left {
  grid-area: left;
}

.team-zone-right {
  grid-area: right;
}

.actions-zone {
  grid-area: actions;
}

.score-zone {
  grid-area: score;
}

.team-actions-header,
.score-team {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  height: 100%;
  min-height: 0;
}

.team-actions {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

.player-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.score-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
}

.score-row-landscape {
  flex: none;
  border-top: 1px solid var(--ui-border);
  padding: 0.75rem 0.5rem 0.25rem;
}

.score-team {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-team:last-child {
  text-align: right;
}

.score-total {
  color: var(--ui-text-highlighted);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.score-separator {
  padding: 0 0.25rem;
  color: var(--ui-text-muted);
}
</style>
