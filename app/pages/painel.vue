<script setup lang="ts">
import {useClipboard} from '@vueuse/core'
// middleware
definePageMeta({middleware: ['auth']})
// composables
const pageTitle = useState('pageTitle')
// stores
useHead({ title: 'Painel do usuário' }) // esse título para a aba do navegador: Meus Grupos - Cestinha
// estado
const { grupos, pending, errosParseGrupo } = useGruposUsuario()




const mostrarModalCriarGrupo = ref(false)
const {  copy, copied } = useClipboard()
</script>

<template>
  <UContainer class="py-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold">Meus grupos</h1>
        <span v-if="errosParseGrupo.length > 0" class="text-sm text-error-500" >Grupos não listados</span>
      </div>
       
      <UModal title="Novo Grupo" v-model:open="mostrarModalCriarGrupo">
        <UButton icon="i-lucide-plus" label="Novo Grupo" color="primary"  />
        <template #body>
          <p class="mb-4 text-dimmed">Um grupo será criado e você será adicionado como jogador admin.</p>
          <FormNovoGrupo @close="mostrarModalCriarGrupo = false"/>
        </template>
      </UModal>
    </div>

    <div v-if="pending">
      <div class="grid gap-4 md:grid-cols-2">
        <USkeleton class="h-24 mb-3" v-for="i in 3" :key="i" />
      </div>
    </div>

    <div v-else-if="grupos.length === 0">
      <UCard>
        <p class="text-gray-500">
          Você ainda não participa de nenhum grupo.
        </p>
      </UCard>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard v-for="grupo in grupos" :key="grupo?.id"
        class=" hover:shadow-lg transition"
        >
        <template #header>
          <NuxtLink as="h2" class="font-semibold text-lg hover:text-info-500"
            :to="`/grupos/${grupo?.id}`">
            {{ grupo?.nome }}
          </NuxtLink>
        </template>

        <p class="text-sm text-gray-500">
          {{ grupo?.usuarios.length }} participante(s)
        </p>
        <p>Link de convite:</p>
        <span class="text-info-300">
          {{`https://cestinha.app.br/convites/${grupo?.convite}`}}
        </span>
        <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" size="sm" color="info" variant="solid"
          class="ml-4" @click="copy(`https://cestinha.app.br/convites/${grupo?.convite}`)"
          title="Copiar"/>
      </UCard>
    </div>
  </UContainer>
</template>
