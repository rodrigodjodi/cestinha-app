<script setup lang="ts">
import type { Jogo } from '~/schemas/jogo.schema'
import { apagarJogo, renomearJogo } from '~/services/jogo.service'

const props = defineProps<{
  diaId: string
  grupoId: string | undefined
  jogos: Jogo[]
  pending: boolean
  error: unknown
}>()
const user = useCurrentUser()
const anotadorModel = ref(true)
const anotadorJogo = computed(() =>
  anotadorModel.value ? user.value?.uid ?? null : null
)
const { jogadorLogado } = useJogadorLogado(() => props.grupoId)
const toast = useToast()
const jogoSelecionado = ref<Jogo | null>(null)
const modalExclusaoAberto = ref(false)
const apagando = ref(false)
const modalRenomeacaoAberto = ref(false)
const novoNome = ref('')
const renomeando = ref(false)

function podeGerenciarJogo(jogo: Jogo) {
  return jogadorLogado.value?.atribuicao === 'admin'
    || jogo.anotadorId === user.value?.uid
}

function abrirConfirmacaoExclusao(jogo: Jogo) {
  jogoSelecionado.value = jogo
  modalExclusaoAberto.value = true
}

function abrirRenomeacao(jogo: Jogo) {
  jogoSelecionado.value = jogo
  novoNome.value = jogo.nome
  modalRenomeacaoAberto.value = true
}

async function confirmarExclusao() {
  if (!jogoSelecionado.value) return

  apagando.value = true
  try {
    await apagarJogo({
      jogoId: jogoSelecionado.value.id,
      grupoId: jogoSelecionado.value.grupoId,
    })
    modalExclusaoAberto.value = false
    toast.add({
      title: 'Jogo excluído',
      description: 'O jogo, suas jogadas e sua thumbnail foram removidos.',
      color: 'success',
    })
    jogoSelecionado.value = null
  } catch (error) {
    console.error('Erro ao excluir jogo:', error)
    toast.add({
      title: 'Não foi possível excluir o jogo',
      color: 'error',
    })
  } finally {
    apagando.value = false
  }
}

async function confirmarRenomeacao() {
  const nome = novoNome.value.trim()
  if (!jogoSelecionado.value || !nome) return

  renomeando.value = true
  try {
    await renomearJogo({
      jogoId: jogoSelecionado.value.id,
      grupoId: jogoSelecionado.value.grupoId,
      nome,
    })
    modalRenomeacaoAberto.value = false
    toast.add({
      title: 'Jogo renomeado',
      color: 'success',
    })
    jogoSelecionado.value = null
  } catch (error) {
    console.error('Erro ao renomear jogo:', error)
    toast.add({
      title: 'Não foi possível renomear o jogo',
      color: 'error',
    })
  } finally {
    renomeando.value = false
  }
}

async function novoJogo() {
  const { jogoId } = await useNovoJogo(props.diaId, props.grupoId, anotadorJogo.value)
  await navigateTo(`/jogos/${jogoId}`)
}
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center gap-3">
      <UIcon name="i-lucide-circle-dot" class="size-5 text-primary" />
      <h2 class="text-lg font-bold text-highlighted">Jogos realizados</h2>
      <UBadge class="ml-auto" color="primary" variant="soft">
        {{ jogos.length }} {{ jogos.length === 1 ? 'jogo' : 'jogos' }}
      </UBadge>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="Não foi possível carregar os jogos"
    />

    <div v-else-if="jogos.length" class="flex flex-col gap-3">
      <ItemJogo
        v-for="jogo in jogos"
        :key="jogo.id"
        :jogo="jogo"
        :pode-apagar="podeGerenciarJogo(jogo)"
        :pode-renomear="podeGerenciarJogo(jogo)"
        @excluir="abrirConfirmacaoExclusao"
        @renomear="abrirRenomeacao"
      />
    </div>

    <div v-else class="rounded-lg border border-dashed border-default py-8 text-center text-muted">
      Nenhum jogo criado para este dia.
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <UCheckbox v-model="anotadorModel" label="Assumir anotação" />
      <UButton
        class="ml-auto"
        color="primary"
        icon="i-lucide-pencil-line"
        @click="novoJogo"
      >
        Anotar novo jogo
      </UButton>
    </div>

    <UModal v-model:open="modalExclusaoAberto">
      <template #header>
        <h3 class="font-semibold">Excluir jogo?</h3>
      </template>
      <template #body>
        <p class="text-sm text-muted">
          O jogo <strong class="text-highlighted">{{ jogoSelecionado?.nome }}</strong>,
          suas jogadas e a thumbnail serão removidos permanentemente.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="apagando"
            @click="() => { modalExclusaoAberto = false }"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :loading="apagando"
            @click="confirmarExclusao"
          >
            Excluir jogo
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="modalRenomeacaoAberto">
      <template #header>
        <h3 class="font-semibold">Renomear jogo</h3>
      </template>
      <template #body>
        <UInput
          v-model="novoNome"
          placeholder="Nome do jogo"
          class="w-full"
          :disabled="renomeando"
          @keyup.enter="confirmarRenomeacao"
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="renomeando"
            @click="() => { modalRenomeacaoAberto = false }"
          >
            Cancelar
          </UButton>
          <UButton
            color="primary"
            :loading="renomeando"
            :disabled="!novoNome.trim()"
            @click="confirmarRenomeacao"
          >
            Salvar
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
