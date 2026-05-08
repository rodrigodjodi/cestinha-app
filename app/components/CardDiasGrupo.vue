<script setup lang="ts">
import { doc, setDoc, collection, deleteDoc } from 'firebase/firestore'
import { CalendarDate, type DateValue } from '@internationalized/date'
const db = useFirestore()
const route = useRoute()
const diaSelecionado = shallowRef<CalendarDate>()
const grupoId = computed(() => route.params.grupo as string)
async function criarDia() {
  const diaRef = doc(collection(db, 'dias'))
  const payload = {
    grupoId: grupoId.value,
    presencas: [],
    data: diaSelecionado.value?.toString()
  }

  await setDoc(diaRef, payload)
  await navigateTo(`/dias/${idDiaSelecionado.value}`)
}
const diasGrupo = useListaDiasGrupo(grupoId)
const listaDatas = computed(()=>diasGrupo.value.map(el=>el.data))
function diaTeveJogo(date:string){
  return listaDatas.value.includes(date)
}
const idDiaSelecionado = computed(()=>{
  let dia = diasGrupo.value.find(el=>el.data === diaSelecionado.value?.toString())
  return dia ? dia.id : undefined
})
console.log(diaSelecionado)
console.log(diasGrupo)
async function excluirDia(){
  let diaExcluir = diasGrupo.value.find(el=>el.data === diaSelecionado.value?.toString())
  if(diaExcluir?.id){
    await deleteDoc(doc(db, 'dias', diaExcluir.id))
    useToast().add({
      title: 'Sucesso!', color: 'success',
      description:'Dia excluído'
    })
  }
}
</script>

<template>
  <UCard title="Calendário Grupo">
    <UCalendar v-model="diaSelecionado">
      <template #day="{ day }">
        <UChip :show="diaTeveJogo(day.toString())" >
          {{ day.day }}
        </UChip>
      </template>

    </UCalendar>
    <template #footer>
      <UButton v-if="idDiaSelecionado" :disabled="!diaSelecionado"
        @click="excluirDia" color="error">
        Excluir dia
      </UButton>
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