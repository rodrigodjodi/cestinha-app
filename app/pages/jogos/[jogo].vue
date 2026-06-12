<script setup lang="ts">
import { initAudio } from "@/utils/beep"
definePageMeta({middleware: ['auth'], layout:'jogo'})
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
const route = useRoute()
const jogoStore = useJogoStore()
const {jogo} = useJogo(route.params.jogo as string)
const grupoId = computed(()=>jogo.value?.grupoId)
const diaId = computed(()=>jogo.value?.diaId)
const {jogadores} = useListaJogadores(grupoId)
const {presencas} = useListaPresencasDiaGrupo(diaId, grupoId)


watch(jogo, value => {
  if (!value) return
  jogoStore.populate(value)
}, { immediate: true })
console.log(presencas)
// SEO
useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
watchEffect(() => {
  pageTitle.value = jogo.value?.nome ?? 'Carregando...'
})
const tabItems = [
  {label: "Escalação", slot:'escalacao'},
  {label: "Ao Vivo", slot:'live'},
  {label: "Video", slot:'video'},
  {label: "Estatísticas", slot:'stats'},
]
</script>

<template>
  <h1 class="text-sm bg-accented text-center p-1">{{ pageTitle }}</h1>
  <UTabs :items="tabItems">
    <template #escalacao>
      <CardEscalacao :presencas="presencas" :jogadores="jogadores"
       :escalacao="jogo?.escalacao"/>
    </template>
    <template #live>
      <Scoreboard/>
    </template>
    <template #video>
      <div class="p-2">
        <FormYoutubeVideo v-if="!jogo?.videoId" :jogoId="jogo!.id"/>
        <iframe v-if="jogo?.videoId"
          class="aspect-video w-full"
          :src="`https://www.youtube.com/embed/${jogo.videoId}`"
          allowfullscreen
        />
      </div>
    </template>
  </UTabs>





</template>