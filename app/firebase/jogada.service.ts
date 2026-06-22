import { arrayUnion, doc, writeBatch, updateDoc, collection } from 'firebase/firestore';
import type { Jogada } from '~/schemas/jogada.schema';
import  { type TipoJogada, type BaseJogada, jogadaSchema } from '~/schemas/jogada.schema';

export function anotaJogada(tipo: TipoJogada, jogadorId: string, assistenciaId?: string) {
    console.log(tipo, jogadorId)
    const db = useFirestore()
    const user = useCurrentUser()
    const docRef = doc(collection(db,'jogadas'))
    const jogoStore = useJogoStore()
    const jogo = jogoStore.jogo
    const tempoVideo:Ref<number> = useState('tempo-video')
    // const time = times[`time${jogo?.escalacao?.[props.jogadorId!]?.time}` as 'timeA' | 'timeB']
    if(!jogo) throw new Error("Jogo não definido")
  const payload:BaseJogada = {
    diaId: jogo.diaId,
    jogoId: jogo.id,
    jogadorId,
    tipo,
    //time,
    tempoMs: Math.max(
      0,
      Math.round(tempoVideo.value - jogo.video.offsetMs)
    ),
    ...(assistenciaId && ['2PM', '3PM'].includes(tipo)
      ? { assistenciaId }
      : {}),
  }
  console.log(payload)
}

