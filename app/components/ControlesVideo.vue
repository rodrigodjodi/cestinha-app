<script setup lang="ts">
defineProps<{
  velocidadeLabel?: string
  velocidadeDisabled?: boolean
}>()

const emit = defineEmits<{
  alternarVelocidade: []
}>()

const { tempoVideoMs } = useVideoAnotacao()
const jogoStore = useJogoStore()
const { offsetMs } = storeToRefs(jogoStore)
const { definirOffsetMs } = jogoStore
const offsetLoading = ref(false)
const tempoJogoMs = computed(() =>
  Math.max(0, Math.round(tempoVideoMs.value - offsetMs.value))
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

defineShortcuts({
  i: () => {
    setOffset()
  },
})
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <UTooltip arrow text="Definir início" :kbds="['i']">
      <UButton
        size="xl"
        icon="i-lucide-timer"
        color="neutral"
        variant="soft"
        :loading="offsetLoading"
        @click="setOffset"
      />
    </UTooltip>

    <UFieldGroup>
      <UButton size="xl" class="px-4" icon="i-lucide-chevrons-left" color="neutral" variant="soft" />

      <UButton size="xl" class="px-4" icon="i-lucide-chevron-left" color="neutral" variant="soft" />

      <UButton size="xl" class="px-4" label="-5s" color="neutral" variant="soft" />

      <UButton size="xl" class="px-4" label="+5s" color="neutral" variant="soft" />

      <UButton size="xl" class="px-4" icon="i-lucide-chevron-right" color="neutral" variant="soft" />

      <UButton size="xl" class="px-4" icon="i-lucide-chevrons-right" color="neutral" variant="soft" />
    </UFieldGroup>

    <UTooltip arrow text="Alternar velocidade" :kbds="['V']">
      <UButton
        size="xl"
        class="min-w-14"
        color="neutral"
        variant="soft"
        :label="velocidadeLabel ?? '1x'"
        :disabled="velocidadeDisabled"
        @click="emit('alternarVelocidade')"
      />
    </UTooltip>
  </div>
</template>

<style scoped></style>
