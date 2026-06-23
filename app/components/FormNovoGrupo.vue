<script setup lang="ts">
import type { FetchError } from 'ofetch'
import {
  criacaoGrupoSchema,
  type FormCriacaoGrupo,
} from '~/schemas/grupo.schema'
import { criarGrupo } from '~/services/grupo.service'
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{
  close: []
}>()
const toast = useToast()
const formState = reactive<Partial<FormCriacaoGrupo>>({
  nome: '',
  apelido: '',
})
const carregando = ref(false)

function mensagemErro(error: unknown) {
  const fetchError = error as FetchError<{ message?: string }>
  return fetchError.data?.message
    ?? 'Não foi possível criar o grupo. Tente novamente.'
}

async function handleCriarGrupo(event: FormSubmitEvent<FormCriacaoGrupo>) {
  carregando.value = true
  try {
    await criarGrupo(event.data)
    toast.add({
      title: 'Grupo criado',
      color: 'success',
    })
    emit('close')
  } catch (error) {
    toast.add({
      title: 'Erro ao criar grupo',
      description: mensagemErro(error),
      color: 'error',
    })
  } finally {
    carregando.value = false
  }
}

function handleFormError(event: FormErrorEvent) {
  console.error('Erros de validação:', event.errors)
}
</script>

<template>
    <UForm :state="formState" :schema="criacaoGrupoSchema"
        @submit.prevent="handleCriarGrupo" @error="handleFormError">
        <UFormField label="Nome do grupo" class="mb-4" name="nome" >
            <UInput v-model="formState.nome"  />
        </UFormField>
        <UFormField label="Apelido no grupo" class="mb-4" name="apelido">
            <UInput v-model="formState.apelido" placeholder="Seu apelido como jogador" />
        </UFormField>
        <UButton type="submit" :loading="carregando" class="w-full">Criar grupo</UButton>
    </UForm>
</template>
