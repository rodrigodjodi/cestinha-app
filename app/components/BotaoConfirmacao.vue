<script setup lang="ts">
import { apiFetch } from '~/services/apiFetch'
import type { Jogador } from '~/schemas/jogador.schema'
import type { Presenca } from '~/schemas/presenca.schema'

const props = defineProps<{
  diaId: MaybeRefOrGetter<string>
  grupoId: MaybeRefOrGetter<string | undefined>
  jogadorLogado: MaybeRefOrGetter<Jogador | undefined>
  presencas: MaybeRefOrGetter<Presenca[] | undefined>
  edicaoBloqueada: MaybeRefOrGetter<boolean>
}>()

const toast = useToast()
const carregando = ref(false)
const presencaAtual = computed(() => {
  const jogadorId = toValue(props.jogadorLogado)?.id
  return toValue(props.presencas)?.find(
    presenca => presenca.jogadorId === jogadorId
  )
})
const edicaoBloqueada = computed(() => toValue(props.edicaoBloqueada))

async function confirmarPresenca() {
  const grupoId = toValue(props.grupoId)
  const jogadorId = toValue(props.jogadorLogado)?.id
  if (!grupoId || !jogadorId) return

  carregando.value = true
  try {
    await apiFetch('/api/presencas/inscrever', {
      method: 'POST',
      body: {
        grupoId,
        diaId: toValue(props.diaId),
        jogadorId,
      },
    })
    toast.add({
      title: 'Inscrição realizada!',
      description: 'Sua situação foi atualizada para este dia.',
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Não foi possível confirmar sua presença',
      color: 'error',
    })
  } finally {
    carregando.value = false
  }
}

async function cancelarPresenca() {
  const grupoId = toValue(props.grupoId)
  const jogadorId = toValue(props.jogadorLogado)?.id
  if (!grupoId || !jogadorId) return

  carregando.value = true
  try {
    await apiFetch(
      `/api/presencas/${toValue(props.diaId)}/${jogadorId}`,
      {
        method: 'DELETE',
        body: { grupoId },
      }
    )
    toast.add({
      title: 'Inscrição cancelada',
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Não foi possível cancelar sua inscrição',
      color: 'error',
    })
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="w-full rounded-2xl border-2 border-accented bg-muted p-4">
    <UButton
      v-if="!presencaAtual && !edicaoBloqueada"
      size="lg"
      class="w-full py-8"
      variant="subtle"
      :loading="carregando"
      :disabled="carregando || !toValue(jogadorLogado)"
      @click="confirmarPresenca"
    >
      CONFIRMAR PRESENÇA
    </UButton>

    <div
      v-else-if="presencaAtual?.situacao === '0.confirmado'"
      class="w-full rounded-md bg-primary/10 px-3 py-6 text-sm font-medium text-primary ring ring-inset ring-primary/25"
    >
      <h2 class="text-center">PRESENÇA CONFIRMADA</h2>
      <UButton
        v-if="!edicaoBloqueada"
        class="mt-4 w-full"
        color="error"
        variant="soft"
        :loading="carregando"
        :disabled="carregando"
        @click="cancelarPresenca"
      >
        CANCELAR PRESENÇA
      </UButton>
    </div>

    <div
      v-else-if="presencaAtual?.situacao === '1.espera'"
      class="w-full rounded-md bg-warning/10 px-3 py-6 text-sm font-medium text-warning ring ring-inset ring-warning/25"
    >
      <h2 class="text-center">VOCÊ ESTÁ NA ESPERA</h2>
      <UButton
        v-if="!edicaoBloqueada"
        class="mt-4 w-full"
        color="error"
        variant="soft"
        :loading="carregando"
        :disabled="carregando"
        @click="cancelarPresenca"
      >
        CANCELAR INSCRIÇÃO
      </UButton>
    </div>
  </div>
</template>
