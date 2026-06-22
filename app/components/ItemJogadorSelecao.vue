<script setup lang="ts">
import type { Jogador } from '~/schemas/jogador.schema';
defineProps<{
  jogador: Jogador
  subtitulo?: string|undefined
  selected?: boolean
  disabled?: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <UButton
    
    variant="outline"
    color="neutral"
    class="justify-start"
    :disabled="disabled"
    :class="[
      selected && 'ring-2 ring-primary'
    ]"
    @click="$emit('toggle')"
  >
    <div class="flex  items-center gap-3">
      <UCheckbox :model-value="selected" hidden/>

      <UAvatar :alt="jogador.nome" />

      <div class="min-w-0 text-left">
        <p class="truncate font-medium">
          {{ jogador.nome }}
        </p>

        <p v-if="subtitulo !== ''" class="text-muted text-xs capitalize">
          {{ subtitulo}}
        </p>
      </div>
    </div>
  </UButton>
</template>
