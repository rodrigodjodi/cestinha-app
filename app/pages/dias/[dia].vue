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

</script>
<template>
  <BotaoConfirmacao v-if="dia?.status === '0.inscrevendo'"  :diaId="diaId"
    :grupoId="grupoId" :presencas="presencas" :jogadorLogado="jogadorLogado"/>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
    <!-- CARD PRESENCAS -->
    <CardPresencas :jogadores="jogadores" :presencas="presencas" :jogadorLogado="jogadorLogado"
    :diaId="diaId" :grupoId="grupoId"/>
    <!-- CARD JOGOS  -->
    <CardJogos :diaId="diaId" :grupoId="grupoId" />
  </div>

</template>