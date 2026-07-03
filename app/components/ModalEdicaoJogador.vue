<script setup lang="ts">
import { alterarAtribuicaoJogador } from '@/services/jogador.service'
import {
  atribuicaoJogadorSchema,
  type Jogador,
} from '~/schemas/jogador.schema'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  jogador: Jogador | null
  jogadorLogado: Jogador | null
}>()

async function handleAlterarAtribuicao(valor: string) {
  if (!props.jogador || !props.jogadorLogado) return

  const validacao = atribuicaoJogadorSchema.safeParse(valor)
  if (!validacao.success) return

  await alterarAtribuicaoJogador(props.jogador.id, validacao.data)
}

const items = computed(() => [
  { label: "Admin", value: "admin", disabled: false },
  { label: "Membro", value: "membro", disabled: false },
  { label: "Avulso", value: "avulso", disabled: false },
])
</script>

<template>
  <UModal v-model:open="open" class="w-xs">
    <template #header>
      <UAvatar :alt="jogador?.nome" :src="jogador?.fotoUrl" size="lg" />
      <h2>{{ jogador?.nome }}</h2>
    </template>
    
    <template #footer>
      <URadioGroup class="mt-2" :modelValue="jogador?.atribuicao" orientation="horizontal" variant="list" :items="items"
        :disabled="jogadorLogado?.atribuicao !== 'admin'"
        @update:modelValue="handleAlterarAtribuicao" />
        
    </template>
  </UModal>
</template>
