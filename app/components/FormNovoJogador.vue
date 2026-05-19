<script setup lang="ts">
import { baseJogadorSchema, type CriacaoJogador, type Jogador } from '~/schemas/jogador.schema';
import type { FormSubmitEvent, FormErrorEvent } from "@nuxt/ui";
import { apiFetch } from '@/services/apiFetch'
const props = defineProps<{
  grupoId: string,
  jogadorLogado: MaybeRefOrGetter<Jogador | null>
}>()

// state
const criacaoJogadorFormState = reactive<Partial<CriacaoJogador>>({
  nome: "",
  grupoId: props.grupoId,
  usuarioId: null,
  atribuicao: 'avulso'
});
const serverErrors = ref<Record<string, string>>({});
// computed
const nomeJogadorValido = computed(() => {
  return baseJogadorSchema.safeParse(criacaoJogadorFormState).success
})
// actions
async function criarJogador(event: FormSubmitEvent<CriacaoJogador>) {
  serverErrors.value = {}
  console.log("[CardJogadores] Form submitted with data: ", event.data);
  try {
    await apiFetch('/api/jogadores/criar', {
      method: 'POST',
      body: event.data
    });
  } catch (e:any) {
    console.error("Erro ao criar jogador:", e.data.message);
    serverErrors.value.nome = e.data.message
  } finally {
    criacaoJogadorFormState.nome = "";
  }
}
function handleFormError(e: FormErrorEvent) {
  console.error(e);
}
const items = computed(()=>[
  { label: "Admin", value:"admin", disabled: props.jogadorLogado?.atribuicao !== 'admin' },
  { label: "Membro", value:"membro", disabled: false },
  { label: "Avulso", value:"avulso", disabled: false },
])
</script>

<template>
  <UForm :schema="baseJogadorSchema" :state="criacaoJogadorFormState" @submit.prevent="criarJogador"
  :disabled="props.jogadorLogado?.atribuicao === 'avulso'" @error="handleFormError">
    <UFormField label="Novo jogador" name="nome" :error="serverErrors.nome">
      <UInput placeholder="Apelido novo jogador..." size="xl" v-model="criacaoJogadorFormState.nome"
      >
        <template #trailing>
          <!-- <UButton icon="i-lucide-plus" size="xs" type="submit" :disabled="!nomeJogadorValido"
            class="disabled:opacity-40" /> -->
        </template>
      </UInput>
    </UFormField>
    <URadioGroup v-model="criacaoJogadorFormState.atribuicao" class="mt-2" orientation="horizontal" variant="list"  :items="items" />
  </UForm>
</template>