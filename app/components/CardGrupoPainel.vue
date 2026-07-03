<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { Grupo } from '~/schemas/grupo.schema'

const props = defineProps<{
  grupo: Grupo
}>()

const { copy, copied } = useClipboard()
const conviteUrl = computed(() =>
  props.grupo.conviteId
    ? `https://cestinha.app.br/convites/${props.grupo.conviteId}`
    : null
)

function copiarConvite() {
  if (!conviteUrl.value) return
  copy(conviteUrl.value)
}
</script>

<template>
  <UCard class="transition hover:shadow-lg">
    <template #header>
      <NuxtLink
        as="h2"
        class="text-lg font-semibold hover:text-info-500"
        :to="`/grupos/${grupo.id}`"
      >
        {{ grupo.nome }}
      </NuxtLink>
    </template>

    <p class="text-sm text-gray-500">
      {{ grupo.usuarios.length }} participante(s)
    </p>

    <div class="mt-3 space-y-2">
      <p>Link de convite:</p>

      <p v-if="!conviteUrl" class="text-sm text-muted">
        Convite não encontrado.
      </p>

      <div v-else class="flex flex-wrap items-center gap-2">
        <span class="break-all text-info-500">
          {{ conviteUrl }}
        </span>
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          size="sm"
          color="info"
          variant="solid"
          title="Copiar"
          @click="copiarConvite"
        />
      </div>
    </div>
  </UCard>
</template>
