<script setup lang="ts">
definePageMeta({ middleware: ['auth'], layout: 'default' })
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
const route = useRoute()
const jogoStore = useJogoStore()
const { jogo } = useJogo(route.params.jogo as string)
const jogoId = computed(() => jogo.value?.id)
const grupoId = computed(() => jogo.value?.grupoId)
const diaId = computed(() => jogo.value?.diaId)
const { dia } = useDia(diaId)
const { jogadores } = useListaJogadores(grupoId)
const { jogadas } = useListaJogadasJogo(jogoId)
const { isAdmin } = useJogadorLogado(grupoId)
watch(jogo, novoJogo => {
  if (novoJogo) {
    jogoStore.setJogo(novoJogo)
  }
}, { immediate: true })
watch(jogadores, value => {
  if (value) {
    jogoStore.setJogadores(value)
  }
}, { immediate: true })
watch(jogadas, value => {
  if (value) {
    jogoStore.setJogadas(value)
  }
}, { immediate: true })

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
      <CardEscalacao
        v-if="jogo && dia"
        :jogo="jogo"
        :dia="dia"
        :jogadores="jogadores"
      />
    </template>
    <template #live>
      <div class="h-[calc(100vh-var(--ui-header-height)-40px)] relative">
        <Scoreboard />
      </div>
    </template>
    <template #video>
      <div class="p-2">
        <FormYoutubeVideo
          v-if="jogo && !jogo.video.youtubeId && isAdmin"
          :jogo-id="jogo.id"
          :grupo-id="jogo.grupoId"
        />
        <AnotacaoVideo
          v-if="jogo"
          :jogo="jogo"
          :jogadores="jogadores"
          :jogadas="jogadas"
        />
      </div>
    </template>
    <template #stats>
      <div class="bg-green-300 min-h-[calc(100vh-var(--ui-header-height)-40px)] relative"></div>
    </template>
  </UTabs>
</template>
