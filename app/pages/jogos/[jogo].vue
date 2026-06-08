<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'   
import Scoreboard from '~/components/Scoreboard.vue'
import {type Jogo } from "@/schemas/jogo.schema"
import CardTimes from '~/components/CardTimes.vue'
import { initAudio } from "@/utils/beep"
const db = useFirestore()
const route = useRoute()
const jogoStore = useJogoStore()
const jogoRef = doc(db, 'jogos', route.params.jogo as string)
const jogo = useDocument<Jogo>(jogoRef)
const grupoId = computed(()=>jogo.value?.grupoId)
const diaId = computed(()=>jogo.value?.diaId)
const jogadores = useListaJogadores(grupoId)
const presencas = useListaPresencasDiaGrupo(diaId, grupoId)
const modalReferenciarVideo = ref(false)

const scoreboardOpen = ref(false)
const escalacoesOpen = ref(false)
watch(jogo, value => {
  if (!value) return
  jogoStore.populate(value)
}, {
  immediate: true
})
console.log(presencas)

</script>

<template>
<UModal v-model:open="escalacoesOpen" fullscreen >
    <UButton v-if="!jogo?.videoId" >Abrir escalacoes</UButton>
    <template #content>
        <CardTimes :presencas="presencas" :jogadores="jogadores" :escalacao="jogo?.escalacao"/>
    </template>
</UModal>
<UModal v-model:open="scoreboardOpen" fullscreen >
    <UButton v-if="!jogo?.videoId" @click="initAudio">Abrir placar</UButton>
    <template #content>
        <Scoreboard @close="scoreboardOpen = false"/>
    </template>
</UModal>

<UModal title="Referenciar video" v-model:open="modalReferenciarVideo">
    <UButton v-if="!jogo?.videoId">Anotar video...</UButton>
    <template #body>
        <FormYoutubeVideo @close="modalReferenciarVideo = false"/>
    </template>
</UModal>
<iframe v-if="jogo?.videoId"
  class="aspect-video w-full"
  :src="`https://www.youtube.com/embed/${jogo.videoId}`"
  allowfullscreen
/>

</template>