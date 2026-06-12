<script setup lang="ts">
definePageMeta({middleware: ['auth']})
//composables
const route = useRoute()
const { grupo, pending, error, notFound, errosParseGrupo } = useGrupo(route.params.grupo as string)
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
// estado
console.log('Grupo carregado:', grupo)
const grupoId = computed(() => grupo.value?.id)
const { jogadorLogado } = useJogadorLogado(grupoId)
const { jogadores } = useListaJogadores(grupoId)
// SEO
useHead({ title: pageTitle }) // esse título para a aba do navegador: Titulo - Cestinha
watchEffect(() => {
  pageTitle.value = grupo.value?.nome ?? 'Carregando...'
})
</script>

<template>
  <!-- <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1> -->
  <div v-if="pending">
    <div class="grid gap-4 md:grid-cols-2">
      <USkeleton class="h-24 mb-3" v-for="i in 3" :key="i" />
    </div>
  </div>
  <div v-else-if="error">
    <UCard class="bg-error">
      <p class="">
        Ocorreu um erro ao carregar o grupo.
        Por favor, tente novamente mais tarde.
      </p>
      <pre>{{ error }}</pre>

      <pre>{{ error.code }}</pre>
    </UCard>
  </div>
  <div v-else-if="notFound">
    <UCard>
      <p class="text-gray-500">
        Grupo não encontrado.
      </p>
    </UCard>
  </div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
    <!-- paniel Dias -->
    <CardDiasGrupo :grupoId="grupo?.id" />
    <!-- card Jogoadores -->
    <CardJogadores :jogadorLogado="jogadorLogado" :jogadores="jogadores" :grupoId="grupo!.id" />

  </div>
</template>

<style scoped>
h1 {
  view-transition-name: v-bind('`grupo-header-${route.params.grupo}`');
}
</style>