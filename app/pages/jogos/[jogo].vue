<script setup lang="ts">
import { initAudio } from "@/utils/beep"
definePageMeta({ middleware: ['auth'], layout: 'default' })
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
const route = useRoute()
const jogoStore = useJogoStore()
const { jogo } = useJogo(route.params.jogo as string)
const grupoId = computed(() => jogo.value?.grupoId)
const diaId = computed(() => jogo.value?.diaId)
const { jogadores } = useListaJogadores(grupoId)
const { presencas } = useListaPresencasDiaGrupo(diaId, grupoId)
const user = useCurrentUser()

watch(jogo, novoJogo => { jogoStore.setJogo(novoJogo)}, { immediate: true })
watch(jogadores, value => { jogoStore.setJogadores(value) }, { immediate: true })
watch(presencas, value => { jogoStore.setPresencas(value) }, { immediate: true })

// SEO
useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
watchEffect(() => {
  pageTitle.value = jogo.value?.nome ?? 'Carregando...'
})
const tabItems = [
  { label: "Escalação", slot: 'escalacao' },
  { label: "Ao Vivo", slot: 'live',  },
  { label: "Video", slot: 'video' },
  { label: "Estatísticas", slot: 'stats' },
]
onBeforeUnmount(() => { jogoStore.limparStore()})
</script>

<template>

  <UTabs :items="tabItems" class="flex-1 min-h-0" >
    <template #escalacao>
      <CardEscalacao />
    </template>
    <template #live>
      <div class="h-[calc(100vh-var(--ui-header-height)-40px)] relative">
        <Scoreboard />
      </div>
    </template>
    <template #video>
      <div class="p-2">
        <FormYoutubeVideo v-if="!jogo?.videoId" :jogoId="jogo!.id" />
        <AnotacaoVideo v-else/>
      </div>
    </template>
    <template #stats>
      <div class="bg-green-300 min-h-[calc(100vh-var(--ui-header-height)-40px)] relative"></div>
    </template>
  </UTabs>
</template>