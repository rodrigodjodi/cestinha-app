<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
const route = useRoute()
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
const jogadorLogado = computed(() => {
  return jogadores.value.find(el => el.usuarioId === user.value?.uid)
})
const tabItems = [
  { label: 'Presenças', slot: 'presencas' },
  { label: 'Escalação', slot: 'escalacao' },
  { label: 'Jogos', slot: 'jogos' },
  { label: 'Estatísticas', slot: 'estatisticas' },
]

</script>
<template>
  

  <UTabs :items="tabItems" class="mt-4 flex-1 min-h-0">
    <template #presencas>
      <BotaoConfirmacao
        v-if="dia"
        :diaId="diaId"
        :grupoId="grupoId"
        :presencas="presencas"
        :jogadorLogado="jogadorLogado"
        :diaStatus="dia.status"
      />
      <CardPresencas
        :jogadores="jogadores"
        :presencas="presencas"
        :jogadorLogado="jogadorLogado"
        :diaId="diaId"
        :grupoId="grupoId"
        :diaStatus="dia?.status ?? '2.concluido'"
      />
    </template>

    <template #escalacao>
      <CardTimesDia
        v-if="dia"
        :dia="dia"
        :diaId="diaId"
        :jogadores="jogadores"
        :presencas="presencas"
      />
    </template>

    <template #jogos>
      <CardJogos :diaId="diaId" :grupoId="grupoId" />
    </template>

    <template #estatisticas>
      <div />
    </template>
  </UTabs>
</template>
