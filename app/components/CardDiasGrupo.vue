<script setup lang="ts">
import { baseDiaSchema } from '~/schemas/dia.schema';
const props = defineProps<{
  /* diaId: MaybeRefOrGetter<string|undefined> */
  grupoId: MaybeRefOrGetter<string|undefined>
  
}>()
/* todo: deixei umas anotações para deixar o component menos acoplado,
usando uma prop eu posso consultar calendários de vários grupos numa mesma página*/
 
import { doc, setDoc, collection, deleteDoc } from 'firebase/firestore'
import { CalendarDate } from '@internationalized/date'
const db = useFirestore()
const diaSelecionado = shallowRef<CalendarDate>()
async function criarDia() {
  const diaRef = doc(collection(db, 'dias'))
  const payload = baseDiaSchema.parse({
    grupoId: toValue(props.grupoId),
    data: diaSelecionado.value?.toString()
    //  status e numJogos vem dos defaults do schema
  })
  console.log(payload)
  await setDoc(diaRef, payload) // todo: mover para rota /api/dias/criar
  await navigateTo(`/dias/${idDiaSelecionado.value}`)
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
// console.log(diaSelecionado)
// console.log(diasGrupo)
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
  <UCard title="Calendário">
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