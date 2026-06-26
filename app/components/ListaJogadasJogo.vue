<script setup lang="ts">
import type { Jogada } from '~/schemas/jogada.schema';
const jogoStore = useJogoStore()
const { jogadas, jogadoresMap } = storeToRefs(jogoStore)
function resolverJogadorNome(jogadorId: string) {
  return jogadoresMap.value.get(jogadorId)?.nome
}
function usarTemplateTexto(jogada: Jogada) {
  switch (jogada.tipo) {
    case '3PM':
    case `2PM`:
      return jogada.assistenciaId ?
        `Cesta de 3 de ${resolverJogadorNome(jogada.jogadorId)}
         com passe de ${resolverJogadorNome(jogada.assistenciaId)}`
        :
        `Cesta de 3 de ${resolverJogadorNome(jogada.jogadorId)}`
        default:
            break;
    }
}
</script>

<template>
  <div>
    <h1>Lista Jogadas</h1>
    <ul>
      <li v-for="jogada in jogadas" :key="jogada.id">
        {{ usarTemplateTexto(jogada) }}
      </li>
    </ul>
  </div>
</template>


<style scoped></style>