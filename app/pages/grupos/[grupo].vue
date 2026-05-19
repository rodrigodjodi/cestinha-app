<script setup lang="ts">
import { doc, collection, where, query, limit } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import CardJogadores from '~/components/CardJogadores.vue'
import NovoJogo from '~/components/Dialogs/NovoJogo.vue'
import { grupoSchema, type Grupo } from '~/schemas/grupo.schema'
//composables
const db = useFirestore()
const route = useRoute()
const pageTitle = useState('pageTitle')
const user = useCurrentUser()
// estado
const q = computed(() => {
  if (!user.value) {
    return null
  }
  return query(collection(db, 'jogadores'),
    where('usuarioId', '==', user.value?.uid),
    where('grupoId', '==', route.params.grupo as string
    ), limit(1))
})
const jogadorLogado = useCollection(q)
console.log("jogador logado: ", jogadorLogado)
const grupoId = route.params.grupo as string
const docRefGrupo = computed(() => doc(db, 'grupos', grupoId))
const grupo = useDocument(docRefGrupo)
// SEO
useHead({ title: grupo.value?.nome }) // esse título para a aba do navegador: Titulo - Cestinha
pageTitle.value = grupo.value?.nome

</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>

    <!-- paniel Dias -->
    <CardDiasGrupo />


    <!-- card Jogoadores -->
    <CardJogadores :jogadorLogado="jogadorLogado[0]" />

    <p>Nesta página: </p>
    <ol>
      <li>painel jogos: lista de jogos, botão novo jogo</li>
      <li>painel jogadores: lista de jogadores, botão novo jogador</li>
    </ol>
    <pre>{{ grupo }}</pre>

  </div>
</template>

<style scoped>
h1 {
  view-transition-name: v-bind('`grupo-header-${route.params.grupo}`');
}
</style>