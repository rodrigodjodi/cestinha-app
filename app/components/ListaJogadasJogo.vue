<script setup lang="ts">
import type { Jogada } from '~/schemas/jogada.schema';
import { formatarTempoRestantePlacar } from '~/utils/formatarTempoPlacar'
const emit = defineEmits<{
  selecionarTempo: [tempoMs: number]
}>()

const jogoStore = useJogoStore()
const user = useCurrentUser()
const toast = useToast()
const { jogo, jogadas, jogadoresMap } = storeToRefs(jogoStore)
const jogadaSelecionada = ref<Jogada | null>(null)
const modalAcoesAberto = ref(false)
const confirmandoExclusao = ref(false)
const excluindoJogada = ref(false)

const podeAnotar = computed(() =>
  Boolean(
    jogo.value?.anotadorId
    && jogo.value.anotadorId === user.value?.uid
  )
)
const jogadasOrdenadas = computed(() =>
  [...jogadas.value].sort((a, b) => b.tempoMs - a.tempoMs)
)

function resolverJogadorNome(jogadorId: string) {
  return jogadoresMap.value.get(jogadorId)?.nome ?? 'Jogador'
}

function usarTemplateTexto(jogada: Jogada) {
  switch (jogada.tipo) {
    case '3PM':
    case '2PM': {
      const pontos = jogada.tipo === '3PM' ? 3 : 2
      const textoBase = `Cesta de ${pontos} de ${resolverJogadorNome(jogada.jogadorId)}`

      return jogada.assistenciaId
        ? `${textoBase} com passe de ${resolverJogadorNome(jogada.assistenciaId)}`
        : textoBase
    }
    default:
      return `${jogada.tipo} de ${resolverJogadorNome(jogada.jogadorId)}`
  }
}

function selecionarJogada(jogada: Jogada) {
  emit('selecionarTempo', jogada.tempoMs)
  jogadaSelecionada.value = jogada

  if (podeAnotar.value) {
    modalAcoesAberto.value = true
  }
}

async function excluirJogadaSelecionada() {
  if (!jogadaSelecionada.value || excluindoJogada.value) return

  if (!confirmandoExclusao.value) {
    confirmandoExclusao.value = true
    return
  }

  excluindoJogada.value = true
  try {
    await jogoStore.excluirJogada(jogadaSelecionada.value.id)
    modalAcoesAberto.value = false
    toast.add({
      title: 'Jogada excluída',
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível excluir a jogada:', error)
    toast.add({
      title: 'Não foi possível excluir a jogada',
      color: 'error',
    })
  } finally {
    excluindoJogada.value = false
  }
}

function limparModalAcoes() {
  jogadaSelecionada.value = null
  confirmandoExclusao.value = false
  excluindoJogada.value = false
}

function textoJogada(jogada: Jogada) {
  return `${formatarTempoRestantePlacar(jogo.value?.timer.duracao ?? 0, jogada.tempoMs)} - ${usarTemplateTexto(jogada)}`
}
</script>

<template>
  <div>
    <h1>Lista Jogadas</h1>
    <ul class="divide-y divide-default">
      <li v-for="jogada in jogadasOrdenadas" :key="jogada.id">
        <button
          type="button"
          class="w-full px-2 py-4 text-left text-sm hover:bg-elevated"
          @click="selecionarJogada(jogada)"
        >
          {{ textoJogada(jogada) }}
        </button>
      </li>
    </ul>

    <UModal v-model:open="modalAcoesAberto" @after:leave="limparModalAcoes">
      <template #header>
        <h2 class="font-semibold">Ações da jogada</h2>
      </template>

      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-muted">
            {{ jogadaSelecionada ? textoJogada(jogadaSelecionada) : '' }}
          </p>

          <UButton
            block
            color="neutral"
            variant="soft"
            icon="i-lucide-clock"
          >
            Ajustar tempo
          </UButton>

          <UButton
            block
            color="error"
            icon="i-lucide-trash-2"
            :loading="excluindoJogada"
            @click="excluirJogadaSelecionada"
          >
            {{ confirmandoExclusao ? 'Confirma exclusão?' : 'Excluir jogada' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>


<style scoped></style>
