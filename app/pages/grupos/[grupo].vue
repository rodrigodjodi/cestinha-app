<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import CardJogadores from '~/components/CardJogadores.vue'
import NovoJogo from '~/components/Dialogs/NovoJogo.vue'
import { grupoSchema, type Grupo } from '~/schemas/grupo.schema'
//composables
const db = useFirestore()
const route = useRoute()
const pageTitle = useState('pageTitle')
// estado
const grupoId = route.params.grupo as string
const docRefGrupo = doc(db, 'grupos', grupoId)
const grupo = ref<Grupo>()
const { data: grupoRaw, promise: promiseGrupo, error } = useDocument(docRefGrupo)
promiseGrupo.value.then(() => {
  // parse with zod
  grupo.value = grupoSchema.parse(grupoRaw.value)
  // SEO
  useHead({ title: grupo.value?.nome }) // esse título para a aba do navegador: Titulo - Cestinha
  pageTitle.value = grupo.value?.nome
})
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>

    <!-- paniel Jogos -->
    <UCard class="w-full max-w-lg mb-4">
      <template #header>
        <div class="flex justify-between">
          <span class="text-lg font-semibold">Jogos do Grupo</span>
          <UButton>Novo Jogo</UButton>
      </div>
      </template>
      <p>Ainda não há jogos</p>
    </UCard>

    <!-- card Jogoadores -->
    <CardJogadores />

    <p>Nesta página: </p>
    <ol>
      <li>painel jogos: lista de jogos, botão novo jogo</li>
      <li>painel jogadores: lista de jogadores, botão novo jogador</li>
    </ol>
    <pre>{{ grupo }}</pre>
    
    <pre v-if="error">{{ error.message }}</pre>
  </div>
</template>

<style scoped>
h1 {
  view-transition-name: v-bind('`grupo-header-${route.params.grupo}`');
}
</style>