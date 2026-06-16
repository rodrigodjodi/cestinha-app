<script setup lang="ts">
definePageMeta({middleware: ['auth']})
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
  useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
  const route = useRoute()
  const user = useCurrentUser()
  const diaId = route.params.dia as string
  const {dia} = useDia(diaId)
  watchEffect(() => {
    pageTitle.value = dia.value?.data ?? 'Carregando...'
  })
const grupoId = computed(() => dia.value?.grupoId)
// console.log('diaId', diaId, 'grupoId', grupoId)
const {presencas} = useListaPresencasDiaGrupo(diaId, grupoId)
const {jogadores} = useListaJogadores(grupoId)
const jogadorLogado = computed(() => jogadores.value.find(el => el.usuarioId === user.value?.uid))
const confirmados = computed(() => presencas.value.filter(presenca => presenca.situacao === '0.confirmado'))
const emEspera = computed(() => presencas.value.filter(presenca => presenca.situacao === '1.espera'))
const jogosDiaGrupo = useListaJogosDiasGrupo(diaId, grupoId)
const anotadorModel = ref(true)
const anotadorJogo = computed(()=>anotadorModel ? user.value!.uid : null)
async function novoJogo() {
  const {jogoId} = await useNovoJogo(diaId, grupoId, anotadorJogo.value)
  await navigateTo(`/jogos/${jogoId}`)
}

</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
    <!-- CARD PRESENCAS -->
    <UCard>
      <div class="flex flex-row mb-4">
        <h2 class="text-xl font-bold"> Lista</h2>
        <UBadge class="ml-auto" color="success" variant="soft">{{ confirmados?.length }} Confirmados</UBadge>
        <UBadge class="ml-4" color="warning" variant="soft">{{ emEspera?.length }} Espera</UBadge>
      </div>
      <BotaoConfirmacao :jogadorLogado="jogadorLogado" :diaId="diaId" :grupoId="grupoId" :presencas="presencas"/>
      <FormInscricaoJogador v-if="jogadorLogado?.atribuicao === 'admin'" 
        :dia-id="diaId" :grupo-id="grupoId" :jogadores="jogadores" :presencas="presencas"
      />
      <!-- LISTAS -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Jogadores confirmados</label>
        <ol>
          <li v-for="presenca in confirmados" :key="presenca.id">{{ presenca.jogadorId }}</li>
        </ol>
        <label class="block text-sm font-medium text-gray-700">Jogadores em espera</label>
        <ul>
          <li v-for="presenca in emEspera" :key="presenca.id">{{ presenca.jogadorId }}</li>
        </ul>
      </div>

      <!-- ADICIONAR JOGADOR À LISTA (SÓ ADMIN) -->
    </UCard>
    <!-- CARD JOGOS  -->
    <UCard>
      <div class="flex flex-row mb-4">
        <h2 class="text-xl font-bold"> Jogos  </h2>
        <UBadge class="ml-auto" color="success" variant="soft">{{ jogosDiaGrupo.length }} Jogos</UBadge>
      </div>
      <div class="flex flex-col">
        <nuxt-link v-for="jogo in jogosDiaGrupo" :key="jogo.id" :to="`/jogos/${jogo.id}`"
         class="p-2 border rounded mb-2 hover:bg-accented">
          {{ jogo.nome }}
        </nuxt-link>
      </div>
      <div class="flex gap-3 items-center">
        <UButton color="primary" @click="novoJogo">Adicionar jogo</UButton>
        <UCheckbox v-model="anotadorModel" label="Assumir anotação" />
      </div>
    </UCard>
  </div>




  <pre>{{ dia }}</pre>
  <pre>{{ presencas }}</pre>
  <pre>{{ jogadores }}</pre>
</template>