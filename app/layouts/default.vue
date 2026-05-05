<script setup lang="ts">
const usuarioStore = useUsuarioStore()
</script>

<template>
    <UContainer>
        <TheHeader />
        <slot />
    </UContainer>
</template>