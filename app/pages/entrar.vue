<script setup lang="ts">
import { signInWithEmailAndPassword } from 'firebase/auth'
import type { AuthError } from 'firebase/auth'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useFirebaseAuth } from 'vuefire'
import { usuarioSchema } from '~/schemas/usuario'
import type { Usuario } from '~/schemas/usuario'
// defines, emits, props, injections
definePageMeta({ layout: 'login'})

// composables
const auth = useFirebaseAuth()
const toast = useToast()

// state
const carregando = ref(false)
const formState = reactive<Partial<Usuario>>({
  email: undefined,
  senha: undefined
})

async function entrar(event: FormSubmitEvent<LoginSchema>) {
  console.log('Formulário enviado com dados:', event.data)
  if (!auth) {
    toast.add({
      title: 'Erro',
      description: 'Firebase Auth não disponível. Tente novamente mais tarde.',
      color: 'error',
    })
    throw new Error('Firebase Auth não disponível')
  }
  try {
    carregando.value = true
    await signInWithEmailAndPassword(auth, event.data.email, event.data.senha)
    navigateTo('/grupos')
  } catch (e) {
    console.error(e)
    console.log(e.code)
    switch (e.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        toast.add({
        title: 'Erro',
        description: 'E-amil ou senha inválidos.',
        color: 'error',
      })
        break
      default:
        console.error('Erro ao entrar:', (e as AuthError).code, )
        toast.add({
          title: 'Erro',
          description: 'Ocorreu um erro ao tentar entrar. Tente novamente mais tarde.',
          color: 'error',
        })
    }
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  if (auth && auth.currentUser) {
    carregando.value = true
    navigateTo('/grupos')
  }
  carregando.value = false
})

onUnmounted(() => {
  console.log('Componente de login desmontado')
})
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <p v-if="carregando">Caregando...</p>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Entrar</h2>
      </template>

      <UForm :state="state" :schema="loginSchema" @submit.prevent="entrar">
        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="state.email" placeholder="voce@email.com" />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="state.senha" type="password" placeholder="Sua senha"  />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full">
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
