<script setup lang="ts">
import { signupSchema } from '../schemas/auth.schema'
// defines, emits, props, injections
definePageMeta({ layout: 'login' })
// composables
const { registrar, registerFormState, carregando, handleFormError, serverErrors } = useFirebaseUser()

const route = useRoute()
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Criar conta</h2>
        <p v-if="route.query.redirect" class="text-muted">Para usar seu convite, crie uma conta preenchendo os campos abaixo:</p>
      </template>
      <UForm :state="registerFormState" :schema="signupSchema" 
      @submit.prevent="registrar" @error="handleFormError" >
        <UFormField label="Nome" name="nome" class="mb-4">
          <UInput v-model="registerFormState.nome" placeholder="Nome para saudação no app" />
        </UFormField>

        <UFormField label="Email" name="email" class="mb-4" :error="serverErrors.email">
          <UInput v-model="registerFormState.email" type="email"  />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6" :error="serverErrors.senha">
          <UInput v-model="registerFormState.senha" type="password"  />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full">
          {{ carregando ? 'Criando conta...' : 'Criar conta' }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Já tem conta? <NuxtLink :to="{
        path: '/entrar',
        query: { redirect: route.query.redirect }
      }" class="underline">Entrar</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
