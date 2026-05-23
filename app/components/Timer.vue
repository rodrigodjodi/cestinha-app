<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
const jogoStore = useJogoStore()
const { status, iniciadoEm, pausadoEm, jogo } = storeToRefs(jogoStore)
const emit = defineEmits<{
  close: []
}>()
/**
 * Config
 */
const duracao = ref(600) // todo: substiruir por global do grupo

/**
 * Estado
 */


const tempoPausadoTotal = ref(0)

const agora = ref<number | null>(null)

let interval: ReturnType<typeof setInterval> | null = null

/**
 * Tick visual
 */
function iniciarTicker() {
  if (interval) return

  interval = setInterval(() => {
    agora.value = Date.now()
    console.log('tick', tempoRestante.value)
  }, 1000)
}

function pararTicker() {
  if (!interval) return

  clearInterval(interval)
  interval = null
}

/**
 * Tempo decorrido real
 */
const tempoDecorrido = computed(() => {
  if (!iniciadoEm.value) return 0

  const referencia =
    status.value === '2.pausado'
      ? pausadoEm.value!
      : (agora.value ?? Date.now())

  return Math.floor(
    (referencia -
      iniciadoEm.value -
      tempoPausadoTotal.value) / 1000
  )
})

/**
 * Tempo restante
 */
const tempoRestante = computed(() => {
  return Math.max(duracao.value - tempoDecorrido.value,
    0
  )
})

/**
 * Display mm:ss
 */
const tempoFormatado = computed(() => {
  const minutos = Math.floor(tempoRestante.value / 60)
  const segundos = tempoRestante.value % 60

  return `${String(minutos).padStart(2, '0')}:${String(
    segundos
  ).padStart(2, '0')}`
})

/**
 * Iniciar
 */
async function iniciar() {
  await jogoStore.iniciar()

  iniciarTicker()
}

/**
 * Pausar
 */
async function pausar() {
  await jogoStore.pausar()
}

/**
 * Retomar
 */
function retomar() {
  if (!pausadoEm.value) return
  const now = Date.now()
  tempoPausadoTotal.value +=
    now - pausadoEm.value
  agora.value = now
  jogoStore.retomar()
}

function finalizar() {
  jogoStore.finalizar()
  pararTicker()
}

async function reiniciar() {
  await jogoStore.reiniciar()
  tempoPausadoTotal.value = 0

  agora.value = Date.now()

  pararTicker()
}
function novoJogo() {
  if (!jogo.value) return
  useNovoJogo(jogo.value!.diaId, jogo.value!.grupoId).then(({ jogoId }) => {
    console.log("novo jogo criado", jogoId)
    navigateTo(`/jogos/${jogoId}`)
  })
}
function handleTimerClick() {
  switch (status.value) {
    case '0.ocioso':
      iniciar()
      break

    case '1.rodando':
      pausar()
      break

    case '2.pausado':
      retomar()
      break
    case '3.finalizado':
      // abrir modal novo jogo
      showNewGameModal.value = true
      break
  }
}

/**
 * eventos de tempo aqui: aviso de 2 minutos, countdown 10s
 */
const stopWatch = watch(
  tempoRestante,
  value => {
    if (value > 0) return
    finalizar()
  }
)
onMounted(() => {
  if (status.value === '1.rodando') {
    iniciarTicker()
  }
})

onBeforeUnmount(() => {
  console.log('unmount timer, parando ticker e watch')
  jogoStore.limparStore()
  pararTicker()
  stopWatch()
})
const showNewGameModal = ref(false)
</script>

<template>
  <div class="h-full w-full flex flex-col">

    <!-- TIMER -->
    <button class="flex-1 flex items-center justify-center" @click="handleTimerClick">
      <span class="text-7xl font-bold tabular-nums">
        {{ tempoFormatado }}
      </span>
    </button>

    <!-- ACTIONS -->
    <div v-if="status === '2.pausado'" class="flex items-center justify-center gap-2 pb-3">
      <button class="border rounded px-3 py-1" @click="reiniciar">
        Reiniciar
      </button>

      <button class="border rounded px-3 py-1" @click="finalizar">
        Finalizar
      </button>
    </div>
    <UModal v-model:open="showNewGameModal">
      <template #content>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">Jogo finalizado, o que deseja fazer?</h2>
          <div class="flex justify-between mt-8">
            <UButton class="px-8 py-16" @click="showNewGameModal = false; emit('close')" size="xl" color="neutral">
              Fechar placar
            </UButton>
            <UButton class="px-8 py-4" @click="novoJogo" size="xl">
              Iniciar novo jogo
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>