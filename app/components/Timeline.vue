<script setup lang="ts">
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
  .catch(err=>{console.error(err)})
  .finally(()=>offsetLoading.value = false)
}
defineShortcuts({
  i: ()=>{setOffset()}
})
</script>
<template>
  <UTooltip arrow text="Definir início" :kbds="['i']">
    <UButton size="xl" class="mr-2" icon="i-lucide-timer" color="neutral" variant="soft"
      @click="setOffset" :loading="offsetLoading"/>
  </UTooltip>
  <UFieldGroup>
    <UButton size="xl" class="px-4" icon="i-lucide-chevrons-left" color="neutral" variant="soft" />

    <UButton size="xl" class="px-4" icon="i-lucide-chevron-left" color="neutral" variant="soft" />

    <UButton size="xl" class="px-4" label="-5s" color="neutral" variant="soft" />

    <UButton size="xl" class="px-4" label="+5s" color="neutral" variant="soft" />

    <UButton size="xl" class="px-4" icon="i-lucide-chevron-right" color="neutral" variant="soft" />

    <UButton size="xl" class="px-4" icon="i-lucide-chevrons-right" color="neutral" variant="soft" />
  </UFieldGroup>
  {{ tempoJogoMs }}
</template>


<style scoped></style>
