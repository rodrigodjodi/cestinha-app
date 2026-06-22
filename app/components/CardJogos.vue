<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Jogo } from '~/schemas/jogo.schema'
import { apagarJogo } from '~/services/apagarJogo'

const props = defineProps<{
  diaId: string
  grupoId: string | undefined
}>()
const user = useCurrentUser()
const {
  jogos,
  pending,
  error,
} = useListaJogosDiasGrupo(
  () => props.diaId,
  () => props.grupoId
)
const anotadorModel = ref(true)
const anotadorJogo = computed(() =>
  anotadorModel.value ? user.value?.uid ?? null : null
)
const { jogadorLogado } = useJogadorLogado(() => props.grupoId)
const toast = useToast()
const jogoSelecionado = ref<Jogo | null>(null)
const modalExclusaoAberto = ref(false)
const apagando = ref(false)

const formatadorHorario = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatarHorario(timestamp: { toDate: () => Date } | null) {
  return timestamp ? formatadorHorario.format(timestamp.toDate()) : null
}

function intervaloJogo(jogo: (typeof jogos.value)[number]) {
  const inicio = formatarHorario(jogo.timer.iniciadoEm)
  const fim = formatarHorario(jogo.timer.finalizadoEm)

  if (!inicio) return 'Ainda não iniciado'
  if (!fim) return `${inicio} – em andamento`
  return `${inicio} – ${fim}`
}

function textoStatus(status: (typeof jogos.value)[number]['timer']['status']) {
  switch (status) {
    case 'rodando':
      return 'Jogo em andamento'
    case 'pausado':
      return 'Jogo pausado'
    case 'finalizado':
      return 'Jogo finalizado'
    default:
      return 'Aguardando início'
  }
}

function podeApagar(jogo: Jogo) {
  return jogadorLogado.value?.atribuicao === 'admin'
    || jogo.anotadorId === user.value?.uid
}

function abrirConfirmacaoExclusao(jogo: Jogo) {
  jogoSelecionado.value = jogo
  modalExclusaoAberto.value = true
}

function itensMenu(jogo: Jogo): DropdownMenuItem[] {
  return [{
    label: 'Excluir jogo',
    icon: 'i-lucide-trash-2',
    color: 'error',
    disabled: !podeApagar(jogo),
    onSelect: () => abrirConfirmacaoExclusao(jogo),
  }]
}

async function confirmarExclusao() {
  if (!jogoSelecionado.value) return

  apagando.value = true
  try {
    await apagarJogo({
      jogoId: jogoSelecionado.value.id,
      grupoId: jogoSelecionado.value.grupoId,
    })
    modalExclusaoAberto.value = false
    toast.add({
      title: 'Jogo excluído',
      description: 'O jogo, suas jogadas e sua thumbnail foram removidos.',
      color: 'success',
    })
    jogoSelecionado.value = null
  } catch (error) {
    console.error('Erro ao excluir jogo:', error)
    toast.add({
      title: 'Não foi possível excluir o jogo',
      color: 'error',
    })
  } finally {
    apagando.value = false
  }
}

async function novoJogo() {
  const { jogoId } = await useNovoJogo(props.diaId, props.grupoId, anotadorJogo.value)
  await navigateTo(`/jogos/${jogoId}`)
}
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center gap-3">
      <UIcon name="i-lucide-circle-dot" class="size-5 text-primary" />
      <h2 class="text-lg font-bold text-highlighted">Jogos realizados</h2>
      <UBadge class="ml-auto" color="primary" variant="soft">
        {{ jogos.length }} {{ jogos.length === 1 ? 'jogo' : 'jogos' }}
      </UBadge>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="Não foi possível carregar os jogos"
    />

    <div v-else-if="jogos.length" class="flex flex-col gap-3">
      <NuxtLink
        v-for="jogo in jogos"
        :key="jogo.id"
        :to="`/jogos/${jogo.id}`"
        class="group flex gap-3 rounded-xl border border-default bg-default p-3 transition hover:border-primary/40 hover:bg-elevated sm:gap-4"
      >
        <div class="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-elevated sm:h-32 sm:w-48">
          <img
            v-if="jogo.video.thumbUrl"
            :src="jogo.video.thumbUrl"
            :alt="`Thumbnail de ${jogo.nome}`"
            class="size-full object-cover"
          />
          <div
            v-else
            class="flex size-full flex-col items-center justify-center gap-2 text-muted"
          >
            <UIcon name="i-lucide-video-off" class="size-8" />
            <span class="text-sm">Sem vídeo</span>
          </div>

          <span
            v-if="jogo.video.youtubeId"
            class="absolute inset-0 flex items-center justify-center bg-black/10"
          >
            <span class="flex size-10 items-center justify-center rounded-full bg-black/75 text-white">
              <UIcon name="i-lucide-play" class="size-5 fill-current" />
            </span>
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start gap-2">
            <h3 class="truncate font-semibold text-primary group-hover:underline">
              {{ jogo.nome }}
            </h3>
            <UDropdownMenu
              :items="itensMenu(jogo)"
              :content="{ align: 'end' }"
            >
              <UButton
                class="ml-auto shrink-0"
                icon="i-lucide-ellipsis"
                color="neutral"
                variant="ghost"
                aria-label="Ações do jogo"
                @click.prevent.stop
              />
            </UDropdownMenu>
          </div>

          <div class="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <UIcon name="i-lucide-clock-3" class="size-4 shrink-0" />
            <span>{{ intervaloJogo(jogo) }}</span>
          </div>

          <div
            v-if="jogo.timer.status === 'finalizado'"
            class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center rounded-lg border border-default bg-muted/20 px-3 py-2 text-center"
          >
            <div>
              <div class="truncate text-xs font-medium text-primary">
                {{ jogo.equipes.esquerda.nome }}
              </div>
              <div class="text-2xl font-bold text-highlighted">
                {{ jogo.placar.esquerda }}
              </div>
            </div>
            <span class="px-3 text-muted">×</span>
            <div>
              <div class="truncate text-xs font-medium text-error">
                {{ jogo.equipes.direita.nome }}
              </div>
              <div class="text-2xl font-bold text-highlighted">
                {{ jogo.placar.direita }}
              </div>
            </div>
          </div>

          <div v-else class="mt-3 text-sm text-muted">
            {{ textoStatus(jogo.timer.status) }}
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="rounded-lg border border-dashed border-default py-8 text-center text-muted">
      Nenhum jogo criado para este dia.
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <UCheckbox v-model="anotadorModel" label="Assumir anotação" />
      <UButton
        class="ml-auto"
        color="primary"
        icon="i-lucide-pencil-line"
        @click="novoJogo"
      >
        Anotar novo jogo
      </UButton>
    </div>

    <UModal v-model:open="modalExclusaoAberto">
      <template #header>
        <h3 class="font-semibold">Excluir jogo?</h3>
      </template>
      <template #body>
        <p class="text-sm text-muted">
          O jogo <strong class="text-highlighted">{{ jogoSelecionado?.nome }}</strong>,
          suas jogadas e a thumbnail serão removidos permanentemente.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="apagando"
            @click="modalExclusaoAberto = false"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :loading="apagando"
            @click="confirmarExclusao"
          >
            Excluir jogo
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
