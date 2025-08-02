<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
//composables
const db = useFirestore()
const route = useRoute()
const pageTitle = useState('pageTitle')
// estado
const grupoId = route.params.grupo as string
const docRefGrupo = doc(db, 'grupos', grupoId)
const { data: grupo, promise: promiseGrupo, error } = useDocument(docRefGrupo)

promiseGrupo.value.then(() => {
  // SEO
  useHead({ title: grupo.value?.nome }) // esse título para a aba do navegador: Titulo - Cestinha
  pageTitle.value = grupo.value?.nome
})
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6"
      
    >{{ pageTitle }}</h1>
    <!-- <TheHeader /> -->
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