<script setup lang="ts">


onMounted(() => {
    console.log('[NovoJogador.vue] mounted');
})
</script>

<template>
    <UModal>
        <UButton label="Novo jogador" color="neutral" variant="subtle" />

        <template #header>
            <h2>Novo Jogador</h2>
        </template>
        <template #body>
            <UForm state="">


            </UForm>
        </template>
    </UModal>
</template>