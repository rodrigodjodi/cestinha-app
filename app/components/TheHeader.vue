<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const pageTitle = useState<string>('pageTitle')
const user = useCurrentUser()
const { sair } = useFirebaseUser()


const userMenuItems: DropdownMenuItem[] = [
  { label: 'Sair', icon: 'i-lucide-log-out', onSelect: sair }
]
</script>

<template>
  <UHeader :title="pageTitle" to="/painel" :toggle="false"
  :ui="{container:'max-w-full'}">
    <template #right>
      <UDropdownMenu :items="userMenuItems">
        <UButton color="neutral" variant="ghost">
          <UAvatar v-if="user"
            :name="user.displayName || user.email"
            :alt="user.displayName!" />
        </UButton>
      </UDropdownMenu>
    </template>
  </UHeader>
</template>