<script setup lang="ts">
import { loginSchema } from '~/schemas/auth.schema'
// defines, emits, props, injections
definePageMeta({ layout: 'login'})

// composables
const { loginFormState, carregando, serverErrors, handleFormError, entrar} = useFirebaseUser()
const route = useRoute()
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <p v-if="carregando">Caregando...</p>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Entrar</h2>
      </template>

      <UForm :state="loginFormState" :schema="loginSchema" @submit.prevent="entrar" @error="handleFormError">
        <UFormField label="Email" name="email" class="mb-4" :error="serverErrors.email">
          <UInput v-model="loginFormState.email"  />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6" :error="serverErrors.senha">
          <UInput v-model="loginFormState.senha" type="password"   />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full" >
          Entrar
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-sm text-center">
          Não tem conta? <NuxtLink :to="{path: '/registrar', query: { redirect: route.query.redirect }}"
           class="underline">Criar conta</NuxtLink>
        </div>
        <div class="text-sm text-center">
          Esqueceu sua senha? <NuxtLink to="/redefinir-senha" class="underline">Redefinir senha</NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
