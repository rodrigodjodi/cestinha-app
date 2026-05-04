<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { collection, query, where, addDoc, doc, setDoc, getDocs } from 'firebase/firestore'
// middleware
definePageMeta({
  middleware: ['auth']
})

// composables
const user = useCurrentUser()
const db = useFirestore()
const pageTitle = useState('pageTitle')
pageTitle.value = 'Painel de ' + user.value?.displayName
const mostrarModalCriarGrupo = ref(false)

useHead({title: 'Painel do usuário'}) // esse título para a aba do navegador: Meus Grupos - Cestinha
// estado
const grupos = ref<any[]>([])
const jogadores = ref<any[]>([])
const carregando = ref(true)
async function buscaJogadoresDoUsuario() {
  const jogadoresCollRef = collection(db, 'jogadores')
  const q = query(jogadoresCollRef, where('usuarioId', '==', user.value.uid))
  const jogadoresSnapshot = await getDocs(q)
  console.log('Jogadores encontrados:', jogadoresSnapshot.docs)
  return jogadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
async function buscaGruposDosJogadores(jogadores: any[]) {
  console.log('Buscando grupos para os jogadores:', jogadores)
  if (jogadores.length === 0) return []
  const gruposRef = collection(db, 'grupos')
  const gruposPromises = jogadores.map(jogador => {
    const q = query(gruposRef, where('jogadores', 'array-contains', jogador.id))
    return getDocs(q)
  })
  const gruposSnapshots = await Promise.all(gruposPromises)
  console.log('Grupos encontrados:', gruposSnapshots)
  let docs = []
  gruposSnapshots.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      docs.push({ id: doc.id, ...doc.data() })
    })
  })
  return docs
}
watch(user, async (newUser) => {
  if (!newUser) return
  carregando.value = true
  console.log(user)
  try {
    jogadores.value = await buscaJogadoresDoUsuario()
    grupos.value = await buscaGruposDosJogadores(jogadores.value)
  } catch (error) {
    console.error('Erro ao carregar usuarios ou grupos:', error)
  } finally {
    carregando.value = false    
  }
}, { immediate: true })
const NovoGrupo = defineAsyncComponent(() => import('@/components/Dialogs/Novogrupo.vue'))
</script>

<template>
  <UContainer class="py-8 max-w-4xl mx-auto">
    
    
    <p>Perfil</p>
    <p>Grupos</p>
    <p>Jogos</p>
    <p>Estatísticas</p>
    <!-- <div  class="text-center">
      <UModal title="Novo grupo">
        <UButton @click="mostrarModalCriarGrupo = true">Criar novo grupo</UButton>
        <template #body>
            <NovoGrupo  />
        </template>
      </UModal>
        
    </div>

    <div v-if="grupos && grupos.length > 0" class="grid md:grid-cols-2 gap-4">
      <UCard
        v-for="grupo in grupos"
        :key="grupo.id"
        class="cursor-pointer hover:shadow-lg transition"
        
        @click="navigateTo(`/grupos/${grupo.id}`)"
      >
        <template #header>
          <h2 class="text-lg font-bold" :style="{ 'view-transition-name': `grupo-header-${grupo.id}` }"
          >{{ grupo.nome }}</h2>
        </template>
        <div class="text-sm text-gray-600">
          <p><strong>Local:</strong> {{ grupo.local.nome }}</p>
          <p><strong>Jogadores:</strong> {{ grupo.jogadores.length }}</p>
        </div>
      </UCard>
    </div>
    <p v-else class="text-gray-500 mb-4">Você ainda não participa de nenhum grupo.</p> -->

  </UContainer>
</template>
