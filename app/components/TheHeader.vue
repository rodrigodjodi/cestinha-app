<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import type { NavigationMenuItem } from '@nuxt/ui'
import { page } from '#build/ui'
const pageTitle = useState('pageTitle', () => 'Carregando...')
const auth = useFirebaseAuth()
const user = useCurrentUser()
const route = useRoute()
const usuarioStore = useUsuarioStore()
const { usuario } = storeToRefs(usuarioStore)
/* async function logout() {
    if (auth) {
        await signOut(auth)
        console.log('Usuário desconectdo com sucesso')
        navigateTo('/')
    }
} */
const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Painel',
  to: '/painel',
  icon: 'i-lucide-house',
  active: route.path.startsWith('/painel')
}, {
  label: 'Grupos',
  to: '/grupos',
  icon: 'i-lucide-users',
  active: route.path.startsWith('/grupos')
}, {
  label: 'Jogos',
  icon: 'i-lucide-dices',
  to: '/jogos',
    active: route.path.startsWith('/jogos')
}, {
  label: 'Estatísticas',
  icon: 'i-lucide-chart-bar',
  to: '/estatisticas',
  active: route.path.startsWith('/estatisticas')
}])
console.log(usuario)
</script>
<template>
    <UHeader title="Cestinha">
        <UNavigationMenu :items="[items]" />
        <template #right>
            <UAvatar v-if="user" :name="usuario?.nome || usuario?.email" :alt="usuario?.nome"
            @click="signOut(auth!)" />
        </template>
    </UHeader>
</template>