<script setup lang="ts">
import type { Jogada } from '~/schemas/jogada.schema';
const props = defineProps<{
    jogadas: Jogada[]
}>()

</script>
<template>
    <div>
        <h1>Lista Jogadas</h1>
        <ul>
            <li v-for="jogada in jogadas" :key="jogada.id">
                {{ jogada.tipo }}
            </li>
        </ul>
    </div>
</template>


<style scoped>

</style>