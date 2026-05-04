<script setup lang="ts">
import { signupSchema } from '../schemas/auth.schema'
// defines, emits, props, injections
definePageMeta({ layout: 'login' })
// composables
const { registrar, registerFormState, carregando, handleFormError, serverErrors } = useFirebaseUser()


</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Criar conta</h2>
      </template>

      <UForm :state="registerFormState" :schema="signupSchema" 
      @submit.prevent="registrar" @error="handleFormError" >
        <UFormField label="Nome" name="nome" class="mb-4">
          <UInput v-model="registerFormState.nome" placeholder="Nome para saudação no app" />
        </UFormField>

        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="registerFormState.email" type="email" :error="serverErrors.email" />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="registerFormState.senha" type="password" :error="serverErrors.senha" />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full">
          {{ carregando ? 'Criando conta...' : 'Criar conta' }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Já tem conta? <NuxtLink to="/entrar" class="underline">Entrar</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
