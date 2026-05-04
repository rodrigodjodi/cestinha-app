<script setup lang="ts">
// defines, emits, props, injections
// define o template do título da página; ao título de cada página será adicionado " - Cestinha"
useHead({
  titleTemplate: '%s - Cestinha',
})
// composables
const user = useCurrentUser()
const route = useRoute()
// controle de autenticação do usuário
onMounted(() => { // garante execução apenas no cliente, evitando problemas de SSR
  watch(user, (newUser, prevUser) => {
    if (prevUser && !newUser) { // tinha um usuário, não tem mais: usuário deslogou
      // se estiver em uma página autenticada manda para o login com link de volta
      if (route.meta.middleware == 'auth'
        || (Array.isArray(route.meta.middleware) && route.meta.middleware.includes('auth'))
      ) {
        return navigateTo({ name: 'entrar', query: { redirect: route.fullPath } })
      }
    } else if (newUser && typeof route.query.redirect === 'string') {
      // se tiver um redirect, manda pra essa página
      return navigateTo(route.query.redirect)
    } else if (newUser) { // por padrão, entrar em painel se tiver um usuário
      return navigateTo('/painel')
    }
  })
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
