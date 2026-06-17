<script setup lang="ts">
import { type Jogador } from '~/schemas/jogador.schema'
import { type Presenca } from '~/schemas/presenca.schema';
const props = defineProps<{
  jogadores: Jogador[]
  presencas: Presenca[]
  jogadorLogado: Jogador|undefined
  diaId: string
  grupoId: string | undefined
}>()

type ItemJogadorLista = {
  id: string
  nome: string
  situacao: string
}
const jogadoresMap = computed(() => {
  return new Map(
    props.jogadores.map(j => [j.id, j])
  )
})
// isso aqui basicamente é um join entre jogadores x presencas
const itensPresencaLista = computed<ItemJogadorLista[]>(() => {
  return props.presencas.flatMap(presenca => {
    const jogador = jogadoresMap.value.get(presenca.jogadorId)
    if (!jogador) return []
    return {
      id: jogador.id,
      nome: jogador.nome,
      situacao: presenca.situacao
    }
  })
})
const confirmados = computed(() => itensPresencaLista.value.filter(presenca => presenca.situacao === '0.confirmado'))
const emEspera = computed(() => itensPresencaLista.value.filter(presenca => presenca.situacao === '1.espera'))
</script>
<template>
  <UCard>
    <div class="flex flex-row mb-4">
      <h2 class="text-xl font-bold"> Lista</h2>
      <UBadge class="ml-auto" color="success" variant="soft">{{ confirmados?.length }} Confirmados</UBadge>
      <UBadge class="ml-4" color="warning" variant="soft">{{ emEspera?.length }} Espera</UBadge>
    </div>
    <!-- ADICIONAR JOGADOR À LISTA (SÓ ADMIN) -->
    <FormInscricaoJogador v-if="jogadorLogado?.atribuicao === 'admin'" :dia-id="diaId" :grupo-id="grupoId"
      :jogadores="jogadores" :presencas="presencas" />
    <!-- LISTAS -->
    <div>
      <label class="inline-flex gap-2 mt-2">
        <UIcon name="i-lucide-check" class="size-5  bg-success" />
        <span>Jogadores confirmados</span>
      </label>
      <ol class="list-decimal ps-6 mt-2 marker:text-muted">
        <li v-for="presenca in confirmados" :key="presenca.id" 
        class="py-1">{{ presenca.nome }}</li>
      </ol>
      <label class="inline-flex gap-2 mt-2">
        <UIcon name="i-lucide-hourglass" class="size-5  bg-warning" />
        <span>Jogadores em espera</span>
      </label>
      <ol class="list-decimal ps-6 mt-2 marker:text-muted">
        <li v-for="presenca in emEspera" :key="presenca.id" 
        class="py-1">{{ presenca.nome }}</li>
      </ol>
    </div>
  </UCard>
</template>
