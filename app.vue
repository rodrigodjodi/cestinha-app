<script setup lang="ts">
// define o template do título da página; ao título de cada página será adicionado " - Cestinha"
useHead({
  titleTemplate: '%s - Cestinha',
})
// controle de autenticação do usuário
/* const user = useCurrentUser()
watch(user, (newUser) => {
  console.log(' watcher do user disparou...', newUser)
  if (!newUser) {
    // se estiver em uma página autenticada manda para o login
    console.log(' o watcher vai mandar pro login')
    navigateTo('/login')

  } else {
    console.log(' o watcher vai mandar pro grupos')
    navigateTo('/grupos')

  }
}, { immediate: true }) */
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
