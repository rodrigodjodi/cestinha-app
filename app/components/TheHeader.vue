<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
const pageTitle = useState('pageTitle', () => 'Carregando...')
const user = useCurrentUser()
const route = useRoute()
const { sair } = useFirebaseUser()

const navItems = computed<NavigationMenuItem[]>(() => [{
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
const userMenuItems:DropdownMenuItem[] = [
  {
    label: 'Sair', icon: 'i-lucide-log-out',
    onSelect: sair
  }
]
</script>

<template>
  <UHeader title="Cestinha">
    <UNavigationMenu :items="navItems" />
    <template #right>
      <UDropdownMenu :items="userMenuItems">
        <UButton color="neutral" variant="ghost">
          <UAvatar v-if="user" :name="user.displayName || user.email" :alt="user.displayName!" />
        </UButton>
      </UDropdownMenu>
    </template>
  </UHeader>
</template>