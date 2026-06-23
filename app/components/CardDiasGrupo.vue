<script setup lang="ts">
import { apiFetch } from "~/services/apiFetch";
import { CalendarDate } from '@internationalized/date'
const props = defineProps<{
  /* diaId: MaybeRefOrGetter<string|undefined> */
  grupoId: MaybeRefOrGetter<string|undefined>
  
}>()
const diaSelecionado = shallowRef<CalendarDate>()
async function criarDia() {
  const idDiaCriado = ref<string>()
  try {
    idDiaCriado.value = await apiFetch('/api/dias/criar', {
      method: 'POST',
      body: {
        grupoId: toValue(props.grupoId),
        data: diaSelecionado.value?.toString()
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    await navigateTo(`/dias/${idDiaCriado.value}`)
  }
  
}
const diasGrupo = useListaDiasGrupo(props.grupoId)
const listaDatas = computed(()=>diasGrupo.value.map(el=>el.data))
function diaTeveJogo(date:string){
  return listaDatas.value.includes(date)
}
const idDiaSelecionado = computed(()=>{
  let dia = diasGrupo.value.find(el=>el.data === diaSelecionado.value?.toString())
  return dia ? dia.id : undefined
})
</script>

<template>
  <UCard title="Calendário" :ui="{footer:'flex gap-2 justify-end'}">
    <UCalendar v-model="diaSelecionado">
      <template #day="{ day }">
        <UChip :show="diaTeveJogo(day.toString())" >
          {{ day.day }}
        </UChip>
      </template>

    </UCalendar>
    <template #footer >
      <UButton v-if="!listaDatas.includes(diaSelecionado?.toString())"
       :disabled="!diaSelecionado" @click="criarDia">
       Iniciar dia
      </UButton>
      <UButton v-if="idDiaSelecionado"
       :disabled="!diaSelecionado" :to="`/dias/${idDiaSelecionado}`">
       Ir para dia
      </UButton>
    </template>
  </UCard>
</template>
