<script setup lang="ts">
import { deleteField } from 'firebase/firestore'
import { VueDraggableNext, type DragEvent } from 'vue-draggable-next'
const user = useCurrentUser()
const jogoStore = useJogoStore()
const toast = useToast()
const { timeA, timeB, banco, jogo } = storeToRefs(jogoStore)
type Colecao = 'A' | 'B' | 'banco'

                                 
const selecionados = ref<Record<Colecao, Set<string>>>({
  A: new Set(),
  B: new Set(),
  banco: new Set()
})

function toggleJogador(id: string, colecao: Colecao) {
  const set = selecionados.value[colecao]
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  console.log('selecionados: ', selecionados.value)
}
type AtualizacaoEscalacao = Record<string, { time: 'A' | 'B', ordem?: number }>

async function mover(origem:Colecao, destino: Colecao) {
  console.log(" funcao mover chamada")
  if (jogo.value?.anotadorId !== user.value?.uid) {
    toast.add({
      color: 'error',
      title: "Você não pode executr essa essa função",
    })
    return false
  }
  console.log('origem: ', origem)
  console.log('destino: ', destino)
  console.log('selecionados: ', selecionados)
  const ids = selecionados.value[origem]
  if (!ids.size) return
  const updates: AtualizacaoEscalacao = {}
  for (const id of ids) {
    // indo para banco = remove da escalacao
    if (destino === 'banco') {
      updates[`escalacao.${id}`] = deleteField()
    } else { // indo para time
      updates[`escalacao.${id}`] = {
        time: destino
      }
    }
  }
  console.log('updates', updates)
  await useJogoStore().gravarEscalacao(updates)

  // limpa apenas a origem
  selecionados.value[origem].clear()
}

async function handleDragChange(ev: DragEvent) {
  // console.log('added change: ', ev)
  console.log(" funcao drag chamada")
  if (jogo.value?.anotadorId !== user.value?.uid) {
    toast.add({
      color: 'error',
      title: "Você não pode executr essa essa função",
    })
    return false
  }
  const destino = ev.to.dataset.colecao
  console.log('colecao destino: ', destino)
  const jogadorId = ev.item.dataset.jogadorId
  console.log('id jogador: ', jogadorId)
  if (!destino || !jogadorId) return
   const updates: AtualizacaoEscalacao = {}

  if (destino === 'banco') {
    updates[`escalacao.${jogadorId}`] = deleteField()
  } else {
    updates[`escalacao.${jogadorId}`] = {
      time: destino
    }
  }
  await jogoStore.gravarEscalacao(updates)
}
</script>

<template>
  <UCard
  class="overflow-hidden h-full flex flex-col"
  :ui="{
    body: 'p-1 sm:p-1 flex flex-col flex-1 min-h-0'
  }"
>
    <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
      <!-- TIME A -->
      <ListaEscalacao colecao="A"
        titulo="Time A"
        color="primary"
        :jogadores="timeA"
        :selecionados="selecionados.A"
        :banco="selecionados.banco"
        @toggle="(id)=>toggleJogador(id, 'A')"
        @mover="mover"
        @add="handleDragChange"
      />

      <!-- AÇÕES -->
      <div class="flex items-center justify-center">
        <div class="flex flex-col gap-4">
          <UButton class="size-8  sm:size-10 py-8 justify-center"
            icon="i-lucide-arrow-right"
            square
            :disabled="!selecionados.A.size"
            @click=""
          />
          
          <UButton class="size-8  sm:size-10 py-8 justify-center"
            icon="i-lucide-arrow-left-right"
            square
            color="neutral"
            :disabled="false"
            @click=""
          />

          <UButton class="size-8  sm:size-10 py-8 justify-center"
            icon="i-lucide-arrow-left"
            square
            color="neutral"
            :disabled="!selecionados.B.size"
            @click=""
          />
        </div>
      </div>

      <!-- TIME B -->
      <ListaEscalacao
        colecao="B"
        titulo="Time B"
        color="error"
        :jogadores="timeB"
        :selecionados="selecionados.B"
        :banco="selecionados.banco"
        @toggle="(id)=>toggleJogador(id, 'B')"
        @mover="mover"
        @add="handleDragChange"
      />
    </div>

    <!-- PRESENÇAS: desde aqui preciso que ela tente preencher a tela -->
    <div class="mt-2 flex flex-col flex-1 min-h-0">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-medium">
          Presenças
        </h3>

        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ banco.length }}
        </UBadge>
      </div>
      
      <div class="flex-1 min-h-0">
        <vue-draggable-next
          :model-value="banco"
          group="jogadores"
          tag="div"
          :sort="false" 
          class="flex gap-2 basis-30 flex-wrap overflow-y-auto"
          
          @add="handleDragChange"
          item-key="id"
          data-colecao="banco"
        >
          <ItemJogadorSelecao
            v-for="jogador in banco"
            :key="jogador.id"
            :jogador="jogador"
            :selected="selecionados.banco.has(jogador.id)"
            @toggle="toggleJogador(jogador.id, 'banco')"
            :data-jogador-id="jogador.id"
          />
        </vue-draggable-next>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.jogadores-move,
.jogadores-enter-active,
.jogadores-leave-active {
  transition: all 250ms ease;
}

.jogadores-enter-from,
.jogadores-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.jogadores-leave-active {
  position: absolute;
}
</style>