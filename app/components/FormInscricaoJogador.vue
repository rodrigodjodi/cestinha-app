<script setup lang="ts">
import { apiFetch } from "~/services/apiFetch";
import { type FormPresenca, type Presenca, formPresencaSchema } from "@/schemas/presenca.schema"
import type { Jogador } from "@/schemas/jogador.schema"
import type { FormSubmitEvent, FormErrorEvent } from "@nuxt/ui";
const props = defineProps<{
  diaId: MaybeRefOrGetter<string|undefined>
  grupoId: MaybeRefOrGetter<string|undefined>
  jogadores: Jogador[]
  presencas: Presenca[]
}>()

const inputJogador = useTemplateRef('nome-input')
const inscricaoFormState = reactive<Partial<FormPresenca>>({
  nome: "",
});
const serverErrors = ref<Record<string, string>>({});
// computed

//  lista com todos os jogadores menos os já inscritos par autocomplete
const listaNomes = computed(() => {
  const nomesInscritos = new Set(
    props.presencas.map(p => p.jogadorId)
  )
  return props.jogadores
    .filter(j => !nomesInscritos.has(j.id))
    .map(j => j.nome)
})
// console.log(listaNomes)
async function inscreverJogador(event: FormSubmitEvent<FormPresenca>) {
  console.log("form submited with data: ", event.data)
  // criar payload para o body da requisição, incluindo o jogadorId (procurar pelo nome), diaId e grupoId
  try {
    const jogadorId = props.jogadores.find(j => j.nome === event.data.nome)?.id
    if ( !jogadorId) {
      useToast().add({
        title: "Jogador não encontrado",
        description: "Use nomes da lista ou cadastre o jogador antes de inscrever.",
        color: "error",
      })
      return
    }
    await apiFetch('/api/presencas/inscrever', {
      method: 'POST',
      body: {
        jogadorId,
        diaId: props.diaId,
        grupoId: props.grupoId
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    inscricaoFormState.nome = ''
    await nextTick()
    // ! hack para funcionar o focus()
    requestAnimationFrame(() => {
      inputJogador.value?.inputRef?.focus()
    })
  }
}
function handleFormError(e: FormErrorEvent) {
  console.error(e);
}
</script>

<template>
  <UForm @submit="inscreverJogador" :schema="formPresencaSchema" :state="inscricaoFormState" @error="handleFormError">
    <UFormField name="nome" :error="serverErrors.nome" class="w-full">
      <UInputMenu v-model="inscricaoFormState.nome" ref="nome-input" autocomplete :items="listaNomes"
        :trailing-icon="false" :content="{ hideWhenEmpty: true }" placeholder="Inscrever jogador..."
       />
       <UButton type="submit" icon="i-lucide-check" size="sm"
       class="ml-3"/>
    </UFormField>
  </UForm>
</template>