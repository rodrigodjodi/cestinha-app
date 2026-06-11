<script setup lang="ts">
import { alterarAtribuicao } from '@/firebase/jogador.service';
import type { Jogador } from '~/schemas/jogador.schema';
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  jogador: Jogador | null
  jogadorLogado: Jogador | null
}>()
const items = computed(() => [
  { label: "Admin", value: "admin", disabled: false },
  { label: "Membro", value: "membro", disabled: false },
  { label: "Avulso", value: "avulso", disabled: false },
])
console.log('[modalEdicaoJogador] jogador recebido:', props.jogador)
</script>

<template>
  <UModal v-model:open="open" class="w-xs">
    <template #header>
      <UAvatar :alt="jogador?.nome" :src="jogador?.fotoUrl" size="lg" />
      <h2>{{ jogador?.nome }}</h2>
    </template>
    <template #body>
      <UButton>Upload de foto</UButton>
    </template>
    <template #footer>
      <URadioGroup class="mt-2" :modelValue="jogador?.atribuicao" orientation="horizontal" variant="list" :items="items"
        @update:modelValue="alterarAtribuicao(jogador, $event, jogadorLogado)" />
        
    </template>
  </UModal>
</template>
