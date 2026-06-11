import { arrayUnion, doc, writeBatch, updateDoc } from 'firebase/firestore';
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

export function associarJogadorAUsuario(jogador: Jogador, usuarioId: string) {
  if(!jogador || !usuarioId) return
  const db = useFirestore();
  const batch = writeBatch(db);
  const jogadorRef = doc(db, 'jogadores', jogador.id)
  const grupoRef = doc(db, 'grupos', jogador.grupoId)
  batch.update(jogadorRef, {usuarioId})
  batch.update(grupoRef, {usuarios: arrayUnion("usuarioId")})
  return batch.commit()
}
