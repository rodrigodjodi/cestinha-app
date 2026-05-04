<script setup lang="ts">
import { recoverPasswordSchema } from '../schemas/auth.schema'
const { redefinirSenha, recoverPasswordFormState, carregando, handleFormError, serverErrors } = useFirebaseUser()
// define o layout padrao para essa página
definePageMeta({
  layout: 'login'
})

</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Redefinir senha</h2>
      </template>

      <UForm :state="recoverPasswordFormState" :schema="recoverPasswordSchema"
       @submit.prevent="redefinirSenha" @error="handleFormError">
        <UFormField label="Email" name="email" class="mb-4" :error="serverErrors.email">
          <UInput v-model="recoverPasswordFormState.email" />
        </UFormField>


        <UButton type="submit" :loading="carregando" class="w-full">
          {{carregando ? 'Enviando email de redefinição de senha...' : 'Redefinir senha'}}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Você receberá um link no email informado para redefinir sua senha. Caso não queira mais redefinir a senha, basta ignorar o email.
        </div>
        <!-- botao para ir para login -->
        <div class="text-sm text-center">
          <NuxtLink to="/entrar" class="underline">Voltar para login</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
