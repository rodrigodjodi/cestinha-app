<script setup lang="ts">
import type { FetchError } from 'ofetch'
import type {
  AssociarJogadorConviteResponse,
} from '~/schemas/convite.schema'
import type { Jogador } from '~/schemas/jogador.schema'
import { apiFetch } from '~/services/apiFetch'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const conviteId = computed(() => {
  const codigo = route.params.convite
  return typeof codigo === 'string' ? codigo : undefined
})
const {
  grupo,
  grupoId,
  pending,
  error,
  notFound,
} = useValidacaoConvite(conviteId)
const { jogadorLogado } = useJogadorLogado(grupoId)
const { jogadores } = useListaJogadores(grupoId)
const user = useCurrentUser()
const toast = useToast()
const jogadorSelecionadoId = ref<string | null>(null)
const associando = ref(false)

const jogadoresDisponiveis = computed(() => {
  return jogadores.value
    .filter(jogador => jogador.usuarioId === null)
    .toSorted((a, b) => {
      const ordem = { admin: 0, membro: 1, avulso: 2 }
      return ordem[a.atribuicao] - ordem[b.atribuicao]
        || a.nome.localeCompare(b.nome)
    })
})
const jogadorSelecionado = computed(() => {
  return jogadoresDisponiveis.value.find(
    jogador => jogador.id === jogadorSelecionadoId.value
  ) ?? null
})
const podeAssociar = computed(() => {
  return !!user.value
    && !!grupo.value
    && !!jogadorSelecionado.value
    && !associando.value
})

watch(jogadorLogado, jogador => {
  if (jogador && grupoId.value && !associando.value) {
    void navigateTo(`/grupos/${grupoId.value}`)
  }
}, { immediate: true })

function selecionarJogador(jogador: Jogador) {
  jogadorSelecionadoId.value = jogador.id
}

function mensagemErro(error: unknown) {
  const fetchError = error as FetchError<{ message?: string }>
  return fetchError.data?.message
    ?? 'Não foi possível associar o jogador. Tente novamente.'
}

async function associarJogador() {
  const jogador = jogadorSelecionado.value
  const grupoAtual = grupo.value

  if (!user.value || !jogador || !grupoAtual || !conviteId.value) return

  associando.value = true
  try {
    await apiFetch<AssociarJogadorConviteResponse>(
      `/api/convites/${encodeURIComponent(conviteId.value)}/associar-jogador`,
      {
        method: 'POST',
        body: { jogadorId: jogador.id },
      }
    )
    toast.add({
      title: 'Jogador associado',
      description: `Agora você faz parte do grupo ${grupoAtual.nome}.`,
      color: 'success',
    })
    await navigateTo(`/grupos/${grupoAtual.id}`)
  } catch (error) {
    toast.add({
      title: 'Não foi possível entrar no grupo',
      description: mensagemErro(error),
      color: 'error',
    })
  } finally {
    associando.value = false
  }
}
</script>

<template>
  <div v-if="pending">
    <div class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="i in 2" :key="i" class="mb-3 h-24" />
    </div>
  </div>

  <UCard v-else-if="error">
    <p class="text-muted">
      Ocorreu um erro ao validar o convite. Tente novamente mais tarde.
    </p>
  </UCard>

  <UCard v-else-if="notFound">
    <p class="text-muted">
      Convite inválido ou expirado.
    </p>
  </UCard>

  <UCard
    v-else-if="grupo"
    :title="`Bem-vindo ao grupo ${grupo.nome}!`"
    description="Quem é você?"
  >
    <p class="mb-4 text-muted">
      Selecione um jogador para assumir como identidade no grupo.
      Se você ainda não tem um jogador, peça para o administrador do grupo
      criar um.
    </p>

    <div v-if="jogadoresDisponiveis.length" class="flex flex-wrap gap-2">
      <ItemJogadorSelecao
        v-for="jogador in jogadoresDisponiveis"
        :key="jogador.id"
        :jogador="jogador"
        :selected="jogadorSelecionadoId === jogador.id"
        :data-jogador-id="jogador.id"
        :subtitulo="jogador.atribuicao"
        @toggle="selecionarJogador(jogador)"
      />
    </div>
    <p v-else class="text-muted">
      Não há jogadores disponíveis para associação neste grupo.
    </p>

    <template #footer>
      <UButton
        :disabled="!podeAssociar"
        :loading="associando"
        @click="associarJogador"
      >
        Selecionar jogador
      </UButton>
    </template>
  </UCard>
</template>
