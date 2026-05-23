<script setup lang="ts">
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
}>()
</script>

<template>
  <UCard
    class="h-full flex flex-col"
    :ui="{
      body: 'flex flex-col flex-1 p-1 sm:p-1',
      header: 'p-2'
    }"
  >
    <template #header>
      <div class="flex items-center justify-between ">
        <h3 class="font-semibold">
          {{ titulo }}
        </h3>

        <UBadge
          :color="color"
          variant="soft"
        >
          {{ jogadores.length }}
        </UBadge>
      </div>
    </template>

    <template #default>
        <TransitionGroup
          name="jogadores"
          tag="div"
          class="flex flex-wrap gap-2"
        >
          <ItemJogadorSelecao
            v-for="jogador in jogadores"
            :key="jogador.id"
            :jogador="jogador"
            :selected="selecionados.has(jogador.id)"
            @toggle="$emit('toggle', jogador.id)"
          />
        </TransitionGroup>
        <div
          v-if="!jogadores.length"
          class="flex flex-1 items-center justify-center text-sm text-muted"
        >
          Nenhum jogador
        </div>
    </template>
    <template #footer>
        <div class="flex items-center justify-center gap-4">
            <UButton
            icon="i-lucide-arrow-up"
            square
            :disabled="!banco.size"
            @click="$emit('mover', 'banco', colecao)"
            />
    
            <UButton
            icon="i-lucide-arrow-up-down"
            square
            color="neutral"
            :disabled="false"
            @click=""
            />
            <UButton
            icon="i-lucide-arrow-down"
            square
            color="neutral"
            :disabled="!selecionados.size"
            @click="$emit('mover', colecao, 'banco')"
            />
        </div>
    </template>
  </UCard>
</template>

<style scoped>
.jogadores-move,
.jogadores-enter-active,
.jogadores-leave-active {
  transition: all 250ms ease;
}

.jogadores-enter-from,
.jogadores-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.jogadores-leave-active {
  position: absolute;
  width: 100%;
}
</style>