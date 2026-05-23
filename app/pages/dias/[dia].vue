<script setup lang="ts">
import { doc } from 'firebase/firestore'
import { z } from 'zod' 
import { baseJogoSchema, type BaseJogo } from '~/schemas/jogo.schema'
const db = useFirestore()
const route = useRoute()
const user = useCurrentUser()
const dia = useDocument(doc(db, 'dias', route.params.dia as string))
const diaId = computed(() => dia.value?.id)
const grupoId = computed(() => dia.value?.grupoId)
// console.log('diaId', diaId, 'grupoId', grupoId)
const presencas = useListaPresencasDiaGrupo(diaId, grupoId)
const jogadores = useListaJogadores(grupoId)
const jogadorLogado = computed(() => jogadores.value.find(el => el.usuarioId === user.value?.uid))
const confirmados = computed(() => presencas.value.filter(presenca => presenca.situacao === '0.confirmado'))
const emEspera = computed(() => presencas.value.filter(presenca => presenca.situacao === '1.espera'))
const jogosDiaGrupo = useListaJogosDiasGrupo(diaId, grupoId)
async function novoJogo() {
  const {jogoId} = await useNovoJogo(diaId, grupoId)
  await navigateTo(`/jogos/${jogoId}`)
}
console.log(presencas)
</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
    <!-- CARD PRESENCAS -->
    <UCard>
      <div class="flex flex-row mb-4">
        <h2 class="text-xl font-bold">{{ `Lista ${new Date(dia?.data).toLocaleDateString()}` }}</h2>
        <UBadge class="ml-auto" color="success" variant="soft">{{ confirmados.length }} Confirmados</UBadge>
        <UBadge class="ml-4" color="warning" variant="soft">{{ emEspera.length }} Espera</UBadge>
      </div>
      <BotaoConfirmacao :jogadorLogado="jogadorLogado" :diaId="diaId" :grupoId="grupoId" :presencas="presencas"/>
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
      <FormInscricaoJogador v-if="jogadorLogado?.atribuicao === 'admin'" 
        :dia-id="diaId" :grupo-id="grupoId" :jogadores="jogadores" :presencas="presencas"
      />
    </UCard>
    <!-- CARD JOGOS  -->
    <UCard>
      <div class="flex flex-row mb-4">
        <h2 class="text-xl font-bold">{{ `Jogos ${new Date(dia?.data).toLocaleDateString()}` }}</h2>
        <UBadge class="ml-auto" color="success" variant="soft">{{ jogosDiaGrupo.length }} Jogos</UBadge>
      </div>
      <ul>
        <li v-for="jogo in jogosDiaGrupo" :key="jogo.id">
          {{ jogo.nome }}
        </li>
      </ul>
      <UButton color="primary" @click="novoJogo">Adicionar jogo</UButton>
    </UCard>
  </div>




  <pre>{{ dia }}</pre>
  <pre>{{ presencas }}</pre>
  <pre>{{ jogadores }}</pre>
</template>