<script setup lang="ts">
import { usuarioSchema } from '../schemas/usuario'
// defines, emits, props, injections
definePageMeta({ layout: 'login' })
// composables
const usuarioStore = useUsuarioStore()
// state
const { carregando, registerFormState } = storeToRefs(usuarioStore)
// actions
const {registrar} = usuarioStore
</script>

<template>
  <UContainer class="py-10 max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Criar conta</h2>
      </template>

      <UForm :state="registerFormState" :schema="usuarioSchema" @submit.prevent="registrar">
        <UFormField label="Nome" name="nome" class="mb-4">
          <UInput v-model="registerFormState.nome" placeholder="Nome para saudação no app" />
        </UFormField>

        <UFormField label="Email" name="email" class="mb-4">
          <UInput v-model="registerFormState.email" type="email" placeholder="voce@email.com" required />
        </UFormField>

        <UFormField label="Senha" name="senha" class="mb-6">
          <UInput v-model="registerFormState.senha" type="password" placeholder="Crie uma senha" required />
        </UFormField>

        <UButton type="submit" :loading="carregando" class="w-full">
          Criar conta
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
