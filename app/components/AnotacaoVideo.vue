<script setup lang="ts">
import { useScreenOrientation } from '@vueuse/core'
import type { LadoEquipe } from '~/schemas/equipe.schema'
import type { Jogada } from '~/schemas/jogada.schema'
import type { Jogador } from '~/schemas/jogador.schema'
import type { Jogo } from '~/schemas/jogo.schema'
import { calcularPlacarAteTempo } from '~/utils/calcularPlacarAteTempo'
import { formatarTempoRestantePlacar } from '~/utils/formatarTempoPlacar'
// tipos
const props = defineProps<{
  jogo: Jogo
  jogadores: Jogador[]
  jogadas: Jogada[]
}>()

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
// composables
const orientation = useScreenOrientation()
const jogoStore = useJogoStore()
const toast = useToast()
const user = useCurrentUser()
const {
  tempoVideoMs,
  calcularTempoJogoMs,
} = useVideoAnotacao()
// estado inicial
const youtubePlayer = ref<YoutubePlayerExposed | null>(null)
const playerPronto = ref(false)
const velocidadeVideo = ref(1)
const anotacaoPendente = ref<AnotacaoPendente | null>(null)
const modalAnotacaoAberto = ref(false)
const enviandoAnotacao = ref(false)
// estado derivado
const jogadoresMap = computed(() => new Map(
  props.jogadores.map(jogador => [jogador.id, jogador])
))
const resolverJogadores = (ids: string[]) => ids.flatMap(id => {
  const jogador = jogadoresMap.value.get(id)
  return jogador ? [jogador] : []
})
const equipeEsquerda = computed(() =>
  resolverJogadores(props.jogo.equipes.esquerda.jogadores)
)
const equipeDireita = computed(() =>
  resolverJogadores(props.jogo.equipes.direita.jogadores)
)
const youtubeId = computed(() => props.jogo.video.youtubeId)
const offsetMs = computed(() => props.jogo.video.offsetMs ?? 0)
const temVideo = computed(() => Boolean(youtubeId.value))
const temJogadas = computed(() => props.jogadas.length > 0)
const podeAnotar = computed(() =>
  Boolean(
    props.jogo.anotadorId
    && props.jogo.anotadorId === user.value?.uid
  )
)
const podeNavegarNoVideo = computed(() =>
  temVideo.value && playerPronto.value
)
const modoVideo = computed<'revisao' | 'anotacao'>(() =>
  podeAnotar.value ? 'anotacao' : 'revisao'
)

const tempoJogoAtualMs = computed(() =>
  Math.round(calcularTempoJogoMs(tempoVideoMs.value, offsetMs.value))
)
const placarNoTempoAtual = computed(() =>
  calcularPlacarAteTempo(props.jogadas, tempoJogoAtualMs.value)
)
const tempoRestanteNoTempoAtual = computed(() =>
  formatarTempoRestantePlacar(props.jogo.timer.duracao, tempoJogoAtualMs.value)
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
// funcoes
async function iniciarAnotacaoVideo(
  jogadorId: string,
  equipe: LadoEquipe,
) {
  if (!youtubeId.value || !youtubePlayer.value) {
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

async function navegarParaTempoJogada(tempoMs: number) {
  if (!youtubeId.value || !youtubePlayer.value || !playerPronto.value) {
    toast.add({
      title: 'Player indisponível',
      description: 'Aguarde o vídeo carregar para navegar até a jogada.',
      color: 'warning',
    })
    return
  }

  await youtubePlayer.value.seekToMs(
    Math.max(0, tempoMs + offsetMs.value - 5000)
  )
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
      <div class="mb-2 flex items-center justify-center gap-4 rounded-lg border border-default bg-default px-4 py-2">
        <div class="flex items-center justify-center gap-4">
          <span class="text-sm font-medium text-primary">Esquerda</span>
          <span class="text-2xl font-bold tabular-nums text-highlighted">
            {{ placarNoTempoAtual.esquerda }}
            <span class="px-1 text-muted">×</span>
            {{ placarNoTempoAtual.direita }}
          </span>
          <span class="text-sm font-medium text-error">Direita</span>
          <span class="text-sm font-semibold tabular-nums text-muted">
            {{ tempoRestanteNoTempoAtual }}
          </span>
        </div>

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

    <section class="controles-video-zone">
      <ControlesVideo
        v-if="youtubeId"
        :velocidade-label="labelVelocidadeVideo"
        :velocidade-disabled="!playerPronto"
        @alternar-velocidade="alternarVelocidadeVideo"
      />
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
    <section class="lista-jogadas">
      <Timneline />
    </section>
    <section class="timeline">
      <ListaJogadasJogo @selecionar-tempo="navegarParaTempoJogada" />
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
    "equipe-esquerda controles equipe-direita";
}

.anotacao-layout-portrait {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "video video"
    "controles controles"
    "equipe-esquerda equipe-direita";
}

.video-zone {
  grid-area: video;
}

.controles-video-zone {
  grid-area: controles;
}

.equipe-esquerda-zone {
  grid-area: equipe-esquerda;
}

.equipe-direita-zone {
  grid-area: equipe-direita;
}
</style>
