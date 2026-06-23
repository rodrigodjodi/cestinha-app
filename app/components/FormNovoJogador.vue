<script setup lang="ts">
import type { FetchError } from 'ofetch'
import {
  criarJogadorInputSchema,
  type CriacaoJogador,
  type Jogador,
} from '~/schemas/jogador.schema'
import { criarJogador } from '~/services/jogador.service'
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'

const props = defineProps<{
  jogadorLogado: Jogador
  grupoId: string
}>()

const criacaoJogadorFormState = reactive<Partial<CriacaoJogador>>({
  nome: '',
  grupoId: props.grupoId,
  atribuicao: 'avulso',
})
const serverErrors = ref<Record<string, string>>({})

function mensagemErro(error: unknown) {
  const fetchError = error as FetchError<{ message?: string }>
  return fetchError.data?.message
    ?? 'Não foi possível criar o jogador.'
}

async function handleCriarJogador(event: FormSubmitEvent<CriacaoJogador>) {
  serverErrors.value = {}
  try {
    await criarJogador(event.data)
    criacaoJogadorFormState.nome = ''
  } catch (error) {
    serverErrors.value.nome = mensagemErro(error)
  }
}

function handleFormError(event: FormErrorEvent) {
  console.error(event.errors)
}

const items = [
  { label: 'Membro', value: 'membro' },
  { label: 'Avulso', value: 'avulso' },
]
</script>

<template>
  <UForm :schema="criarJogadorInputSchema" :state="criacaoJogadorFormState"
    @submit.prevent="handleCriarJogador"
    :disabled="props.jogadorLogado.atribuicao === 'avulso'"
    @error="handleFormError"
  >
    <UFormField label="Novo jogador" name="nome" :error="serverErrors.nome">
      <UInput placeholder="Apelido novo jogador..." v-model="criacaoJogadorFormState.nome">
        <template #trailing>
        </template>
      </UInput>
      <UButton icon="i-lucide-plus" size="xs" type="submit" 
        class="disabled:opacity-40 ml-3" />
    </UFormField>
    <URadioGroup v-model="criacaoJogadorFormState.atribuicao" class="mt-2"
      orientation="horizontal" variant="list" :items="items" />
  </UForm>
</template>
