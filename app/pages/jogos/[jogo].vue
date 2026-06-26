<script setup lang="ts">
definePageMeta({ middleware: ['auth'], layout: 'default' })
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
const route = useRoute()
const router = useRouter()
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
type AbaJogo = 'video' | 'estatisticas' | 'escalacao' | 'ao-vivo'
const abasJogo: AbaJogo[] = ['video', 'estatisticas', 'escalacao', 'ao-vivo']
const tabItems = [
  { label: "Vídeo", slot: 'video', value: 'video' },
  { label: "Estatísticas", slot: 'stats', value: 'estatisticas' },
  { label: "Escalação", slot: 'escalacao', value: 'escalacao' },
  { label: "Ao vivo", slot: 'live', value: 'ao-vivo' },
]
const abaAtiva = ref<AbaJogo>('escalacao')
const defaultAbaCalculado = computed<AbaJogo | null>(() => {
  if (!jogo.value) return null
  if (jogo.value.video.youtubeId) return 'video'
  if (jogo.value.timer.status === 'ocioso') return 'escalacao'
  if (
    jogo.value.timer.status === 'rodando'
    || jogo.value.timer.status === 'pausado'
  ) {
    return 'ao-vivo'
  }
  return 'escalacao'
})

function validarAbaJogo(value: unknown): AbaJogo | null {
  return typeof value === 'string' && abasJogo.includes(value as AbaJogo)
    ? value as AbaJogo
    : null
}

const abaQuery = computed(() => validarAbaJogo(route.query.aba))
const abaResolvida = computed<AbaJogo>(() =>
  abaQuery.value ?? defaultAbaCalculado.value ?? abaAtiva.value
)

watch(abaResolvida, value => {
  if (abaAtiva.value !== value) {
    abaAtiva.value = value
  }
}, { immediate: true })

watch(abaAtiva, value => {
  if (!defaultAbaCalculado.value && !abaQuery.value) return
  if (route.query.aba === value) return

  router.replace({
    query: {
      ...route.query,
      aba: value,
    },
  })
})
onBeforeUnmount(() => { jogoStore.limparStore()})
</script>

<template>

  <UTabs v-model="abaAtiva" :items="tabItems" class="flex-1 min-h-0" >
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
