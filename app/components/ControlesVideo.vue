<script setup lang="ts">
import type { Jogo } from '~/schemas/jogo.schema'

const props = defineProps<{
  jogo: Jogo
  velocidadeLabel?: string
  velocidadeDisabled?: boolean
}>()

const emit = defineEmits<{
  alternarVelocidade: []
  selecionarTempo: [tempoMs: number]
}>()

const { tempoVideoMs } = useVideoAnotacao()
const jogoStore = useJogoStore()
const { jogadas } = storeToRefs(jogoStore)
const { definirOffsetMs } = jogoStore
const offsetLoading = ref(false)

const offsetMs = computed(() => props.jogo.video.offsetMs ?? 0)
const offsetDefinido = computed(() => offsetMs.value !== 0)

const duracaoMs = computed(() =>
  Math.max(1, (props.jogo.timer.duracao ?? 0) * 1000)
)
const cestas = computed(() =>
  jogadas.value.filter(jogada => ['2PM', '3PM'].includes(jogada.tipo))
)
const cestasEsquerda = computed(() =>
  cestas.value.filter(jogada => jogada.equipe === 'esquerda')
)
const cestasDireita = computed(() =>
  cestas.value.filter(jogada => jogada.equipe === 'direita')
)
const progressoVideo = computed(() =>
  Math.min(
    100,
    Math.max(0, ((tempoVideoMs.value - offsetMs.value) / duracaoMs.value) * 100)
  )
)

function setOffset() {
  offsetLoading.value = true
  definirOffsetMs(Math.round(tempoVideoMs.value))
    .then()
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      offsetLoading.value = false
    })
}

function posicaoEvento(tempoMs: number) {
  return `${Math.min(100, Math.max(0, (tempoMs / duracaoMs.value) * 100))}%`
}

function selecionarTempo(event: MouseEvent) {
  const elemento = event.currentTarget
  if (!(elemento instanceof HTMLElement)) return

  const rect = elemento.getBoundingClientRect()
  const proporcao = Math.min(
    1,
    Math.max(0, (event.clientX - rect.left) / rect.width)
  )

  emit('selecionarTempo', Math.round(proporcao * duracaoMs.value))
}

defineShortcuts({
  i: () => {
    setOffset()
  },
})
</script>

<template>
  <div class="flex w-full items-stretch gap-2 rounded-lg border border-default bg-default p-2">
    <UTooltip arrow text="Definir inicio" :kbds="['i']">
      <UButton
        size="xl"
        class="min-h-16 min-w-16 justify-center"
        icon="i-lucide-timer"
        :color="offsetDefinido ? 'success' : 'error'"
        variant="outline"
        :loading="offsetLoading"
        @click="setOffset"
      />
    </UTooltip>

    <button
      type="button"
      class="timeline-track relative min-h-16 flex-1 overflow-hidden rounded-sm border border-default bg-default"
      aria-label="Navegar pela linha do tempo do jogo"
      @click="selecionarTempo"
    >
      <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted" />
      <span
        class="absolute bottom-0 top-0 w-0.5 bg-highlighted/60"
        :style="{ left: `${progressoVideo}%` }"
      />

      <span
        v-for="jogada in cestasEsquerda"
        :key="jogada.id"
        class="absolute top-0 h-[calc(50%-1px)] w-2 -translate-x-1/2 rounded-b-sm bg-primary"
        :class="jogada.tipo === '3PM' ? 'ring-1 ring-primary/40' : ''"
        :style="{ left: posicaoEvento(jogada.tempoMs) }"
      />

      <span
        v-for="jogada in cestasDireita"
        :key="jogada.id"
        class="absolute bottom-0 h-[calc(50%-1px)] w-2 -translate-x-1/2 rounded-t-sm bg-error"
        :class="jogada.tipo === '3PM' ? 'ring-1 ring-error/40' : ''"
        :style="{ left: posicaoEvento(jogada.tempoMs) }"
      />
    </button>

    <UTooltip arrow text="Alternar velocidade" :kbds="['V']">
      <UButton
        size="xl"
        class="min-h-16 min-w-16"
        color="neutral"
        variant="soft"
        :label="velocidadeLabel ?? '1x'"
        :disabled="velocidadeDisabled"
        @click="emit('alternarVelocidade')"
      />
    </UTooltip>
  </div>
</template>

<style scoped>
.timeline-track {
  background-image:
    repeating-linear-gradient(
      to right,
      transparent 0,
      transparent calc(10% - 1px),
      var(--ui-border) calc(10% - 1px),
      var(--ui-border) 10%
    );
}
</style>
