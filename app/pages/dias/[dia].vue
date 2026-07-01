<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
const route = useRoute()
const router = useRouter()
const user = useCurrentUser()
const diaId = route.params.dia as string
const { dia } = useDia(diaId)
const grupoId = computed(() => dia.value?.grupoId)
const { grupo } = useGrupo(grupoId)
const titulo = computed(() => {
  if(!dia.value?.data) return ''
  const dataObj = new Date(dia.value?.data + "T12:00:00Z");
  const formato = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long", 
    timeZone: "UTC"
  });
  const dataFormatada = formato.format(dataObj);
  return `${grupo.value?.nome} - ${dataFormatada}`
})
watchEffect(() => {
  pageTitle.value = titulo.value
})
// console.log('diaId', diaId, 'grupoId', grupoId)
const { presencas } = useListaPresencasDiaGrupo(diaId, grupoId)
const { jogadores } = useListaJogadores(grupoId)
const {
  jogos,
  pending: jogosPending,
  error: jogosError,
} = useListaJogosDiasGrupo(diaId, grupoId)
const jogadorLogado = computed(() => {
  return jogadores.value.find(el => el.usuarioId === user.value?.uid)
})
const podeEditarTimes = computed(() =>
  jogadorLogado.value?.atribuicao === 'admin'
)
const edicaoDiaBloqueada = computed(() =>
  jogosPending.value /* || jogos.value.length > 0 */
)
type AbaDia = 'jogos' | 'estatisticas' | 'presencas' | 'escalacao'
const abasDia: AbaDia[] = ['jogos', 'estatisticas', 'presencas', 'escalacao']
const tabItems = [
  { label: 'Jogos', slot: 'jogos', value: 'jogos' },
  { label: 'Estatísticas', slot: 'estatisticas', value: 'estatisticas' },
  { label: 'Presenças', slot: 'presencas', value: 'presencas' },
  { label: 'Escalação', slot: 'escalacao', value: 'escalacao' },
]
const abaAtiva = ref<AbaDia>('jogos')
const defaultAbaCalculado = computed<AbaDia | null>(() => {
  if (!grupoId.value) return null
  if (jogosPending.value) return null
  return jogos.value.length > 0 ? 'jogos' : 'presencas'
})

function validarAbaDia(value: unknown): AbaDia | null {
  return typeof value === 'string' && abasDia.includes(value as AbaDia)
    ? value as AbaDia
    : null
}

const abaQuery = computed(() => validarAbaDia(route.query.aba))
const abaResolvida = computed<AbaDia>(() =>
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

</script>
<template>
  

  <UTabs v-model="abaAtiva" :items="tabItems" class="mt-4 flex-1 min-h-0">
    <template #presencas>
      <BotaoConfirmacao
        v-if="dia"
        :diaId="diaId"
        :grupoId="grupoId"
        :presencas="presencas"
        :jogadorLogado="jogadorLogado"
        :edicao-bloqueada="edicaoDiaBloqueada"
      />
      <CardPresencas
        :jogadores="jogadores"
        :presencas="presencas"
        :jogadorLogado="jogadorLogado"
        :diaId="diaId"
        :grupoId="grupoId"
        :edicao-bloqueada="edicaoDiaBloqueada"
      />
    </template>

    <template #escalacao>
      <CardTimesDia
        v-if="dia"
        :dia="dia"
        :diaId="diaId"
        :jogadores="jogadores"
        :presencas="presencas"
        :podeEditar="podeEditarTimes"
        :edicao-bloqueada="edicaoDiaBloqueada"
      />
    </template>

    <template #jogos>
      <CardJogos
        :diaId="diaId"
        :grupoId="grupoId"
        :jogos="jogos"
        :pending="jogosPending"
        :error="jogosError"
      />
    </template>

    <template #estatisticas>
      <div />
    </template>
  </UTabs>
</template>
