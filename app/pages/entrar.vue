<script setup lang="ts">
import { useFirebaseAuth } from 'vuefire'
import { loginSchema } from '~/schemas/auth.schema'
// defines, emits, props, injections
definePageMeta({ layout: 'login'})

// composables
const auth = useFirebaseAuth()
//stores
const usuarioStore = useUsuarioStore()
// state
const { carregando, loginFormState } = storeToRefs(usuarioStore)
// actions
const {entrar} = usuarioStore



onMounted(() => {
  if (auth && auth.currentUser) {
    carregando.value = true
    navigateTo('/painel')
  }
  carregando.value = false
})

onUnmounted(() => {
  console.log('Componente de login desmontado')
})
function handleFormError(errors: any) {
  console.error('Erros de validação:', errors)
  
}
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <p v-if="carregando">Caregando...</p>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Entrar</h2>
      </template>

      <UForm :state="loginFormState" :schema="loginSchema" @submit.prevent="entrar" @error="handleFormError">
        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="loginFormState.email" placeholder="voce@email.com" />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="loginFormState.senha" type="password" placeholder="Sua senha"  />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full" >
          Entrar
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Não tem conta? <NuxtLink to="/registrar" class="underline">Criar conta</NuxtLink>
        </div>
        <div class="text-sm text-center">
          Esqueceu sua senha? <NuxtLink to="/redefinir-senha" class="underline">Redefinir senha</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
