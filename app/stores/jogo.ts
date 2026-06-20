import type { Jogo } from '@/schemas/jogo.schema'
import type { Jogador } from '@/schemas/jogador.schema'
import type { EquipeJogo } from '@/schemas/equipe.schema'
import { updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore'
import { apiFetch } from '@/services/apiFetch'

type ComposicaoJogo = {
  equipes: {
    esquerda: EquipeJogo
    direita: EquipeJogo
  }
  banco: string[]
}

export const useJogoStore = defineStore('jogo', () => {
  const db = useFirestore()
  const user = useCurrentUser()
  const jogo = ref<Jogo | null>(null)
  const jogadores = ref<Jogador[]>([])

  function setJogo(data: Jogo) {
    jogo.value = data
  }

  function setJogadores(data: Jogador[]) {
    jogadores.value = data
  }

  const jogadoresMap = computed(() => new Map(
    jogadores.value.map(jogador => [jogador.id, jogador])
  ))

  function resolverJogadores(ids: string[]) {
    return ids.flatMap(id => {
      const jogador = jogadoresMap.value.get(id)
      return jogador ? [jogador] : []
    })
  }

  const equipeEsquerda = computed(() =>
    resolverJogadores(jogo.value?.equipes.esquerda.jogadores ?? [])
  )
  const equipeDireita = computed(() =>
    resolverJogadores(jogo.value?.equipes.direita.jogadores ?? [])
  )
  const banco = computed(() => resolverJogadores(jogo.value?.banco ?? []))

  function obterDocRefJogo() {
    if (!jogo.value) {
      throw new Error('Jogo não definido')
    }
    return doc(db, 'jogos', jogo.value.id)
  }

  function iniciar() {
    return updateDoc(obterDocRefJogo(), {
      'timer.status': 'rodando',
      'timer.iniciadoEm': serverTimestamp(),
    })
  }

  function pausar() {
    return updateDoc(obterDocRefJogo(), {
      'timer.status': 'pausado',
      'timer.pausadoEm': serverTimestamp(),
    })
  }

  function retomar(tempoPausaAtual: number) {
    return updateDoc(obterDocRefJogo(), {
      'timer.status': 'rodando',
      'timer.pausadoEm': null,
      'timer.tempoPausadoTotalMs': increment(tempoPausaAtual),
    })
  }

  function finalizar() {
    return updateDoc(obterDocRefJogo(), {
      'timer.status': 'finalizado',
      'timer.pausadoEm': null,
      'timer.finalizadoEm': serverTimestamp(),
    })
  }

  function reiniciar() {
    return updateDoc(obterDocRefJogo(), {
      'timer.status': 'ocioso',
      'timer.iniciadoEm': null,
      'timer.pausadoEm': null,
      'timer.finalizadoEm': null,
      'timer.tempoPausadoTotalMs': 0,
    })
  }

  function limparStore() {
    jogo.value = null
    jogadores.value = []
  }

  function gravarComposicao(composicao: ComposicaoJogo) {
    if (!jogo.value) {
      throw new Error('Jogo não definido')
    }
    if (jogo.value.anotadorId !== user.value?.uid) {
      throw new Error('Somente o anotador pode editar a preparação do jogo')
    }
    return updateDoc(obterDocRefJogo(), {
      equipes: composicao.equipes,
      banco: composicao.banco,
    })
  }

  function atribuirAnotacao(usuarioId: string | undefined) {
    return apiFetch(`/api/jogos/${jogo.value?.id}/atribuir-anotacao`, {
      method: 'POST',
      body: { anotadorId: usuarioId || null },
    })
  }

  function definirOffsetVideo(tempoVideo: number) {
    return updateDoc(obterDocRefJogo(), { videoOffset: tempoVideo })
  }

  return {
    jogo,
    jogadores,
    jogadoresMap,
    equipeEsquerda,
    equipeDireita,
    banco,
    setJogo,
    setJogadores,
    iniciar,
    pausar,
    retomar,
    finalizar,
    reiniciar,
    limparStore,
    gravarComposicao,
    status: computed(() => jogo.value?.timer.status),
    iniciadoEm: computed(() => jogo.value?.timer.iniciadoEm?.toMillis()),
    pausadoEm: computed(() => jogo.value?.timer.pausadoEm?.toMillis()),
    finalizadoEm: computed(() => jogo.value?.timer.finalizadoEm?.toMillis()),
    duracao: computed(() => jogo.value?.timer.duracao),
    tempoPausadoTotalMs: computed(() => jogo.value?.timer.tempoPausadoTotalMs),
    atribuirAnotacao,
    definirOffsetVideo,
  }
})
