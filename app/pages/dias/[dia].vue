<script setup lang="ts">
import { error } from '#build/ui'
import { doc } from 'firebase/firestore'
const db = useFirestore()
const route = useRoute()
const dia = useDocument(doc(db, 'dias', route.params.dia as string))
const toast = useToast()
const grupoId = computed(() => dia.value?.grupoId)
const jogadores = useListaJogadores(grupoId)
const searchVal = ref('')

const listaNomes = computed(() => jogadores.value?.map(el => el.nome))
const inscritos = ref([])
function inscreverJogador() {
  console.log(searchVal.value)
  if (listaNomes.value.includes(searchVal.value)) {
    inscritos.value.push(searchVal.value) // todo: criar objeto de inscrito e salvar no banco
    searchVal.value = ''
  } else {
    // todo: crair modal oferecendo para criar o jogador
    toast.add({
      title: 'Jogador não existe, criar?',
      description: "Verifique grafia ou clique para criar jogador no grupo",
      color: 'error',
      icon: 'i-lucide-x-circle',
      actions: [{
        icon: 'i-lucide-refresh-cw',
        label: 'Criar jogador',
        color: 'success',
        variant: 'outline',
        onClick: async (e) => {
          try{
            await useCriacaoJogador({
              nome: searchVal.value,
              grupoId: grupoId.value,
              usuarioId: null,
            })
          } catch (e) {e=> console.error(e)}
        }
      }]
    })
    searchVal.value = ''
  }
}

</script>
<template>
  <UCard :title="`Lista Basquete ${new Date(dia?.data).toLocaleDateString()}`">
    <UForm @submit="inscreverJogador">
      <UFormField>
        <UInputMenu v-model="searchVal" autocomplete :items="listaNomes" :trailing-icon="false"
          :content="{ hideWhenEmpty: true }" placeholder="Nome jogador..." />
      </UFormField>
    </UForm>
    <!-- <template #footer>
            <FormNovoJogador :grupo-id="grupoId"/>
        
        </template> -->
  </UCard>




  <pre>{{ dia }}</pre>
  <pre>{{ inscritos }}</pre>
  <pre>{{ jogadores }}</pre>
</template>