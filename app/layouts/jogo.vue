<template>
  <div>
    <h1 class="text-sm bg-accented text-center p-1">{{ pageTitle }}</h1>
    <UMain>
      <slot />
    </UMain>
  </div>
</template>

<script setup lang="ts">
const pageTitle = useState<string>('pageTitle', () => 'Carregando...')
</script>