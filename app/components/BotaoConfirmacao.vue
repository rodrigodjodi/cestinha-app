<script setup lang="ts">
import { apiFetch } from "~/services/apiFetch";
import type { Jogador } from "~/schemas/jogador.schema";
const props = defineProps<{
  diaId: MaybeRefOrGetter<string | undefined>
  grupoId: MaybeRefOrGetter<string | undefined>
  jogadorLogado: MaybeRefOrGetter<Jogador | undefined>
  presencas: MaybeRefOrGetter<Presenca[] | undefined>
}>()
const confirmado = computed(() => {
  // jogador está na lista de presenças?
  return toValue(props.presencas).some(presenca => {
    return presenca.jogadorId === toValue(props.jogadorLogado)?.id
  })
})
async function confirmarPresenca() {
  try {
    await apiFetch('/api/presencas/inscrever', {
      method: 'POST',
      body: {
        grupoId: toValue(props.grupoId),
        diaId: toValue(props.diaId),
        jogadorId: toValue(props.jogadorLogado)?.id
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    useToast().add({
      title: 'Presença confirmada!',
      description: 'Sua presença foi confirmada para este dia.',
      color: 'success'
    })
  }
}
</script>
<template>
  <div class="w-full bg-muted border-accented border-2  rounded-2xl p-4">
    <UButton v-if="!confirmado" size="lg" class="py-8 w-full" variant="subtle" @click="confirmarPresenca">
      CONFIRMAR PRESENÇA
    </UButton>
    <div v-else 
      class=" rounded-md font-medium  items-center   select-none  transition-colors px-3 text-sm gap-2 text-primary ring ring-inset ring-primary/25 bg-primary/10 py-8 w-full">
      <h2 class="text-center">PRESENÇA CONFIRMADA</h2>
      <p class="text-center text-muted mt-2">Use ações na lista para desconfirmar</p>
    </div>
  </div>
</template>