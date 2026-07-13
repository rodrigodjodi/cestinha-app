<script setup lang="ts">
import type { Jogada } from '~/schemas/jogada.schema'
import { formatarTempoRestantePlacar } from '~/utils/formatarTempoPlacar'

const emit = defineEmits<{
  selecionarTempo: [tempoMs: number]
}>()

const jogoStore = useJogoStore()
const user = useCurrentUser()
const toast = useToast()
const { jogo, jogadas, jogadores, jogadoresMap } = storeToRefs(jogoStore)
const jogadaSelecionada = ref<Jogada | null>(null)
const modalAcoesAberto = ref(false)
const modoModal = ref<'acoes' | 'ajustar-tempo' | 'aplicar-offset'>('acoes')
const confirmandoExclusao = ref(false)
const excluindoJogada = ref(false)
const tempoAjustadoMs = ref(0)
const salvandoTempo = ref(false)
const alterandoAnotador = ref(false)

const podeAnotar = computed(() =>
  Boolean(
    jogo.value?.anotadorId
    && jogo.value.anotadorId === user.value?.uid
  )
)
const nomeAnotador = computed(() => {
  const anotadorId = jogo.value?.anotadorId
  if (!anotadorId) return null

  return jogadores.value.find(jogador => jogador.usuarioId === anotadorId)?.nome
    ?? 'Anotador'
})
const jogadasOrdenadas = computed(() =>
  [...jogadas.value].sort((a, b) => b.tempoMs - a.tempoMs)
)
const duracaoMs = computed(() =>
  Math.max(0, (jogo.value?.timer.duracao ?? 0) * 1000)
)
const temMaisDeUmaJogada = computed(() => jogadas.value.length > 1)
const tempoAtualComOffsetMs = computed(() =>
  limitarTempoMs(
    (jogadaSelecionada.value?.tempoMs ?? 0)
    - (jogo.value?.video.offsetMs ?? 0)
  )
)
const deltaOffsetMs = computed(() =>
  tempoAtualComOffsetMs.value - (jogadaSelecionada.value?.tempoMs ?? 0)
)
const tituloModal = computed(() => {
  if (modoModal.value === 'ajustar-tempo') return 'Ajustar tempo'
  if (modoModal.value === 'aplicar-offset') return 'Aplicar offset'

  return 'Ações da jogada'
})

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

function limitarTempoMs(tempoMs: number) {
  if (duracaoMs.value <= 0) {
    return Math.max(0, tempoMs)
  }

  return Math.min(duracaoMs.value, Math.max(0, tempoMs))
}

function formatarTempoJogo(tempoMs: number) {
  return formatarTempoRestantePlacar(jogo.value?.timer.duracao ?? 0, tempoMs)
}

function formatarDeltaMs(deltaMs: number) {
  const sinal = deltaMs > 0 ? '+' : ''
  return `${sinal}${(deltaMs / 1000).toFixed(1)}s`
}

function abrirAjusteTempo() {
  if (!jogadaSelecionada.value) return

  confirmandoExclusao.value = false
  tempoAjustadoMs.value = jogadaSelecionada.value.tempoMs
  modoModal.value = 'ajustar-tempo'
}

function voltarParaAcoes() {
  modoModal.value = 'acoes'
  confirmandoExclusao.value = false
}

function ajustarTempo(deltaMs: number) {
  tempoAjustadoMs.value = limitarTempoMs(tempoAjustadoMs.value + deltaMs)
}

async function salvarTempoAjustado() {
  if (!jogadaSelecionada.value || salvandoTempo.value) return

  salvandoTempo.value = true
  try {
    await jogoStore.ajustarTempoJogada(jogadaSelecionada.value.id, {
      tempoMs: tempoAjustadoMs.value,
    })
    emit('selecionarTempo', tempoAjustadoMs.value)
    modalAcoesAberto.value = false
    toast.add({
      title: 'Tempo ajustado',
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível ajustar o tempo da jogada:', error)
    toast.add({
      title: 'Não foi possível ajustar o tempo',
      color: 'error',
    })
  } finally {
    salvandoTempo.value = false
  }
}

async function abrirUsoOffset() {
  if (!jogadaSelecionada.value) return

  confirmandoExclusao.value = false
  tempoAjustadoMs.value = tempoAtualComOffsetMs.value

  if (temMaisDeUmaJogada.value) {
    modoModal.value = 'aplicar-offset'
    return
  }

  await aplicarOffsetNaJogada()
}

async function aplicarOffsetNaJogada() {
  if (!jogadaSelecionada.value || salvandoTempo.value) return

  tempoAjustadoMs.value = tempoAtualComOffsetMs.value
  await salvarTempoAjustado()
}

async function aplicarOffsetEmTodas() {
  if (!jogadaSelecionada.value || salvandoTempo.value) return

  salvandoTempo.value = true
  try {
    await jogoStore.deslocarJogadas({
      deltaMs: deltaOffsetMs.value,
    })
    emit('selecionarTempo', tempoAtualComOffsetMs.value)
    modalAcoesAberto.value = false
    toast.add({
      title: 'Offset aplicado',
      description: `${jogadas.value.length} jogadas ajustadas em ${formatarDeltaMs(deltaOffsetMs.value)}.`,
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível aplicar o offset nas jogadas:', error)
    toast.add({
      title: 'Não foi possível aplicar o offset',
      color: 'error',
    })
  } finally {
    salvandoTempo.value = false
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

async function assumirAnotacao() {
  if (!user.value || alterandoAnotador.value) return

  alterandoAnotador.value = true
  try {
    await jogoStore.atribuirAnotacao(user.value.uid)
    toast.add({
      title: 'Anotação assumida',
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível assumir a anotação:', error)
    toast.add({
      title: 'Não foi possível assumir a anotação',
      color: 'error',
    })
  } finally {
    alterandoAnotador.value = false
  }
}

async function liberarAnotacao() {
  if (alterandoAnotador.value) return

  alterandoAnotador.value = true
  try {
    await jogoStore.atribuirAnotacao(undefined)
    toast.add({
      title: 'Anotação liberada',
      color: 'success',
    })
  } catch (error) {
    console.error('Não foi possível liberar a anotação:', error)
    toast.add({
      title: 'Não foi possível liberar a anotação',
      color: 'error',
    })
  } finally {
    alterandoAnotador.value = false
  }
}

function limparModalAcoes() {
  jogadaSelecionada.value = null
  modoModal.value = 'acoes'
  confirmandoExclusao.value = false
  excluindoJogada.value = false
  salvandoTempo.value = false
  tempoAjustadoMs.value = 0
}

function textoJogada(jogada: Jogada) {
  return `${formatarTempoJogo(jogada.tempoMs)} - ${usarTemplateTexto(jogada)}`
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2 border-b border-default px-2 py-3">
      <h1 class="text-base font-semibold text-highlighted">Lista Jogadas</h1>

      <div class="flex items-center gap-2 text-sm">
        <template v-if="jogo?.anotadorId">
          <span class="text-muted">
            Anotação: <span class="font-medium text-default">{{ nomeAnotador }}</span>
          </span>
          <UButton
            v-if="podeAnotar"
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Liberar anotação"
            :loading="alterandoAnotador"
            @click="liberarAnotacao"
          />
        </template>
        <UButton
          v-else
          size="xs"
          color="primary"
          variant="soft"
          :loading="alterandoAnotador"
          @click="assumirAnotacao"
        >
          Assumir anotação
        </UButton>
      </div>
    </div>

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
        <h2 class="font-semibold">{{ tituloModal }}</h2>
      </template>

      <template #body>
        <div v-if="modoModal === 'acoes'" class="space-y-3">
          <p class="text-sm text-muted">
            {{ jogadaSelecionada ? textoJogada(jogadaSelecionada) : '' }}
          </p>

          <UButton
            block
            color="neutral"
            variant="soft"
            icon="i-lucide-clock"
            @click="abrirAjusteTempo"
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

        <div v-else-if="modoModal === 'ajustar-tempo'" class="space-y-4">
          <div class="space-y-1">
            <p class="text-sm text-muted">
              {{ jogadaSelecionada ? usarTemplateTexto(jogadaSelecionada) : '' }}
            </p>
            <p class="text-2xl font-semibold tabular-nums text-highlighted">
              {{ formatarTempoJogo(tempoAjustadoMs) }}
            </p>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <UButton
              block
              color="neutral"
              variant="soft"
              @click="ajustarTempo(-5000)"
            >
              -5s
            </UButton>
            <UButton
              block
              color="neutral"
              variant="soft"
              @click="ajustarTempo(-1000)"
            >
              -1s
            </UButton>
            <UButton
              block
              color="neutral"
              variant="soft"
              @click="ajustarTempo(1000)"
            >
              +1s
            </UButton>
            <UButton
              block
              color="neutral"
              variant="soft"
              @click="ajustarTempo(5000)"
            >
              +5s
            </UButton>
          </div>

          <UButton
            block
            color="neutral"
            variant="outline"
            icon="i-lucide-timer"
            :loading="salvandoTempo"
            @click="abrirUsoOffset"
          >
            Usar offset
          </UButton>

          <div class="flex gap-2">
            <UButton
              block
              color="neutral"
              variant="ghost"
              :disabled="salvandoTempo"
              @click="voltarParaAcoes"
            >
              Cancelar
            </UButton>
            <UButton
              block
              color="primary"
              icon="i-lucide-save"
              :loading="salvandoTempo"
              @click="salvarTempoAjustado"
            >
              Salvar tempo
            </UButton>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="space-y-2">
            <p class="text-sm text-muted">
              O offset atual muda esta jogada em {{ formatarDeltaMs(deltaOffsetMs) }}.
            </p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-muted">Atual</p>
                <p class="font-semibold tabular-nums">
                  {{ formatarTempoJogo(jogadaSelecionada?.tempoMs ?? 0) }}
                </p>
              </div>
              <div>
                <p class="text-muted">Com offset</p>
                <p class="font-semibold tabular-nums">
                  {{ formatarTempoJogo(tempoAtualComOffsetMs) }}
                </p>
              </div>
            </div>
          </div>

          <UButton
            block
            color="neutral"
            variant="soft"
            icon="i-lucide-crosshair"
            :loading="salvandoTempo"
            @click="aplicarOffsetNaJogada"
          >
            Aplicar só nesta
          </UButton>

          <UButton
            block
            color="primary"
            icon="i-lucide-list-checks"
            :loading="salvandoTempo"
            @click="aplicarOffsetEmTodas"
          >
            Aplicar em todas
          </UButton>

          <UButton
            block
            color="neutral"
            variant="ghost"
            :disabled="salvandoTempo"
            @click="abrirAjusteTempo"
          >
            Voltar
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped></style>
