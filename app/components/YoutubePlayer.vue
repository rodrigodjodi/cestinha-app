<script setup lang="ts">
import YoutubePlayer from 'youtube-player'
const props = defineProps<{
  videoId: string
}>()
const playerRef = useTemplateRef('player')
const player = shallowRef<any>(null)
  
  const tempoVideo = useState('tempo-video')
  let interval:number
onMounted(async ()=>{
  if(!playerRef) return
  player.value = YoutubePlayer(playerRef.value, {
    videoId: props.videoId,
    playerVars: {
        rel: 0,
      },
  })
  interval = window.setInterval(async () => {
    tempoVideo.value =
      await player.value.getCurrentTime() * 1000
  }, 100)
})
onUnmounted(() => {
  clearInterval(interval)
})
</script>
<template>
    <div ref="player"
    class="h-full w-full rounded-lg overflow-hidden">
    </div>
</template>


<style scoped></style>