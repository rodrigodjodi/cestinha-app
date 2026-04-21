<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
const pageTitle = useState('pageTitle', () => 'Carregando...')
const auth = useFirebaseAuth()
const user = useCurrentUser()
async function logout() {
    if (auth) {
        await signOut(auth)
        console.log('Usuário desconectdo com sucesso')
        navigateTo('/')
    }
}
</script>
<template>
    <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
        <UButton v-if="user" color="primary" @click="logout">
            SAIR
        </UButton>
    </header>
</template>