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
  type ItemJogadorEscalacao = {
  id: string
  nome: string
  subtitulo?: string
  fotoUrl?: string
}
const jogadoresMap = computed(() => {
  return new Map(
    jogadores.value.map(j => [j.id, j])
  )
})
// isso aqui basicamente é um join entre jogadores x presencas
const itensPresencaLista = computed<ItemJogadorEscalacao[]>(() => {
  return presencas.value.flatMap(presenca => {
    const jogador = jogadoresMap.value.get(presenca.jogadorId)
    if (!jogador) return []
    return {
      id: jogador.id,
      nome: jogador.nome,
      fotoUrl: jogador.fotoUrl || '',
      subtitulo: ''
    }
  })
})

const timeA = computed(() => {
  return itensPresencaLista.value
  .filter(j => jogo.value?.escalacao?.[j.id]?.time === 'A')
})
const timeB = computed(() => {
  return itensPresencaLista.value
  .filter(j => jogo.value?.escalacao?.[j.id]?.time === 'B')
})
const banco = computed(() => {
  return itensPresencaLista.value.filter(itemJogador => {
    return !jogo.value?.escalacao?.[itemJogador.id]
  })
})
  function iniciar() {
    if (!jogo.value?.id) return;
    const db = useFirestore();
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      'timer.status': "rodando",
      'timer.iniciadoEm': serverTimestamp(),
    });
  }
  function pausar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      'timer.status': "pausado",
      'timer.pausadoEm': serverTimestamp(),
    });
  }
  function retomar(tempoPausaAtual:number) {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      'timer.status': "rodando",
      'timer.pausadoEm': null,
      'timer.tempoPausadoTotalMs': increment(tempoPausaAtual)
    });
  }

  function finalizar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      'timer.status': "finalizado",
      'timer.pausadoEm': null,
      'timer.finalizadoEm': serverTimestamp(),
    });
  }

  function reiniciar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
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
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, novaEscalacao)
  }
  function atribuirAnotacao(usuarioId:string | undefined) {
    return apiFetch(`/api/jogos/${jogo.value?.id}/atribuir-anotacao`, {
      method: 'POST',
      body: {anotadorId: usuarioId || null}
    });
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
    timeA, timeB, banco,
    atribuirAnotacao
  };
});
