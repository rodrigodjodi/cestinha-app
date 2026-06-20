<script setup lang="ts">
const tempoVideo: Ref<number> = useState('tempo-video')
const { definirOffsetVideo } = useJogoStore()
const offsetLoading = ref(false)
function setOffset() {
  offsetLoading.value = true
  definirOffsetVideo(Math.round(tempoVideo.value))
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
  {{ tempoVideo }}
</template>


<style scoped></style>