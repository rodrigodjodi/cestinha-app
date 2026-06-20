<script setup lang="ts">
import { anotaJogada } from '~/firebase/jogada.service';
import type { Jogador } from '~/schemas/jogador.schema';
const props = defineProps<{
  jogadorId: string | null
}>()
defineEmits(['close'])
const open = defineModel<boolean>('open', { default: false })
const { timeA, timeB, jogo } = useJogoStore()
const assistOpen = ref(false)
const opcoesAssistencia = ref<Jogador[]>([])
const tipoCesta = ref<'2PM'| '3PM'|null>(null)
/** Abre anotação de assistencia, gravando o tipo de cesta */
function anotaCesta(tipo:'2PM'| '3PM') {
  // acha o time na escalação
  const times = { timeA, timeB }
  const time = times[`time${jogo?.escalacao?.[props.jogadorId!]?.time}` as 'timeA' | 'timeB']
  opcoesAssistencia.value = time.filter(jogador => jogador.id !== props.jogadorId)
  tipoCesta.value = tipo
  assistOpen.value = true
}
</script>

<template>
  <UModal v-model:open="open" class="w-xs" @after:leave="$emit('close')">
    <template #header>
      <h2>Anotação jogada</h2>
    </template>
    <template #body>
      <div class="flex justify-center-safe gap-2">
        <UButton v-if="jogadorId" @click="anotaCesta('2PM')" square>
          Cesta de 2
        </UButton>
        <UButton v-if="jogadorId" @click="anotaCesta('3PM')" square>
          Cesta de 3
        </UButton>
      </div>
      <UCollapsible v-model:open="assistOpen" class="flex flex-col gap-2 w-full pt-2">


        <template #content>
          <span class="w-full text-center mt-2">Assistência:</span>
          <UButton class="w-full mb-4 mt-1" @click="anotaJogada(tipoCesta!, jogadorId!)">Sem assitência</UButton>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="jogadorAssistente in opcoesAssistencia" :key="jogadorAssistente.id"
              class="aspect-square w-full flex flex-col items-center justify-center gap-2
              rounded-lg border border-default bg-default hover:bg-elevated"
              @click="anotaJogada(tipoCesta!, jogadorId!, jogadorAssistente.id)">
              <UAvatar :src="jogadorAssistente.fotoUrl" :alt="jogadorAssistente.nome" />
              <span class="text-xs text-center line-clamp-2">
                {{ jogadorAssistente.nome }}
              </span>
            </button>
          </div>
        </template>
      </UCollapsible>
    </template>

  </UModal>
</template>
