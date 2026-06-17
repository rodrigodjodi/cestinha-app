import { query, where, collection, orderBy } from "firebase/firestore";
import { jogoConverter } from "~/firebase/jogoConverter";
export function useListaJogosDiasGrupo(diaId:MaybeRefOrGetter<string|undefined>, grupoId: MaybeRefOrGetter<string|undefined>) {
  console.log('[useListaJogosDiasGrupo] diaId: ', diaId)
  console.log('[useListaJogosDiasGrupo] grupoId: ', grupoId)
  const db = useFirestore();
  const jogosRef = collection(db, 'jogos')
  const ssrKey = computed(() => `jogos-${toValue(diaId)}-${toValue(grupoId)}`)
  const q = computed(()=>{
    if(!toValue(grupoId) || !toValue(diaId)){
      return null
    }
    return query(
      jogosRef.withConverter(jogoConverter),
      where('grupoId', '==', toValue(grupoId)),
      where('diaId', '==', toValue(diaId)),
      orderBy('criadoEm')
    )
  })
  const { data, pending, error } =  useCollection(q, {ssrKey:ssrKey.value})
  const jogos = computed(()=>{
    if(!data.value) return []
    return data.value
      .filter(doc=>doc.valid)
      .map(doc => doc.jogo)
  })
  const errosParseJogos = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => !doc.valid)
      .map((doc) => { 
        return {doc: doc.raw, erroValidacao: doc.error }
      })
  })
  return {jogos, pending, error, errosParseJogos}
}
