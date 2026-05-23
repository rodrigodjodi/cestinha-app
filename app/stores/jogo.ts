import { type Jogo, type Escalacao } from "@/schemas/jogo.schema";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
export const useJogoStore = defineStore("jogo", () => {
  const db = useFirestore();
  const jogo = ref<Jogo | null>(null);
  function populate(data: Jogo) {
    jogo.value = data;
  }
  function iniciar() {
    if (!jogo.value?.id) return;
    const db = useFirestore();
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      status: "1.rodando",
      iniciadoEm: serverTimestamp(),
    });
  }
  function pausar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      status: "2.pausado",
      pausadoEm: serverTimestamp(),
    });
  }
  function retomar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      status: "1.rodando",
      pausadoEm: null,
    });
  }

  function finalizar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      status: "3.finalizado",
      pausadoEm: null,
    });
  }

  function reiniciar() {
    if (!jogo.value?.id) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, {
      status: "0.ocioso",
      iniciadoEm: null,
      pausadoEm: null,
    });
  }
  function limparStore() {
    jogo.value = null;
  }
  type AtualizacaoEscalacao = Record<string, { time: 'A' | 'B', ordem?: number }>
  // tem que funcionar com {escalacao.${idJogador}:{time: 'A' | 'B'}}
  function gravarEscalacao(novaEscalacao: AtualizacaoEscalacao) {
    console.log("gravarEscalacao ", novaEscalacao);
    if (!jogo.value) return;
    const docRefJogo = doc(db, `jogos/${jogo.value?.id}`);
    return updateDoc(docRefJogo, novaEscalacao)
  }
  return {
    jogo,
    populate,
    iniciar,
    pausar,
    retomar,
    finalizar,
    reiniciar,
    limparStore,
    gravarEscalacao,
    status: computed(() => jogo.value?.status),
    iniciadoEm: computed(() => jogo.value?.iniciadoEm?.toMillis()),
    pausadoEm: computed(() => jogo.value?.pausadoEm?.toMillis()),
  };
});
