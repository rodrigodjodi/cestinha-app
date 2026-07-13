<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Jogo } from '~/schemas/jogo.schema'

const props = defineProps<{
  jogo: Jogo
  podeApagar: boolean
  podeRenomear: boolean
}>()

const emit = defineEmits<{
  excluir: [jogo: Jogo]
  renomear: [jogo: Jogo]
}>()

const formatadorHorario = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatarHorario(timestamp: { toDate: () => Date } | null) {
  return timestamp ? formatadorHorario.format(timestamp.toDate()) : null
}

const intervaloJogo = computed(() => {
  const inicio = formatarHorario(props.jogo.timer.iniciadoEm)
  const fim = formatarHorario(props.jogo.timer.finalizadoEm)

  if (!inicio) return 'Ainda não iniciado'
  if (!fim) return `${inicio} – em andamento`
  return `${inicio} – ${fim}`
})

const textoStatus = computed(() => {
  switch (props.jogo.timer.status) {
    case 'rodando':
      return 'Jogo em andamento'
    case 'pausado':
      return 'Jogo pausado'
    case 'finalizado':
      return 'Jogo finalizado'
    default:
      return 'Aguardando início'
  }
})

const itensMenu = computed<DropdownMenuItem[]>(() => [{
  label: 'Renomear jogo',
  icon: 'i-lucide-pencil',
  disabled: !props.podeRenomear,
  onSelect: () => emit('renomear', props.jogo),
}, {
  label: 'Excluir jogo',
  icon: 'i-lucide-trash-2',
  color: 'error',
  disabled: !props.podeApagar,
  onSelect: () => emit('excluir', props.jogo),
}])
</script>

<template>
  <NuxtLink
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
          :items="itensMenu"
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
        <span>{{ intervaloJogo }}</span>
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
        {{ textoStatus }}
      </div>
    </div>
  </NuxtLink>
</template>
