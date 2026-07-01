<script setup lang="ts">
import { beep, multiBeep } from "@/utils/beep"
import { formatarSegundosPlacar } from "@/utils/formatarTempoPlacar"
import { useWakeLock } from '@vueuse/core'
const {request, release} = useWakeLock()
const jogoStore = useJogoStore()
const { status, iniciadoEm, pausadoEm, finalizadoEm, duracao, tempoPausadoTotalMs, jogo } = storeToRefs(jogoStore)
const props = withDefaults(defineProps<{
  size?: 'compact' | 'large'
}>(), {
  size: 'large',
})
const emit = defineEmits<{
  close: []
}>()
const agora = ref<number | null>(null)
let interval: ReturnType<typeof setInterval> | null = null
/**
 * Tick visual
 */
function iniciarTicker() {
  if (interval) return
  interval = setInterval(() => {
    agora.value = Date.now()
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
  let referencia: number
  switch (status.value) {
    case 'pausado':
      referencia = pausadoEm.value!
      break

    case 'finalizado':
      referencia = finalizadoEm.value!
      break
    default:
      referencia = agora.value ?? Date.now()
  }

  return Math.floor(
    (referencia -
      iniciadoEm.value -
      tempoPausadoTotalMs.value!) / 1000
  )
})

/**
 * Tempo restante
 */
const tempoRestante = computed(() => {
  return Math.max(duracao.value! - tempoDecorrido.value,
    0
  )
})

/**
 * Display mm:ss
 */
const tempoFormatado = computed(() => {
  return formatarSegundosPlacar(tempoRestante.value)
})

/**
 * Iniciar
 */
async function iniciar() {
  await jogoStore.iniciar()
  request("screen")
  iniciarTicker()
  beep({
    frequency: 980,
    duration: 300,
    type: 'sine', volume:1
  })
}

/**
 * Pausar
 */
async function pausar() {
  await jogoStore.pausar()
  beep({
    frequency: 980,
    duration: 150,
    type: 'sine', volume:1
  })
}

/**
 * Retomar
 */
function retomar() {
  if (!pausadoEm.value) return
  const now = Date.now()
  const tempoPausaAtual = now - pausadoEm.value
  
  jogoStore.retomar(tempoPausaAtual)?.then(() => {
    iniciarTicker()
    beep({
    frequency: 980,
    duration: 150,
    type: 'sine', volume:1
  })
  })
}

function finalizar() {
  jogoStore.finalizar()?.then(() => {
    release()
    pararTicker()
    multiBeep({
      frequency: 1200,
      duration: 100,
      volume: 1,
      type: 'sawtooth',
      count: 20,
      interval: 120
    })
  })
}

async function reiniciar() {
  jogoStore.reiniciar()?.then(()=> {
    pararTicker()
    agora.value = null
  })
}
function novoJogo() {
  if (!jogo.value) return
  useNovoJogo(jogo.value!.diaId, jogo.value!.grupoId, jogo.value!.anotadorId).then(({ jogoId }) => {
    console.log("novo jogo criado", jogoId)
    navigateTo(`/jogos/${jogoId}`)
  })
}
function handleTimerClick() {
  switch (status.value) {
    case 'ocioso':
      iniciar()
      break
    case 'rodando':
      pausar()
      break
    case 'pausado':
      retomar()
      break
    case 'finalizado':
      // abrir modal novo jogo
      showNewGameModal.value = true
      break
  }
}

function fecharModalNovoJogo() {
  showNewGameModal.value = false
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
  if (status.value === 'rodando') {
    iniciarTicker()
  }
})

onBeforeUnmount(() => {
  console.log('unmount timer, parando ticker e watch')
  pararTicker()
  stopWatch()
})
const showNewGameModal = ref(false)
const colorClass= computed(()=>{
  switch (status.value) {
    case 'ocioso':
      return 'text-gray-500'
    case 'rodando':
      return 'text-green-500'
    case 'pausado':
      return 'text-yellow-500'
    case 'finalizado':
      return 'text-red-500'
    default:
      return ''
  }
})
const timerTextClass = computed(() => [
  colorClass.value,
  props.size === 'compact'
    ? 'text-3xl sm:text-4xl leading-none'
    : 'text-8xl lg:text-9xl leading-none',
])
</script>

<template>
  <div class="flex h-full w-full flex-col">

    <!-- TIMER -->
    <button class="flex flex-1 items-center justify-center" @click="handleTimerClick">
      <span class="cursor-pointer font-bold tabular-nums" :class="timerTextClass">
        {{ tempoFormatado }}
      </span>
    </button>

    <!-- ACTIONS -->
    <div v-if="status === 'pausado'" class="flex items-center justify-center gap-2 pb-3">
      <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="reiniciar">
        Reiniciar
      </UButton>

      <UButton color="neutral" variant="outline" icon="i-lucide-flag" @click="finalizar">
        Finalizar
      </UButton>
    </div>
    <UModal v-model:open="showNewGameModal">
      <template #content>
        <div class="p-4">
          <h2 class="text-2xl font-bold mb-4">Jogo finalizado, o que deseja fazer?</h2>
          <div class="flex justify-between mt-8">
            <UButton class="px-8 py-16" size="xl" color="neutral" @click="fecharModalNovoJogo">
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
