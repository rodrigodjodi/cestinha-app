<script setup lang="ts">
import { JogoSchema } from '~/schemas/jogo';

onMounted(() => {
    console.log('[NovoJogo.vue] mounted');
})
</script>


<template>
    <UModal>
        <UButton label="Novo jogo" color="neutral" variant="subtle" />

        <template #header>
            <h2>Novo Jogo</h2>
        </template>
    </UModal>
</template>