import { type Jogo, type Escalacao } from "@/schemas/jogo.schema";
import { type Presenca } from "@/schemas/presenca.schema";
import { type Jogador } from "@/schemas/jogador.schema";
import { updateDoc, doc, serverTimestamp, increment } from "firebase/firestore";
import { apiFetch } from '@/services/apiFetch'

export const useJogoStore = defineStore("jogo", () => {
  const db = useFirestore();
  const jogo = ref<Jogo | null>(null);
  const presencas = ref<Presenca[]>([])
  const jogadores = ref<Jogador[]>([])
  function setJogo(data: Jogo) {
    jogo.value = data;
  }
  function setPresencas(data: Presenca[]) {
    presencas.value = data;
  }
  function setJogadores(data: Jogador[]) {
    jogadores.value = data;
  }

const jogadoresMap = computed(() => {
  return new Map(
    jogadores.value.map(j => [j.id, j])
  )
})
// isso aqui basicamente é um join entre jogadores x presencas
const jogadoresPresentes = computed<Jogador[]>(() => {
  return presencas.value.flatMap(presenca => {
    return jogadoresMap.value.get(presenca.jogadorId)
  })
})

const timeA = computed(() => {
  return jogadoresPresentes.value
  .filter(jogador => jogo.value?.escalacao?.[jogador.id]?.time === 'A')
})
const timeB = computed(() => {
  return jogadoresPresentes.value
  .filter(jogador => jogo.value?.escalacao?.[jogador.id]?.time === 'B')
})
const banco = computed(() => {
  return jogadoresPresentes.value.filter(jogador => {
    return !jogo.value?.escalacao?.[jogador.id]
  })
})
const docRefJogo = computed(() => doc(db, `jogos/${jogo.value?.id}`))
  function iniciar() {
    return updateDoc(docRefJogo.value, {
      'timer.status': "rodando",
      'timer.iniciadoEm': serverTimestamp(),
    });
  }
  function pausar() {
    return updateDoc(docRefJogo.value, {
      'timer.status': "pausado",
      'timer.pausadoEm': serverTimestamp(),
    });
  }
  function retomar(tempoPausaAtual:number) {
    return updateDoc(docRefJogo.value, {
      'timer.status': "rodando",
      'timer.pausadoEm': null,
      'timer.tempoPausadoTotalMs': increment(tempoPausaAtual)
    });
  }

  function finalizar() {
    return updateDoc(docRefJogo.value, {
      'timer.status': "finalizado",
      'timer.pausadoEm': null,
      'timer.finalizadoEm': serverTimestamp(),
    });
  }

  function reiniciar() {
    return updateDoc(docRefJogo.value, {
      'timer.status': "ocioso",
      'timer.iniciadoEm': null,
      'timer.pausadoEm': null,
      'timer.finalizadoEm': null,
      'timer.tempoPausadoTotalMs': 0
    });
  }
  function limparStore() {
    jogo.value = null;
    jogadores.value = []
    presencas.value = []
  }
  type AtualizacaoEscalacao = Record<string, { time: 'A' | 'B', ordem?: number }>
  // tem que funcionar com {escalacao.${idJogador}:{time: 'A' | 'B'}}
  function gravarEscalacao(novaEscalacao: AtualizacaoEscalacao) {
    console.log("gravarEscalacao ", novaEscalacao);
    if (!jogo.value) return;
    return updateDoc(docRefJogo.value, novaEscalacao)
  }
  function atribuirAnotacao(usuarioId:string | undefined) {
    return apiFetch(`/api/jogos/${jogo.value?.id}/atribuir-anotacao`, {
      method: 'POST',
      body: {anotadorId: usuarioId || null}
    });
  }
  function definirOffsetVideo(tempoVideo:number) {
    return updateDoc(docRefJogo.value, {videoOffset:tempoVideo})
  }
  return {
    jogo,
    setJogo,
    setJogadores,
    setPresencas,
    iniciar,
    pausar,
    retomar,
    finalizar,
    reiniciar,
    limparStore,
    gravarEscalacao,
    status: computed(() => jogo.value?.timer.status),
    iniciadoEm: computed(() => jogo.value?.timer.iniciadoEm?.toMillis()),
    pausadoEm: computed(() => jogo.value?.timer.pausadoEm?.toMillis()),
    finalizadoEm: computed(() => jogo.value?.timer.finalizadoEm?.toMillis()),
    duracao: computed(() => jogo.value?.timer.duracao),
    tempoPausadoTotalMs: computed(() => jogo.value?.timer.tempoPausadoTotalMs),
    timeA, timeB, banco, jogadoresPresentes,
    atribuirAnotacao,
    definirOffsetVideo
  };
});
