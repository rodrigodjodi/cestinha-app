<script setup lang="ts">
import { VueDraggableNext, type DragEvent } from 'vue-draggable-next'
defineProps<{
  titulo: string
  color?: string
  jogadores: {
    id: string
    nome: string
    subtitulo?: string
  }[]
  selecionados: Set<string>
  banco: Set<string>
  colecao: 'A' | 'B' | 'banco'
}>()

defineEmits<{
  toggle: [id: string]
  mover: [origem: 'A' | 'B' | 'banco', destino: 'A' | 'B' | 'banco']
  add: [ev: DragEvent]
}>()
</script>

<template>
  <UCard class="h-full flex flex-col" :ui="{
    body: 'flex flex-col flex-1 p-1 sm:p-1',
    header: 'p-2'
  }">
    <template #header>
      <div class="flex items-center justify-between ">
        <h3 class="font-semibold">
          {{ titulo }}
        </h3>

        <UBadge :color="color" variant="soft">
          {{ jogadores.length }}
        </UBadge>
      </div>
    </template>

    <template #default>
      <vue-draggable-next :model-value="jogadores" group="jogadores" tag="div" :sort="false"
        class="relative flex flex-1 flex-wrap content-start gap-2 min-h-30"
         @add="$emit('add', $event)" item-key="id" :data-colecao="colecao">
        <ItemJogadorSelecao v-for="jogador in jogadores" :key="jogador.id" :jogador="jogador"
          :selected="selecionados.has(jogador.id)" @toggle="$emit('toggle', jogador.id)"
          :data-jogador-id="jogador.id"/>
          <!-- <div
    v-if="!jogadores.length"
    class="absolute inset-0 flex items-center justify-center text-sm text-muted pointer-events-none"
  >
    Nenhum jogador
  </div> -->
      </vue-draggable-next>
    </template>
    <template #footer>
      <div class="flex items-center justify-center gap-4">
        <UButton icon="i-lucide-arrow-up" square :disabled="!banco.size" @click="$emit('mover', 'banco', colecao)" />

        <UButton icon="i-lucide-arrow-up-down" square color="neutral" :disabled="false" @click="" />
        <UButton icon="i-lucide-arrow-down" square color="neutral" :disabled="!selecionados.size"
          @click="$emit('mover', colecao, 'banco')" />
      </div>
    </template>
  </UCard>
</template>

<style scoped>

</style>