<script setup lang="ts">

import { useFirebaseAuth } from 'vuefire'
import type { NavigationMenuItem } from '@nuxt/ui'
const pageTitle = useState('pageTitle', () => 'Carregando...')
const auth = useFirebaseAuth()
const user = useCurrentUser()
const route = useRoute()
const { sair } = useFirebaseUser()



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
  label: 'Dias',
  icon: 'i-lucide-calendar',
  to: '/dias',
    active: route.path.startsWith('/dias')
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

</script>
<template>
    <UHeader title="Cestinha">
        <UNavigationMenu :items="[items]" />
        <template #right>
            <UAvatar v-if="user" :name="user.displayName || user.email" :alt="user.displayName!"
            @click="sair" />
        </template>
    </UHeader>
</template>