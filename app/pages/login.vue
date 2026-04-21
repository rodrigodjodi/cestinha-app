<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

// define o layout padrao para essa página
definePageMeta({
  layout: 'login'
})

const auth = useFirebaseAuth()


const form = ref({
  email: '',
  senha: '',
})

const carregando = ref(false)

async function entrar() {
  try {
    carregando.value = true
    if (!auth) throw new Error('Firebase Auth não disponível')
    await signInWithEmailAndPassword(auth, form.value.email, form.value.senha)
    navigateTo('/grupos')
  } catch (e) {
    console.error('Erro ao entrar:', e)
    alert('Email ou senha inválidos.')
  } finally {
    carregando.value = false
  }
}
onMounted(() => {
  carregando.value = true
  if (auth && auth.currentUser) {
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

      <UForm :state="form" @submit.prevent="entrar">
        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="form.email" type="email" placeholder="voce@email.com" required />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="form.senha" type="password" placeholder="Sua senha" required />
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
