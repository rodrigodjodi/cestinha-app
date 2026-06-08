import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Jogador } from '~/schemas/jogador.schema';
export function alterarAtribuicao( jogador: Jogador, novaAtribuicao: string, jogadorLogado: Jogador) {
  if(jogadorLogado.atribuicao !== 'admin') {
    console.log("Usuário não é admin, não pode alterar atribuição do jogador", jogador.nome);
    return;
  }
  console.log("Alterando atribuição do jogador", jogador.nome, "para", novaAtribuicao,  "por jogador logado", jogadorLogado?.nome);
  const db = useFirestore();
  const jogadorRef = doc(db, 'jogadores', jogador.id);
  return updateDoc(jogadorRef, { atribuicao: novaAtribuicao });
}
