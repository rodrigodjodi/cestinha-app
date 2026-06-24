<script setup lang="ts">
import { useScreenOrientation } from '@vueuse/core'
import type { LadoEquipe } from '~/schemas/equipe.schema'
import { calcularPlacarAteTempo } from '~/utils/calcularPlacarAteTempo'

type YoutubePlayerExposed = {
  getTempoAtualMs: () => Promise<number>
  pausar: () => Promise<void>
  seekToMs: (tempoMs: number) => Promise<void>
  getPlaybackRate: () => number
  getAvailablePlaybackRates: () => number[]
  setPlaybackRate: (rate: number) => void
  togglePlaybackRate: () => number
}

type AnotacaoPendente = {
  jogadorId: string
  equipe: LadoEquipe
  tempoMs: number
}

type EscolhaAnotacaoJogada = {
  tipo: '2PM' | '3PM'
  assistenciaId?: string
}

const orientation = useScreenOrientation()
const jogoStore = useJogoStore()
const toast = useToast()
const {
  tempoVideoMs,
  calcularTempoJogoMs,
} = useVideoAnotacao()
const {
  jogo,
  equipeEsquerda,
  equipeDireita,
  youtubeId,
  offsetMs,
} = storeToRefs(jogoStore)

const youtubePlayer = ref<YoutubePlayerExposed | null>(null)
const playerPronto = ref(false)
const velocidadeVideo = ref(1)
const anotacaoPendente = ref<AnotacaoPendente | null>(null)
const modalAnotacaoAberto = ref(false)
const enviandoAnotacao = ref(false)
const jogoId = computed(() => jogo.value?.id)
const { jogadas } = useListaJogadasJogo(jogoId)
const tempoJogoAtualMs = computed(() =>
  Math.round(calcularTempoJogoMs(tempoVideoMs.value, offsetMs.value))
)
const placarNoTempoAtual = computed(() =>
  calcularPlacarAteTempo(jogadas.value, tempoJogoAtualMs.value)
)
const labelVelocidadeVideo = computed(() => `${velocidadeVideo.value}x`)

const isLandscape = computed(() =>
  orientation.orientation.value?.includes('landscape')
)

const candidatosAssistencia = computed(() => {
  const pendente = anotacaoPendente.value
  if (!pendente) return []

  const jogadoresEquipe = pendente.equipe === 'esquerda'
    ? equipeEsquerda.value
    : equipeDireita.value

  return jogadoresEquipe.filter(
    jogador => jogador.id !== pendente.jogadorId
  )
})

async function iniciarAnotacaoVideo(
  jogadorId: string,
  equipe: LadoEquipe,
) {
  if (!jogo.value || !youtubeId.value || !youtubePlayer.value) {
    toast.add({
      title: 'Vídeo indisponível',
      description: 'Carregue o vídeo antes de iniciar uma anotação.',
      color: 'warning',
    })
    return
  }

  try {
    const tempoAtualVideoMs = await youtubePlayer.value.getTempoAtualMs()
    const tempoJogoMs = calcularTempoJogoMs(
      tempoAtualVideoMs,
      offsetMs.value
    )

    anotacaoPendente.value = {
      jogadorId,
      equipe,
      tempoMs: Math.round(tempoJogoMs),
    }
    modalAnotacaoAberto.value = true

    try {
      await youtubePlayer.value.pausar()
    } catch (error) {
      console.error('Não foi possível pausar o vídeo:', error)
      toast.add({
        title: 'Anotação aberta',
        description: 'Não foi possível pausar o vídeo automaticamente.',
        color: 'warning',
      })
    }
  } catch (error) {
    console.error('Não foi possível obter o tempo do vídeo:', error)
    toast.add({
      title: 'Não foi possível iniciar a anotação',
      description: 'Tente novamente quando o player estiver pronto.',
      color: 'error',
    })
  }
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

function elementoBloqueiaAtalho(elemento: Element | null) {
  if (!(elemento instanceof HTMLElement)) return false

  return Boolean(
    elemento.closest('input, textarea, select, form, [contenteditable="true"], [role="dialog"]')
  )
}

function podeExecutarAtalhoVideo(event?: KeyboardEvent) {
  if (event?.repeat || modalAnotacaoAberto.value) return false
  if (import.meta.server) return false

  return !elementoBloqueiaAtalho(document.activeElement)
}

function atualizarVelocidadeVideo(rate: number) {
  velocidadeVideo.value = rate
}

function marcarPlayerPronto() {
  playerPronto.value = true
  velocidadeVideo.value = youtubePlayer.value?.getPlaybackRate() ?? 1
}

function alternarVelocidadeVideo() {
  if (!playerPronto.value) return

  const novaVelocidade = youtubePlayer.value?.togglePlaybackRate()
  if (typeof novaVelocidade === 'number') {
    velocidadeVideo.value = novaVelocidade
  }
}

defineShortcuts({
  v: (event?: KeyboardEvent) => {
    if (!podeExecutarAtalhoVideo(event)) return
    alternarVelocidadeVideo()
  },
})

watch(youtubeId, () => {
  playerPronto.value = false
  velocidadeVideo.value = 1
})
</script>

<template>
  <div
    class="anotacao-layout"
    :class="{
      'anotacao-layout-landscape': isLandscape,
      'anotacao-layout-portrait': !isLandscape,
    }"
  >
    <section class="video-zone">
      <div class="mb-2 flex items-center justify-between gap-4 rounded-lg border border-default bg-default px-4 py-2">
        <div class="flex flex-1 items-center justify-center gap-4">
          <span class="text-sm font-medium text-primary">Esquerda</span>
          <span class="text-2xl font-bold tabular-nums text-highlighted">
            {{ placarNoTempoAtual.esquerda }}
            <span class="px-1 text-muted">×</span>
            {{ placarNoTempoAtual.direita }}
          </span>
          <span class="text-sm font-medium text-error">Direita</span>
        </div>

        <UTooltip text="Alternar velocidade" :kbds="['V']">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            :label="labelVelocidadeVideo"
            :disabled="!playerPronto"
            @click="alternarVelocidadeVideo"
          />
        </UTooltip>
      </div>

      <div v-if="youtubeId" class="aspect-video max-h-[75vh]">
        <YoutubePlayer
          ref="youtubePlayer"
          :youtube-id="youtubeId"
          @ready="marcarPlayerPronto"
          @playback-rate-change="atualizarVelocidadeVideo"
        />
      </div>
      <UAlert
        v-else
        class="m-2"
        color="neutral"
        variant="soft"
        icon="i-lucide-video-off"
        title="Nenhum vídeo anexado"
        description="As equipes continuam disponíveis, mas a anotação por vídeo exige um vídeo."
      />
    </section>

    <section class="timeline-zone">
      <Timeline v-if="youtubeId" />
    </section>

    <section class="equipe-esquerda-zone flex flex-col gap-2">
      <ItemJogadorSelecao
        v-for="jogador in equipeEsquerda"
        :key="jogador.id"
        :jogador="jogador"
        :disabled="!youtubeId"
        :selected="jogador.id === anotacaoPendente?.jogadorId"
        @toggle="iniciarAnotacaoVideo(jogador.id, 'esquerda')"
      />
    </section>

    <section class="equipe-direita-zone flex flex-col gap-2">
      <ItemJogadorSelecao
        v-for="jogador in equipeDireita"
        :key="jogador.id"
        :jogador="jogador"
        :disabled="!youtubeId"
        :selected="jogador.id === anotacaoPendente?.jogadorId"
        @toggle="iniciarAnotacaoVideo(jogador.id, 'direita')"
      />
    </section>
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
.anotacao-layout {
  display: grid;
  height: 100%;
  gap: 0.5rem;
}

.anotacao-layout-landscape {
  grid-template-columns: 140px 1fr 140px;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "equipe-esquerda video equipe-direita"
    "equipe-esquerda timeline equipe-direita";
}

.anotacao-layout-portrait {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "video video"
    "timeline timeline"
    "equipe-esquerda equipe-direita";
}

.video-zone {
  grid-area: video;
}

.timeline-zone {
  grid-area: timeline;
}

.equipe-esquerda-zone {
  grid-area: equipe-esquerda;
}

.equipe-direita-zone {
  grid-area: equipe-direita;
}
</style>
