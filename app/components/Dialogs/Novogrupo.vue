<script setup lang="ts">
import { useCurrentUser, useFirestore, useCollection } from 'vuefire'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import useSlug from '~/composables/slug'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import {grupoSchema} from '~/schemas/grupo.schema'
import type  {Grupo} from '~/schemas/grupo.schema'
const db = useFirestore()
const user = useCurrentUser()
const toast = useToast()
const emit = defineEmits(['fechar'])
const formState = reactive<Partial<Grupo>>({
  nome: 'ytyt',
  /* local: {
    nome: '',
    endereco: '',
    coordenadas: { lat: 0, lng: 0 },
  }, 
  apelido: ''*/
})
const idGrupo = computed(() => useSlug(formState.nome))
const carregando = ref(false)
function errorToast(e: Error) {
  toast.add({
    title: 'Erro ao criar grupo',
    description: e.message,                   
    color: 'error'
  })
}
async function criarGrupo() {
  if (!user.value) return

  try {
    carregando.value = true

    const jogadorId = nanoid()
    const docRefGrupo = doc(db, 'grupos', idGrupo.value)
    
    await setDoc(docRefGrupo, {
      nome: formState.nome,
      local: formState.local,
      jogadores: [jogadorId],
      jogos: []
    })

    await setDoc(doc(db, 'jogadores', jogadorId), {
      nome: formState.nome,
      // apelido: formState.apelido,
      grupoId: idGrupo.value,
      usuarioId: user.value.uid
    })
    emit('fechar')
    navigateTo(`/grupos/${idGrupo.value}`)
  } catch (e) {
    console.error('Erro ao criar grupo:', e)
    errorToast(e as Error)
  } finally {
    carregando.value = false
  }
}
const validate = async (state: any): Promise<FormError[]> => {
  const errors = []
  const docRefGrupo = doc(db, 'grupos', idGrupo.value)
  const docGrupo = await getDoc(docRefGrupo)
  if (docGrupo.exists()) {
    errors.push({ name: 'nomeGrupo', message: 'Já existe um grupo com esse nome. Escolha outro.' })
  }
  return errors
}
</script>

<template>
  <UForm :schema="grupoSchema" :validate="validate" :state="formState" @submit.prevent="criarGrupo">
    <UFormField label="Nome do grupo *" class="mb-4" name="nomeGrupo" :validate-on="['blur', 'submit']">
      <UInput v-model="formState.nome" required />
    </UFormField>
    <!-- <UFormField label="Apelido no grupo *" class="mb-4">
      <UInput v-model="formState.apelido" placeholder="Seu apelido como jogador" required />
    </UFormField> -->
    <!-- Local ainda não precisa ser obrigatório -->
    <!-- <UFormField label="Local *" class="mb-4">
      <UInput v-model="formState.local.nome" placeholder="Nome da quadra ou ginásio" required />
    </UFormField> 

    <UFormField label="Endereço" class="mb-4">
      <UInput v-model="formState.local.endereco"/>
    </UFormField> -->
    <UButton type="submit" :loading="carregando" class="w-full">Criar grupo</UButton>
  </UForm>
</template>