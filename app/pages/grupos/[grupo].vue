<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import NovoJogo from '~/components/Dialogs/NovoJogo.vue'
import NovoJogador from '~/components/Dialogs/NovoJogador.vue'
//composables
const db = useFirestore()
const route = useRoute()
const pageTitle = useState('pageTitle')
// estado
const grupoId = route.params.grupo as string
const docRefGrupo = doc(db, 'grupos', grupoId)
const { data: grupo, promise: promiseGrupo, error } = useDocument(docRefGrupo)
const novoJogoModal = ref(false)
promiseGrupo.value.then(() => {
  // SEO
  useHead({ title: grupo.value?.nome }) // esse título para a aba do navegador: Titulo - Cestinha
  pageTitle.value = grupo.value?.nome
})
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
    <UserMenu />
    <!-- paniel Jogos -->
    <UCard class="w-full max-w-lg">
      <template #header>
        <span class="text-lg font-semibold">Jogos</span>
        <NovoJogo />
      </template>
    </UCard>
    
    <!-- paniel Jogoadores -->
    <UCard class="w-full max-w-lg">
      <template #header>
        <span class="text-lg font-semibold">Jogadores</span>
        <NovoJogador />
      </template>
    </UCard>
    
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