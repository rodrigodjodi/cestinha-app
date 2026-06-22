<script setup lang="ts">
import YoutubePlayer from 'youtube-player'
import type { YoutubePlayerInstance } from 'youtube-player'

const props = defineProps<{
  youtubeId: string
}>()

const playerRef = useTemplateRef('player')
const player = shallowRef<YoutubePlayerInstance | null>(null)
const { tempoVideoMs } = useVideoAnotacao()
let interval: number | undefined

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

defineExpose({
  getTempoAtualMs,
  pausar,
  seekToMs,
})

onMounted(() => {
  if (!playerRef.value) return

  player.value = YoutubePlayer(playerRef.value, {
    videoId: props.youtubeId,
    playerVars: {
      rel: 0,
    },
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
