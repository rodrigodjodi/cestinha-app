<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import { VueDraggableNext } from 'vue-draggable-next'
import type { Dia } from '~/schemas/dia.schema'
import type { Jogador } from '~/schemas/jogador.schema'
import type { Presenca } from '~/schemas/presenca.schema'
import type { TimeDiaId } from '~/schemas/equipe.schema'

const props = defineProps<{
  dia: Dia
  diaId: string
  jogadores: Jogador[]
  presencas: Presenca[]
  podeEditar: boolean
}>()
const toast = useToast()
const db = useFirestore()
const listasTimes = reactive<Record<TimeDiaId, Jogador[]>>({
  time1: [],
  time2: [],
  time3: [],
})
const emEspera = ref<Jogador[]>([])
let salvamentoPendente = Promise.resolve()
let temporizadorSalvamento: ReturnType<typeof setTimeout> | undefined

const jogadoresPorId = computed(() => new Map(
  props.jogadores.map(jogador => [jogador.id, jogador])
))

const confirmadosIds = computed(() => new Set(
  props.presencas
    .filter(presenca => presenca.situacao === '0.confirmado')
    .map(presenca => presenca.jogadorId)
))

function jogadoresDoTime(timeId: TimeDiaId) {
  return props.dia.times[timeId].jogadores.flatMap(jogadorId => {
    const jogador = jogadoresPorId.value.get(jogadorId)
    return jogador ? [jogador] : []
  })
}

function sincronizarListas() {
  listasTimes.time1 = jogadoresDoTime('time1')
  listasTimes.time2 = jogadoresDoTime('time2')
  listasTimes.time3 = jogadoresDoTime('time3')

  const escalados = new Set([
    ...props.dia.times.time1.jogadores,
    ...props.dia.times.time2.jogadores,
    ...props.dia.times.time3.jogadores,
  ])

  emEspera.value = props.jogadores.filter(jogador =>
    confirmadosIds.value.has(jogador.id) && !escalados.has(jogador.id)
  )
}

watch(
  () => [props.dia.times, props.jogadores, props.presencas],
  sincronizarListas,
  { immediate: true, deep: true }
)
const podeEditarTimes = computed(() =>
  props.podeEditar && props.dia.status !== '2.concluido'
)
function persistirTimes() {
  if (!podeEditarTimes.value) return

  clearTimeout(temporizadorSalvamento)
  temporizadorSalvamento = setTimeout(() => {
    const times = {
      time1: {
        ...props.dia.times.time1,
        jogadores: listasTimes.time1.map(jogador => jogador.id),
      },
      time2: {
        ...props.dia.times.time2,
        jogadores: listasTimes.time2.map(jogador => jogador.id),
      },
      time3: {
        ...props.dia.times.time3,
        jogadores: listasTimes.time3.map(jogador => jogador.id),
      },
    }

    salvamentoPendente = salvamentoPendente
      .catch(() => undefined)
      .then(() => updateDoc(doc(db, 'dias', props.diaId), { times }))
      .catch((error) => {
        toast.add({
          title: 'Não foi possível salvar os times',
          color: 'error',
        })
        console.error(error)
      })
  }, 250)
}

const timesVisuais = computed<{ id: TimeDiaId, titulo: string }[]>(() => [
  { id: 'time1', titulo: props.dia.times.time1.nome || 'Time 1' },
  { id: 'time2', titulo: props.dia.times.time2.nome || 'Time 2' },
  { id: 'time3', titulo: props.dia.times.time3.nome || 'Time 3' },
])

const grupoDrag = {
  name: 'jogadores-dia',
  pull: true,
  put: true,
}
</script>

<template>
  <UCard>
    <div class="overflow-x-auto pb-2">
      <div class="grid min-w-[48rem] grid-cols-3 gap-4">
        <UCard
          v-for="time in timesVisuais"
          :key="time.id"
          :ui="{ header: 'p-3', body: 'p-3' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">{{ time.titulo }}</h3>
              <UBadge color="neutral" variant="soft">
                {{ listasTimes[time.id].length }}
              </UBadge>
            </div>
          </template>

            <VueDraggableNext
            v-model="listasTimes[time.id]"
            :group="grupoDrag"
            item-key="id"
            class="flex min-h-36 flex-col gap-2"
            :disabled="!podeEditarTimes"
            @change="persistirTimes"
          >
            <ItemJogadorSelecao
              v-for="jogador in listasTimes[time.id]"
              :key="jogador.id"
              :jogador="jogador"
            />
          </VueDraggableNext>
        </UCard>
      </div>
    </div>

    <div class="mt-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-semibold">Em espera</h3>
        <UBadge color="warning" variant="soft">
          {{ emEspera.length }}
        </UBadge>
      </div>

      <VueDraggableNext
        v-model="emEspera"
        :group="grupoDrag"
        item-key="id"
        :sort="false"
        :disabled="!podeEditarTimes"
        class="flex min-h-24 flex-wrap content-start gap-2 rounded-md border border-dashed border-default p-3"
        @change="persistirTimes"
      >
        <ItemJogadorSelecao
          v-for="jogador in emEspera"
          :key="jogador.id"
          :jogador="jogador"
        />
      </VueDraggableNext>
    </div>
  </UCard>
</template>
