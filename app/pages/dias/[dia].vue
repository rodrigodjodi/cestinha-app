<script setup lang="ts">
import {doc} from 'firebase/firestore'
const db = useFirestore()
const route = useRoute()
const dia = useDocument(doc(db, 'dias', route.params.dia as string))
</script>
<template>
    <h1>Página do dia {{ new Date(dia?.data).toLocaleDateString() }}</h1>
    <pre>{{ dia }}</pre>
</template>