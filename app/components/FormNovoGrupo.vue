<script setup lang="ts">
import { criacaoGrupoSchema, type FormCriacaoGrupo } from '~/schemas/grupo.schema';
import type { FormSubmitEvent } from "@nuxt/ui";

const emits = defineEmits(['close'])
const formState = reactive<Partial<FormCriacaoGrupo>>({
    nome: "",
    apelido: ""
})
const carregando = ref(false)
async function criarGrupo(event: FormSubmitEvent<FormCriacaoGrupo>) {
    console.log("Criando grupo com dados:", event.data)
    try {
        carregando.value = true
        const result = await useCriacaoGrupo(event.data)
        console.log(result)
        
    } catch (error) {
        console.error("Erro ao criar grupo:", error)
    } finally {
        carregando.value = false
        emits('close')
    }
}
function handleFormError(errors: any) {
    console.log("Erros de validação:", errors)
}
</script>

<template>
    <UForm :state="formState" :schema="criacaoGrupoSchema"   @submit.prevent="criarGrupo" @error="handleFormError">
        <UFormField label="Nome do grupo" class="mb-4" name="nome" >
            <UInput v-model="formState.nome"  />
        </UFormField>
        <UFormField label="Apelido no grupo" class="mb-4" name="apelido">
            <UInput v-model="formState.apelido" placeholder="Seu apelido como jogador" />
        </UFormField>
        <UButton type="submit" :loading="carregando" class="w-full">Criar grupo</UButton>
    </UForm>
</template>