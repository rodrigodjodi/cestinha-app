<script setup lang="ts">
defineProps<{
  jogador: {
    id: string
    nome: string
  }
  subtitulo?: string
  selected?: boolean
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

        <p class="text-muted text-xs capitalize">
          {{ subtitulo || 'Jogador' }}
        </p>
      </div>
    </div>
  </UButton>
</template>