<script setup lang="ts">
import { apiFetch } from '~/services/apiFetch'
import type { Jogador } from '~/schemas/jogador.schema'
import type { Presenca, SituacaoPresenca } from '~/schemas/presenca.schema'

const props = defineProps<{
  jogadores: Jogador[]
  presencas: Presenca[]
  jogadorLogado: Jogador | undefined
  diaId: string
  grupoId: string | undefined
  edicaoBloqueada: boolean
}>()

type ItemJogadorLista = {
  id: string
  nome: string
  situacao: SituacaoPresenca
  situacaoEm: Presenca['situacaoEm']
}

const toast = useToast()
const modalAberto = ref(false)
const itemSelecionado = ref<ItemJogadorLista>()
const carregando = ref(false)
const ehAdmin = computed(() => props.jogadorLogado?.atribuicao === 'admin')
const edicaoBloqueada = computed(() => props.edicaoBloqueada)
const jogadoresMap = computed(() => new Map(
  props.jogadores.map(jogador => [jogador.id, jogador])
))
const itensPresencaLista = computed<ItemJogadorLista[]>(() =>
  props.presencas.flatMap(presenca => {
    const jogador = jogadoresMap.value.get(presenca.jogadorId)
    if (!jogador) return []
    return [{
      id: jogador.id,
      nome: jogador.nome,
      situacao: presenca.situacao,
      situacaoEm: presenca.situacaoEm,
    }]
  })
)
const confirmados = computed(() =>
  itensPresencaLista.value
    .filter(item => item.situacao === '0.confirmado')
    .sort((a, b) => a.situacaoEm.toMillis() - b.situacaoEm.toMillis())
)
const emEspera = computed(() =>
  itensPresencaLista.value
    .filter(item => item.situacao === '1.espera')
    .sort((a, b) => a.situacaoEm.toMillis() - b.situacaoEm.toMillis())
)
const formatadorHorario = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function formatarHorario(timestamp: Presenca['situacaoEm']) {
  const texto = formatadorHorario.format(timestamp.toDate()).replace('.', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function abrirAcoes(item: ItemJogadorLista) {
  if (!ehAdmin.value || props.edicaoBloqueada) return
  itemSelecionado.value = item
  modalAberto.value = true
}

async function alterarSituacao(situacao: '0.confirmado' | '1.espera') {
  if (!props.grupoId || !itemSelecionado.value) return

  carregando.value = true
  try {
    await apiFetch(
      `/api/presencas/${props.diaId}/${itemSelecionado.value.id}`,
      {
        method: 'PATCH',
        body: {
          grupoId: props.grupoId,
          situacao,
        },
      }
    )
    modalAberto.value = false
    toast.add({
      title: situacao === '0.confirmado'
        ? 'Presença confirmada'
        : 'Jogador movido para espera',
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Não foi possível atualizar a presença',
      color: 'error',
    })
  } finally {
    carregando.value = false
  }
}

async function retirarJogador() {
  if (!props.grupoId || !itemSelecionado.value) return

  carregando.value = true
  try {
    await apiFetch(
      `/api/presencas/${props.diaId}/${itemSelecionado.value.id}`,
      {
        method: 'DELETE',
        body: { grupoId: props.grupoId },
      }
    )
    modalAberto.value = false
    toast.add({
      title: 'Jogador retirado do Dia',
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Não foi possível retirar o jogador',
      color: 'error',
    })
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <h2 class="text-xl font-bold">Lista</h2>
      <UBadge class="ml-auto" color="success" variant="soft">
        {{ confirmados.length }} Confirmados
      </UBadge>
      <UBadge color="warning" variant="soft">
        {{ emEspera.length }} Espera
      </UBadge>
    </div>

    <FormInscricaoJogador
      v-if="ehAdmin && !edicaoBloqueada"
      :dia-id="diaId"
      :grupo-id="grupoId"
      :jogadores="jogadores"
      :presencas="presencas"
    />

    <section class="mt-4">
      <div class="inline-flex items-center gap-2">
        <UIcon name="i-lucide-check" class="size-5 bg-success" />
        <h3 class="font-medium">Confirmados</h3>
      </div>
      <ol class="mt-2 list-decimal ps-6 marker:text-muted">
        <li
          v-for="item in confirmados"
          :key="item.id"
          class="py-1"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-md py-2 text-left"
            :class="ehAdmin && !edicaoBloqueada ? 'cursor-pointer active:bg-elevated' : 'cursor-default'"
            @click="abrirAcoes(item)"
          >
            <span class="min-w-0 truncate">{{ item.nome }}</span>
            <span class="shrink-0 text-sm text-muted">
              {{ formatarHorario(item.situacaoEm) }}
            </span>
          </button>
        </li>
      </ol>
    </section>

    <section class="mt-4">
      <div class="inline-flex items-center gap-2">
        <UIcon name="i-lucide-hourglass" class="size-5 bg-warning" />
        <h3 class="font-medium">Em espera</h3>
      </div>
      <ol class="mt-2 list-decimal ps-6 marker:text-muted">
        <li
          v-for="item in emEspera"
          :key="item.id"
          class="py-1"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-md py-2 text-left"
            :class="ehAdmin && !edicaoBloqueada ? 'cursor-pointer active:bg-elevated' : 'cursor-default'"
            @click="abrirAcoes(item)"
          >
            <span class="min-w-0 truncate">{{ item.nome }}</span>
            <span class="shrink-0 text-sm text-muted">
              {{ formatarHorario(item.situacaoEm) }}
            </span>
          </button>
        </li>
      </ol>
    </section>

    <UModal v-model:open="modalAberto">
      <template #header>
        <h3 class="font-semibold">{{ itemSelecionado?.nome }}</h3>
      </template>
      <template #body>
        <div class="flex flex-col gap-3">
          <UButton
            v-if="itemSelecionado?.situacao === '0.confirmado'"
            color="warning"
            variant="soft"
            :loading="carregando"
            :disabled="carregando"
            @click="alterarSituacao('1.espera')"
          >
            MOVER PARA ESPERA
          </UButton>
          <UButton
            v-if="itemSelecionado?.situacao === '1.espera'"
            color="success"
            variant="soft"
            :loading="carregando"
            :disabled="carregando"
            @click="alterarSituacao('0.confirmado')"
          >
            CONFIRMAR
          </UButton>
          <UButton
            color="error"
            variant="soft"
            :loading="carregando"
            :disabled="carregando"
            @click="retirarJogador"
          >
            RETIRAR
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
