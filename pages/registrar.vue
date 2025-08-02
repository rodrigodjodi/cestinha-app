<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useFirebaseAuth, useFirestore } from 'vuefire'
import { doc, setDoc } from 'firebase/firestore'
definePageMeta({
  layout: 'login'
})
const auth = useFirebaseAuth()
const db = useFirestore()

const route = useRoute()
const router = useRouter()
const conviteToken = route.query.convite?.toString()

const form = ref({
  nome: '',
  email: '',
  senha: '',
})

const carregando = ref(false)

async function registrar() {
  try {
    carregando.value = true

    if (!auth) throw new Error('Firebase Auth não disponível')

    const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.senha)
    await updateProfile(cred.user, { displayName: form.value.nome })

    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nome: form.value.nome,
      email: form.value.email,
      criadoEm: new Date(),
    })

    if (conviteToken) {
      router.push(`/claim?convite=${conviteToken}`)
    } else {
      router.push('/grupos')
    }
  } catch (e) {
    console.error('Erro ao registrar:', e)
    alert('Não foi possível criar sua conta. Tente novamente.')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Criar conta</h2>
      </template>

      <UForm :state="form" @submit.prevent="registrar">
        <UFormField label="Nome" name="nome" class="mb-4">
          <UInput v-model="form.nome" placeholder="Seu nome ou apelido" required />
        </UFormField>

        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="form.email" type="email" placeholder="voce@email.com" required />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="form.senha" type="password" placeholder="Crie uma senha" required />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full">
          Criar conta
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Já tem conta? <NuxtLink to="/login" class="underline">Entrar</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
