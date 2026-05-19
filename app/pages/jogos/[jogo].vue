<script setup lang="ts">
import { doc } from 'firebase/firestore'   
const db = useFirestore()
const route = useRoute()
const jogo = useDocument(doc(db, 'jogos', route.params.jogo as string))
const grupoId = computed(()=>jogo.value?.grupoId)
const diaId = computed(()=>jogo.value?.diaId)
const jogadores = useListaJogadores(grupoId)
const presencas = useListaPresencasDiaGrupo(diaId, grupoId)
const modalReferenciarVideo = ref(false)
</script>

<template>
<UButton v-if="!jogo?.videoId">Iniciar jogo</UButton>

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