<script setup lang="ts">
import { youtubeSchema, type Youtube } from '~/schemas/youtube.schema'
import { anexarVideoYoutube } from '~/services/anexarVideoYoutube'
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  jogoId: string
  grupoId: string
}>()

const toast = useToast()
const formState = reactive<Partial<Youtube>>({
  videoUrl: '',
})
const serverErrors = ref<Record<string, string>>({})
const carregando = ref(false)

async function atualizarDoc(event: FormSubmitEvent<Youtube>) {
  serverErrors.value = {}
  carregando.value = true
  try {
    await anexarVideoYoutube({
      jogoId: props.jogoId,
      grupoId: props.grupoId,
      youtubeId: event.data.videoUrl,
    })
  } catch (error) {
    console.error('Erro ao anexar vídeo:', error)
    serverErrors.value.videoUrl = 'Não foi possível anexar o vídeo.'
  } finally {
    carregando.value = false
  }
}

function handleFormError(event: FormErrorEvent) {
  console.error(event.errors)
}
</script>

<template>
  <UForm :schema="youtubeSchema" :state="formState" @submit.prevent="atualizarDoc" @error="handleFormError">
    <UFormField name="videoUrl" label="Video do youtube" :error="serverErrors.videoUrl">
      <UInput v-model="formState.videoUrl" placeholder="Cole a URL do youtube" size="xl" class="w-full" />
    </UFormField>
    <div class="mt-4 flex justify-end">
      <UButton type="submit" label="Salvar vídeo" :loading="carregando" />
    </div>
  </UForm>
</template>
