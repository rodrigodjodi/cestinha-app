<script setup lang="ts">
import type { Jogador } from '~/schemas/jogador.schema'

type EscolhaAnotacaoJogada = {
  tipo: '2PM' | '3PM'
  assistenciaId?: string
}

const props = defineProps<{
  jogadorId: string | null
  candidatosAssistencia: Jogador[]
  enviando?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirmar: [escolha: EscolhaAnotacaoJogada]
}>()

const open = defineModel<boolean>('open', { default: false })
const assistOpen = ref(false)
const tipoCesta = ref<'2PM' | '3PM' | null>(null)

function escolherTipo(tipo: '2PM' | '3PM') {
  tipoCesta.value = tipo
  assistOpen.value = true
}

function confirmar(assistenciaId?: string) {
  if (!tipoCesta.value || props.enviando) return

  emit('confirmar', {
    tipo: tipoCesta.value,
    ...(assistenciaId ? { assistenciaId } : {}),
  })
}

function limparEscolha() {
  tipoCesta.value = null
  assistOpen.value = false
  emit('close')
}
</script>

<template>
  <UModal v-model:open="open" class="w-xs" @after:leave="limparEscolha">
    <template #header>
      <h2>Anotação de jogada</h2>
    </template>

    <template #body>
      <div class="flex justify-center-safe gap-2">
        <UButton
          v-if="jogadorId"
          square
          :disabled="enviando"
          @click="escolherTipo('2PM')"
        >
          Cesta de 2
        </UButton>
        <UButton
          v-if="jogadorId"
          square
          :disabled="enviando"
          @click="escolherTipo('3PM')"
        >
          Cesta de 3
        </UButton>
      </div>

      <UCollapsible
        v-model:open="assistOpen"
        class="flex w-full flex-col gap-2 pt-2"
      >
        <template #content>
          <span class="mt-2 w-full text-center">Assistência:</span>
          <UButton
            class="mb-4 mt-1 w-full"
            :loading="enviando"
            @click="confirmar()"
          >
            Sem assistência
          </UButton>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="jogadorAssistente in candidatosAssistencia"
              :key="jogadorAssistente.id"
              class="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border border-default bg-default hover:bg-elevated disabled:opacity-50"
              :disabled="enviando"
              @click="confirmar(jogadorAssistente.id)"
            >
              <UAvatar
                :src="jogadorAssistente.fotoUrl"
                :alt="jogadorAssistente.nome"
              />
              <span class="line-clamp-2 text-center text-xs">
                {{ jogadorAssistente.nome }}
              </span>
            </button>
          </div>
        </template>
      </UCollapsible>
    </template>
  </UModal>
</template>
