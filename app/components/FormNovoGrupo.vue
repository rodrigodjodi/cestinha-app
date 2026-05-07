<script setup lang="ts">
import { criacaoGrupoSchema, type CriacaoGrupo } from '~/schemas/grupo.schema';
import type { FormSubmitEvent } from "@nuxt/ui";
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
// define a close emitter para fechar o modal após a criação do grupo
const emits = defineEmits(['close'])
const db = useFirestore()
const { uid } = storeToRefs(useUsuarioStore())
const formState = reactive<Partial<CriacaoGrupo>>({
    nome: "",
    usuarios: [uid.value!],
    apelido: ""
})
const carregando = ref(false)
async function criarGrupo(event: FormSubmitEvent<CriacaoGrupo>) {
    console.log("Criando grupo com dados:", event.data)
    try {
        carregando.value = true
        const batch = writeBatch(db)
        const grupoRef = doc(collection(db, 'grupos'))
        // criacao do grupo
        batch.set(grupoRef, {
            nome: event.data.nome,
            usuarios: event.data.usuarios,
            criadoPor: uid.value,
            criadoEm: serverTimestamp()
        })
        // criacao do jogador para o usuario que criou o grupo
        const jogadorRef = doc(collection(db, 'jogadores'))
        batch.set(jogadorRef, {
            usuarioId: uid.value,
            grupoId: grupoRef.id,
            nome: event.data.apelido,
            criadoEm: serverTimestamp()
        })
        await batch.commit()
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