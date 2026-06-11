<script setup lang="ts">
// middleware
definePageMeta({
  middleware: ['auth']
})

// composables
const pageTitle = useState('pageTitle')

useHead({ title: 'Meus Grupos' }) // esse título para a aba do navegador: Meus Grupos - Cestinha
// estado

pageTitle.value = 'Meus Grupos'
const { grupos, pending } = useGruposUsuario()
const mostrarModalCriarGrupo = ref(false)

</script>

<template>
  <UContainer class="py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Meus grupos</h1>

      <UModal title="Novo Grupo" v-model:open="mostrarModalCriarGrupo">
        <UButton icon="i-lucide-plus" label="Novo Grupo" color="primary"  />
        <template #body>
          <p class="mb-4 text-dimmed">Um grupo será criado e você será adicionado como jogador.</p>
          <FormNovoGrupo @close="mostrarModalCriarGrupo = false"/>
        </template>
      </UModal>
    </div>

    <div v-if="pending">
      <USkeleton class="h-24 mb-3" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="grupos.length === 0">
      <UCard>
        <p class="text-gray-500">
          Você ainda não participa de nenhum grupo.
        </p>
      </UCard>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="grupo in grupos" :key="grupo?.id" class="cursor-pointer hover:shadow-lg transition"
        @click="navigateTo(`/grupos/${grupo?.id}`)">
        <template #header>
          <h2 class="font-semibold text-lg">
            {{ grupo?.nome }}
          </h2>
        </template>

        <p class="text-sm text-gray-500">
          {{ grupo?.usuarios.length }} participante(s)
        </p>
      </UCard>
    </div>
  </UContainer>
</template>
