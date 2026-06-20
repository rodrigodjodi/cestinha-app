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
    <div class="flex flex-col">
      <nuxt-link v-for="jogo in jogos" :key="jogo.id" 
        :to="`/jogos/${jogo.id}`"
        class="p-2 border rounded mb-2 hover:bg-accented">
        {{ jogo.nome }}
      </nuxt-link>
    </div>
    <div class="flex gap-3 items-center">
      <UButton color="primary" @click="novoJogo">Novo jogo</UButton>
      <UCheckbox v-model="anotadorModel" label="Assumir anotação" />
    </div>
  </UCard>
</template>
