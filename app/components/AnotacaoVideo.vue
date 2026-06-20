<script setup lang="ts">
import { useScreenOrientation } from '@vueuse/core'
import { type Jogo } from '~/schemas/jogo.schema';
import YoutubePlayer from './YoutubePlayer.vue';
const orientation = useScreenOrientation()
const jogoStore = useJogoStore()
const anotacaoState = useVideoAnotacao()
const modealAnotacao = ref(false)
const isLandscape = computed(() => {
  return orientation.orientation.value?.includes('landscape')
})
const { jogo, timeA, timeB } = storeToRefs(jogoStore)
const jogadorSelecionadoId = ref<string|null>(null)
function anotaJogada(jogadorId:string){    
  if(!jogadorId) return
  jogadorSelecionadoId.value = jogadorId
  modealAnotacao.value = true
}
function closeModalAnotacao(){
  console.log(`closeModalAnotacao`)
  jogadorSelecionadoId.value = null
}

</script>
<template>
  <div
    class="anotacao-layout"
    :class="{
      'anotacao-layout-landscape': isLandscape,
      'anotacao-layout-portrait': !isLandscape
    }"
  >
    <section class="video-zone">
      <div class="aspect-video max-h-[75vh]">
        <YoutubePlayer :videoId="jogo!.videoId!" />
        </div>
    </section>

    <section class="timeline-zone">
      <Timeline />
    </section>

    <section class="jogadores-a-zone flex flex-col gap-2">
      <ItemJogadorSelecao v-for="jogador in timeA" :key="jogador.id"
      :jogador="jogador" @toggle="anotaJogada(jogador.id)"
      :selected="jogador.id === jogadorSelecionadoId"
      />
    </section>

    <section class="jogadores-b-zone flex flex-col gap-2">
      <ItemJogadorSelecao v-for="jogador in timeB" :key="jogador.id" 
      :jogador="jogador" @toggle="anotaJogada(jogador.id)"/>
    </section>
  </div>
  <ModalAnotacaoJogada v-model:open="modealAnotacao" 
  :jogadorId="jogadorSelecionadoId" @close="closeModalAnotacao"/>
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
    "jogadores-a video jogadores-b"
    "jogadores-a timeline jogadores-b";
}

.anotacao-layout-portrait {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;

  grid-template-areas:
    "video video"
    "timeline timeline"
    "jogadores-a jogadores-b";
}

.video-zone {
  grid-area: video;
}

.timeline-zone {
  grid-area: timeline;
}

.jogadores-a-zone {
  grid-area: jogadores-a;
}

.jogadores-b-zone {
  grid-area: jogadores-b;
}
</style>
