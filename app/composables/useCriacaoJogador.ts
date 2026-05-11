import  { baseJogadorSchema, type CriacaoJogador } from "~/schemas/jogador.schema";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore"
export default function useCriacaoJogador(payload:CriacaoJogador){ // todo: evitar duplicao de nome no grupo
    const db = useFirestore()
    const jogadorRef = doc(collection(db, "jogadores"));
    const payloadEnvio = baseJogadorSchema.parse(payload)
    console.log("[useCriacaoJogador]: payload envio: ", payloadEnvio)
    return setDoc(jogadorRef, {
      ...payloadEnvio,
      criadoEm: serverTimestamp()
  }); 
}