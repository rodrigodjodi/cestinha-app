<script setup lang="ts">
// defines, emits, props, injections
// define o template do título da página; ao título de cada página será adicionado " - Cestinha"
useHead({
  titleTemplate: '%s - Cestinha',
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
