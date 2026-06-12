<script setup lang="ts">
import { youtubeSchema, type Youtube } from '~/schemas/youtube.schema'
import type { FormSubmitEvent } from "@nuxt/ui";
import { apiFetch } from '@/services/apiFetch'
const props = defineProps<{
  jogoId: string
}>()
const formState = reactive<Partial<Youtube>>({
  videoUrl: '',
  jogoId: props.jogoId
})
const serverErrors = ref<Record<string, string>>({});
// serverErrors.value.videoUrl = "teste"
async function atualizarDoc(event: FormSubmitEvent<Youtube>) {
  console.log("form enviado com dados: ", event.data)
  serverErrors.value = {}
  try {
    await apiFetch('/api/jogos/anexar-video', {
      method: 'POST',
      body: event.data
    });
  } catch (error) {
    serverErrors.value.videoUrl = error.code
    console.error("Erro ao anexar video: ", error.code)
  }
}
function handleFormError(e) {
  console.error(e)
}
</script>

<template>
  <UForm :schema="youtubeSchema" :state="formState" @submit.prevent="atualizarDoc" @error="handleFormError">
    <UFormField name="videoUrl" label="Video do youtube" :error="serverErrors.videoUrl">
      <UInput v-model="formState.videoUrl" placeholder="Cole a URL do youtube" size="xl" class="w-full" />
    </UFormField>
    <div class="mt-4 flex justify-end">
      <UButton type="submit" label="Salvar vídeo" />
    </div>
  </UForm>
</template>