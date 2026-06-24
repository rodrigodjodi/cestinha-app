<script setup lang="ts">
import YoutubePlayer from 'youtube-player'
import type { YoutubePlayerInstance } from 'youtube-player'

const props = defineProps<{
  youtubeId: string
}>()
const emit = defineEmits<{
  ready: []
  playbackRateChange: [rate: number]
}>()

const playerRef = useTemplateRef('player')
const player = shallowRef<YoutubePlayerInstance | null>(null)
const { tempoVideoMs } = useVideoAnotacao()
const playerPronto = ref(false)
const velocidadeAtual = ref(1)
const velocidadesDisponiveis = ref<number[]>([1])
let interval: number | undefined

function normalizarVelocidades(rates: number[]) {
  return [...new Set([1, ...rates])]
    .filter(rate => Number.isFinite(rate) && rate > 0)
    .sort((a, b) => a - b)
}

async function getTempoAtualMs() {
  if (!player.value) {
    throw new Error('Player do YouTube não está disponível')
  }

  const tempoAtualMs = Math.round(
    await player.value.getCurrentTime() * 1000
  )
  tempoVideoMs.value = tempoAtualMs
  return tempoAtualMs
}

async function pausar() {
  if (!player.value) {
    throw new Error('Player do YouTube não está disponível')
  }
  await player.value.pauseVideo()
}

async function seekToMs(tempoMs: number) {
  if (!player.value) {
    throw new Error('Player do YouTube não está disponível')
  }
  await player.value.seekTo(tempoMs / 1000, true)
  tempoVideoMs.value = tempoMs
}

function getPlaybackRate() {
  return velocidadeAtual.value
}

function getAvailablePlaybackRates() {
  return [...velocidadesDisponiveis.value]
}

function setPlaybackRate(rate: number) {
  if (!player.value || !playerPronto.value) return

  player.value.setPlaybackRate(rate).catch((error) => {
    console.error('NÃ£o foi possÃ­vel alterar a velocidade do vÃ­deo:', error)
  })
}

function togglePlaybackRate() {
  const maiorVelocidade = Math.max(...getAvailablePlaybackRates())
  const proximaVelocidade = velocidadeAtual.value === 1
    ? maiorVelocidade
    : 1

  setPlaybackRate(proximaVelocidade)
  return proximaVelocidade
}

defineExpose({
  getTempoAtualMs,
  pausar,
  seekToMs,
  getPlaybackRate,
  getAvailablePlaybackRates,
  setPlaybackRate,
  togglePlaybackRate,
  playerPronto,
  velocidadeAtual,
})

onMounted(() => {
  if (!playerRef.value) return

  player.value = YoutubePlayer(playerRef.value, {
    videoId: props.youtubeId,
    playerVars: {
      rel: 0,
    },
  })

  player.value.on('ready', async () => {
    if (!player.value) return

    playerPronto.value = true
    emit('ready')

    try {
      velocidadesDisponiveis.value = normalizarVelocidades(
        await player.value.getAvailablePlaybackRates()
      )
      velocidadeAtual.value = await player.value.getPlaybackRate()
      emit('playbackRateChange', velocidadeAtual.value)
    } catch (error) {
      console.error('NÃ£o foi possÃ­vel carregar velocidades do vÃ­deo:', error)
      velocidadesDisponiveis.value = [1]
      velocidadeAtual.value = 1
      emit('playbackRateChange', 1)
    }
  })

  player.value.on('playbackRateChange', (event) => {
    const rate = typeof event.data === 'number' ? event.data : 1
    velocidadeAtual.value = rate
    emit('playbackRateChange', rate)
  })

  interval = window.setInterval(async () => {
    if (!player.value) return
    tempoVideoMs.value = Math.round(
      await player.value.getCurrentTime() * 1000
    )
  }, 100)
})

onUnmounted(() => {
  if (interval !== undefined) {
    window.clearInterval(interval)
  }
})
</script>

<template>
  <div
    ref="player"
    class="h-full w-full overflow-hidden rounded-lg"
  />
</template>
