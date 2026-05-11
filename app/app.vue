<script setup lang="ts">
import { pt_br } from '@nuxt/ui/locale'
// defines, emits, props, injections
// define o template do título da página; ao título de cada página será adicionado " - Cestinha"
useHead({
  titleTemplate: '%s - Cestinha',
})
</script>

<template>
  <UApp :locale="pt_br" :toaster="{position:'top-center'}">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
