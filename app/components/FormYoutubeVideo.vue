<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import {youtubeSchema, type Youtube}  from '~/schemas/youtube.schema'
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits(['close'])
const db = useFirestore()
const route = useRoute()
const formState = reactive<Partial<Youtube>>({
  videoUrl: ''
})
async function atualziarDoc(event: FormSubmitEvent<Youtube>){
  console.log("form enviado com dados: ", event.data)
  const jogoRef = doc(db, 'jogos', route.params.jogo as string)
  await updateDoc(jogoRef, {
    videoId: event.data.videoUrl
  })
  emit('close')
}
function handleFormError(e) {
  console.error(e)
}
</script>

<template>
    <UForm :schema="youtubeSchema" :state="formState"
    @submit="atualziarDoc" @error="handleFormError">
        <UFormField name="videoUrl" label="Video do youtube">
            <UInput v-model="formState.videoUrl" placeholder="Cole a URL do youtube" size="xl"/>
        </UFormField>
        <div class="mt-4 flex justify-end">
            <UButton
              type="submit"
              label="Salvar vídeo"
            />
          </div>
    </UForm>
</template>