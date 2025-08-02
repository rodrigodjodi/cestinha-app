<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

// define o layout padrao para essa página
definePageMeta({
  layout: 'login'
})

const auth = useFirebaseAuth()
const router = useRouter()

const form = ref({
  email: ''
})

const carregando = ref(false)

async function redefinirSenha() {
  try {
    carregando.value = true

    if (!auth) throw new Error('Firebase Auth não disponível')

    await sendPasswordResetEmail(auth, form.value.email)
    alert('Email de redefinição de senha enviado.')
  } catch (e) {
    console.error('Erro na tentativa de redefinição de senha:', e)
    alert('Email inválido.')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Redefinir senha</h2>
      </template>

      <UForm :state="form" @submit.prevent="redefinirSenha">
        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="form.email" type="email" placeholder="voce@email.com" required />
        </UFormField>


        <UButton type="submit" :loading="carregando" class="w-full">
          Redefinir senha
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Você receberá um link no email informado para redefinir sua senha. Caso não queira mais redefinir a senha, basta ignorar o email.
        </div>
        <!-- botao para ir para login -->
        <div class="text-sm text-center">
          <NuxtLink to="/login" class="underline">Voltar para login</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
