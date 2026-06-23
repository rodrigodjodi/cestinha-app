<script setup lang="ts">
import { VueDraggableNext } from 'vue-draggable-next'
import type { Dia } from '~/schemas/dia.schema'
import type { Jogo } from '~/schemas/jogo.schema'
import type { Jogador } from '~/schemas/jogador.schema'
import type { TimeDiaId } from '~/schemas/equipe.schema'

const props = defineProps<{
  jogo: Jogo
  dia: Dia
  jogadores: Jogador[]
}>()

const user = useCurrentUser()
const toast = useToast()
const jogoStore = useJogoStore()
const listasEquipes = reactive<Record<'esquerda' | 'direita', Jogador[]>>({
  esquerda: [],
  direita: [],
})
const bandejas = reactive<Record<TimeDiaId, Jogador[]>>({
  time1: [],
  time2: [],
  time3: [],
})
const assinaturasPendentes = new Set<string>()
const preenchendoBanco = ref(false)
let inicializado = false
let temporizador: ReturnType<typeof setTimeout> | undefined
let filaSalvamento = Promise.resolve()

const podeEditar = computed(() => props.jogo.anotadorId === user.value?.uid)
const jogoSemComposicao = computed(() =>
  props.jogo.equipes.esquerda.jogadores.length === 0
  && props.jogo.equipes.direita.jogadores.length === 0
  && props.jogo.banco.length === 0
)
const jogadoresDosTimesDoDia = computed(() => [
  ...new Set([
    ...props.dia.times.time1.jogadores,
    ...props.dia.times.time2.jogadores,
    ...props.dia.times.time3.jogadores,
  ]),
])
const jogadoresMap = computed(() => new Map(
  props.jogadores.map(jogador => [jogador.id, jogador])
))
const timesVisuais = computed<{ id: TimeDiaId, titulo: string }[]>(() => [
  { id: 'time1', titulo: props.dia.times.time1.nome || 'Time 1' },
  { id: 'time2', titulo: props.dia.times.time2.nome || 'Time 2' },
  { id: 'time3', titulo: props.dia.times.time3.nome || 'Time 3' },
])
const grupoDrag = {
  name: 'composicao-jogo',
  pull: true,
  put: true,
}

function resolverJogadores(ids: string[]) {
  return ids.flatMap(id => {
    const jogador = jogadoresMap.value.get(id)
    return jogador ? [jogador] : []
  })
}

function assinaturaComposicao(composicao: {
  equipes: Jogo['equipes']
  banco: string[]
}) {
  return JSON.stringify(composicao)
}

function composicaoLocal() {
  return {
    equipes: {
      esquerda: {
        nome: props.jogo.equipes.esquerda.nome,
        jogadores: listasEquipes.esquerda.map(jogador => jogador.id),
      },
      direita: {
        nome: props.jogo.equipes.direita.nome,
        jogadores: listasEquipes.direita.map(jogador => jogador.id),
      },
    },
    banco: [
      ...bandejas.time1,
      ...bandejas.time2,
      ...bandejas.time3,
    ].map(jogador => jogador.id),
  }
}

function sincronizarDoJogo() {
  listasEquipes.esquerda = resolverJogadores(props.jogo.equipes.esquerda.jogadores)
  listasEquipes.direita = resolverJogadores(props.jogo.equipes.direita.jogadores)

  const bancoIds = new Set(props.jogo.banco)
  bandejas.time1 = resolverJogadores(
    props.dia.times.time1.jogadores.filter(id => bancoIds.has(id))
  )
  bandejas.time2 = resolverJogadores(
    props.dia.times.time2.jogadores.filter(id => bancoIds.has(id))
  )
  bandejas.time3 = resolverJogadores(
    props.dia.times.time3.jogadores.filter(id => bancoIds.has(id))
  )
  inicializado = true
}

watch(
  () => [
    props.jogo.equipes,
    props.jogo.banco,
    props.dia.times,
    props.jogadores,
  ],
  () => {
    const assinaturaRemota = assinaturaComposicao({
      equipes: props.jogo.equipes,
      banco: props.jogo.banco,
    })

    if (assinaturasPendentes.has(assinaturaRemota)) {
      assinaturasPendentes.delete(assinaturaRemota)
      return
    }
    if (assinaturasPendentes.size) {
      return
    }
    sincronizarDoJogo()
  },
  { immediate: true, deep: true }
)

function agendarPersistencia() {
  if (!inicializado || !podeEditar.value) {
    return
  }

  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    const composicao = composicaoLocal()
    const assinatura = assinaturaComposicao(composicao)
    assinaturasPendentes.add(assinatura)

    filaSalvamento = filaSalvamento
      .catch(() => undefined)
      .then(() => jogoStore.gravarComposicao(composicao))
      .catch((error) => {
        assinaturasPendentes.delete(assinatura)
        toast.add({
          title: 'Não foi possível salvar a escalação',
          color: 'error',
        })
        console.error(error)
      })
  }, 250)
}

function moverBandeja(timeId: TimeDiaId, lado: 'esquerda' | 'direita') {
  if (!podeEditar.value || !bandejas[timeId].length) {
    return
  }

  listasEquipes[lado].push(...bandejas[timeId])
  bandejas[timeId] = []
  agendarPersistencia()
}

async function preencherBanco() {
  if (
    !jogoSemComposicao.value
    || !podeEditar.value
    || !jogadoresDosTimesDoDia.value.length
    || preenchendoBanco.value
  ) {
    return
  }

  preenchendoBanco.value = true
  try {
    await jogoStore.gravarComposicao({
      equipes: props.jogo.equipes,
      banco: jogadoresDosTimesDoDia.value,
    })
    toast.add({
      title: 'Banco preenchido',
      description: 'Os jogadores dos times do Dia foram adicionados ao jogo.',
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Não foi possível preencher o banco',
      color: 'error',
    })
  } finally {
    preenchendoBanco.value = false
  }
}
</script>

<template>
  <UCard :ui="{ body: 'space-y-5 p-2 sm:p-4' }">
    <div class="grid grid-cols-2 gap-3">
      <UCard
        v-for="equipe in [
          { lado: 'esquerda' as const, titulo: jogo.equipes.esquerda.nome },
          { lado: 'direita' as const, titulo: jogo.equipes.direita.nome },
        ]"
        :key="equipe.lado"
        :ui="{ header: 'p-3', body: 'p-3' }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ equipe.titulo }}</h3>
            <UBadge color="neutral" variant="soft">
              {{ listasEquipes[equipe.lado].length }}
            </UBadge>
          </div>
        </template>

        <VueDraggableNext
          v-model="listasEquipes[equipe.lado]"
          :group="grupoDrag"
          :disabled="!podeEditar"
          item-key="id"
          class="flex min-h-40 flex-col gap-2"
          @change="agendarPersistencia"
        >
          <ItemJogadorSelecao
            v-for="jogador in listasEquipes[equipe.lado]"
            :key="jogador.id"
            :jogador="jogador"
          />
        </VueDraggableNext>
      </UCard>
    </div>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Banco</h3>
        <div class="flex items-center gap-2">
          <UButton
            v-if="jogoSemComposicao"
            size="sm"
            color="warning"
            variant="soft"
            :loading="preenchendoBanco"
            :disabled="!podeEditar || !jogadoresDosTimesDoDia.length"
            @click="preencherBanco"
          >
            PREENCHER BANCO
          </UButton>
          <UBadge color="neutral" variant="soft">
            {{ bandejas.time1.length + bandejas.time2.length + bandejas.time3.length }}
          </UBadge>
        </div>
      </div>

      <div class="overflow-x-auto pb-2">
        <div class="grid min-w-[48rem] grid-cols-3 gap-3">
          <UCard
            v-for="time in timesVisuais"
            :key="time.id"
            :ui="{ header: 'p-2', body: 'p-3' }"
          >
            <template #header>
              <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                <UTooltip text="Mover todos para a equipe esquerda">
                  <UButton
                    icon="i-lucide-move-up-left"
                    size="sm"
                    square
                    variant="ghost"
                    aria-label="Mover todos para a equipe esquerda"
                    :disabled="!podeEditar || !bandejas[time.id].length"
                    @click="moverBandeja(time.id, 'esquerda')"
                  />
                </UTooltip>

                <div class="text-center">
                  <h4 class="font-semibold">{{ time.titulo }}</h4>
                  <span class="text-xs text-muted">{{ bandejas[time.id].length }}</span>
                </div>

                <UTooltip text="Mover todos para a equipe direita">
                  <UButton
                    icon="i-lucide-move-up-right"
                    size="sm"
                    square
                    variant="ghost"
                    aria-label="Mover todos para a equipe direita"
                    :disabled="!podeEditar || !bandejas[time.id].length"
                    @click="moverBandeja(time.id, 'direita')"
                  />
                </UTooltip>
              </div>
            </template>

            <VueDraggableNext
              v-model="bandejas[time.id]"
              :group="grupoDrag"
              :disabled="!podeEditar"
              item-key="id"
              class="flex min-h-32 flex-col gap-2"
              @change="agendarPersistencia"
            >
              <ItemJogadorSelecao
                v-for="jogador in bandejas[time.id]"
                :key="jogador.id"
                :jogador="jogador"
              />
            </VueDraggableNext>
          </UCard>
        </div>
      </div>
    </section>
  </UCard>
</template>
