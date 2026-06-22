<script setup lang="ts">
const props = defineProps<{
  diaId: string
  grupoId: string | undefined
}>()
const user = useCurrentUser()
const { 
  jogos,
  error,
  errosParseJogos 
} = useListaJogosDiasGrupo(
  ()=>props.diaId,
  ()=> props.grupoId
)
// console.log(jogos)
const anotadorModel = ref(true)
const anotadorJogo = computed(() =>
  anotadorModel.value ? user.value?.uid ?? null : null
)
async function novoJogo() {
  const { jogoId } = await useNovoJogo(props.diaId, props.grupoId, anotadorJogo.value)
  await navigateTo(`/jogos/${jogoId}`)
}
</script>

<template>
  <UCard>
    <div class="flex flex-row mb-4">
      <h2 class="text-xl font-bold"> Jogos </h2>
      <UBadge class="ml-auto" color="success" variant="soft">
        {{ jogos?.length }} Jogos
      </UBadge>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <nuxt-link v-for="jogo in jogos" :key="jogo.id"
        :to="`/jogos/${jogo.id}`"
        class="overflow-hidden rounded-lg border hover:bg-accented">
        <div class="aspect-video bg-elevated">
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
        </div>
        <div class="p-3 font-medium">
          {{ jogo.nome }}
        </div>
      </nuxt-link>
    </div>
    <div class="flex gap-3 items-center">
      <UButton color="primary" @click="novoJogo">Novo jogo</UButton>
      <UCheckbox v-model="anotadorModel" label="Assumir anotação" />
    </div>
  </UCard>
</template>
