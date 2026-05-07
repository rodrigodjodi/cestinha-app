<script setup lang="ts">
import { baseJogadorSchema, type CriacaoJogador } from '~/schemas/jogador.schema';
import type { FormSubmitEvent, FormErrorEvent } from "@nuxt/ui";
import { doc, setDoc, collection } from 'firebase/firestore'
const props = defineProps(['grupoId'])
// composables
const db = useFirestore();


// state
const criacaoJogadorFormState = reactive<Partial<CriacaoJogador>>({
  nome: "",
  grupoId: props.grupoId,
  usuarioId: null,
});
// computed
const nomeJogadorValido = computed(() => {
  return baseJogadorSchema.safeParse(criacaoJogadorFormState).success
})
// actions
async function criarJogador(event: FormSubmitEvent<CriacaoJogador>) {
  console.log("[CardJogadores] Form submitted with data: ", event.data);
  try {
    const jogadorRef = doc(collection(db, "jogadores"));
    await setDoc(jogadorRef, event.data);
  } catch (e) {
    console.error("Erro ao criar grupo:", e);
  } finally {
    criacaoJogadorFormState.nome = "";
  }
}
function handleFormError(e: FormErrorEvent) {
  console.error(e);
}
</script>

<template>
  <UForm :schema="baseJogadorSchema" :state="criacaoJogadorFormState" @submit.prevent="criarJogador"
    @error="handleFormError">
    <UFormField label="Novo jogador" name="nome">
      <UInput placeholder="Apelido novo jogador..." size="xl" v-model="criacaoJogadorFormState.nome">
        <template #trailing>
          <UButton icon="i-lucide-plus" size="xs" type="submit" :disabled="!nomeJogadorValido"
            class="disabled:opacity-40" />
        </template>
      </UInput>
    </UFormField>
  </UForm>
</template>