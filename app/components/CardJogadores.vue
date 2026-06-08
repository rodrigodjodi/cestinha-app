<script setup lang="ts">
import type { Jogador } from '~/schemas/jogador.schema';
const props = defineProps<{
  jogadorLogado: MaybeRefOrGetter<Jogador>
  jogadores: MaybeRefOrGetter<Jogador[]>
}>()
const modalJogador = ref(false)
const jogadoresOrdenados = computed(() => {
  // primeiro admins, depois membros, depois avulsos, alfabético dentro desses grupos
  return [...toValue(props.jogadores)].sort((a, b) => {
    const ordemA = a.atribuicao === 'admin' ? 0 : a.atribuicao === 'membro' ? 1 : 2;
    const ordemB = b.atribuicao === 'admin' ? 0 : b.atribuicao === 'membro' ? 1 : 2;
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }
    return a.nome.localeCompare(b.nome);
  })
})
const jogadorSelecionadoId  = ref<string | null>(null)
function openModalJogador(jogador: Jogador) {
  console.log('abrir modal jogador', jogador)
  jogadorSelecionadoId.value = jogador.id
  modalJogador.value = true
}
const jogadorSelecionado = computed(() => {
  if (!jogadorSelecionadoId.value) {
    return null
  }
  return toValue(props.jogadores).find(
    j => j.id === jogadorSelecionadoId.value
  ) ?? null
})
</script>

<template>
  <UCard class="w-full " :ui="{ body: 'sm:p-4 flex flex-wrap' }">
    <div class="flex flex-row mb-4 w-full">
        <h2 class="text font-bold"> Jogadores  </h2>
        <UBadge class="ml-auto" color="success" variant="soft">{{ jogadores.length }} Jogadores</UBadge>
      </div>
    <div class="flex flex-wrap gap-2">
      <ItemJogadorSelecao v-for="jogador in jogadoresOrdenados" :key="jogador.id" :jogador="jogador"
        @toggle="openModalJogador(jogador)" :data-jogador-id="jogador.id"
        :subtitulo="jogador.atribuicao"
      />
      
    </div>
    <template #footer>
      <FormNovoJogador v-if="props.jogadorLogado?.atribuicao !== 'avulso'"
        :jogador-logado="jogadorLogado" />
    </template>
  </UCard>
  <ModalEdicaoJogador :jogador="jogadorSelecionado" v-model:open="modalJogador" :jogadorLogado="props.jogadorLogado"/>
</template>