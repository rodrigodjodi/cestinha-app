<script setup lang="ts">
const route = useRoute()
const grupoId = computed(() => route.params.grupo as string);
const jogadores = useListaJogadores(grupoId)

</script>

<template>
  <UCard class="w-full max-w-lg" :ui="{body:'sm:p-4 flex flex-wrap'}">
    <template #header>
      
        <span class="text-lg font-semibold">Jogadores</span>
      
    </template>
      
          <UUser v-for="jogador in jogadores" :name="jogador.nome" :avatar="{icon:'i-lucide-user'}"
          size="lg" :ui="{root:'m-2 '}">
          <template #avatar>
            <UAvatar icon="i-lucide-user" :class="[jogador.usuarioId ? 'border-2 border-green-400' : '']"/>
          </template>
          </UUser>

      
    <template #footer>
      <FormNovoJogador :grupo-id="grupoId"/>
    </template>
  </UCard>
</template>