import { query, where, collection, orderBy } from "firebase/firestore";

export function useListaJogosDiasGrupo(diaId:MaybeRefOrGetter<string|undefined>, grupoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
  const jogosRef = collection(db, 'jogos')
  const ssrKey = computed(() => `jogos-${toValue(diaId)}-${toValue(grupoId)}`)
  const q = computed(()=>{
    if(!toValue(grupoId) || !toValue(diaId)){
      return null
    }
    return query(
      jogosRef,
      where('grupoId', '==', toValue(grupoId)),
      where('diaId', '==', toValue(diaId)),
      orderBy('criadoEm')
    )
  })
  
  return  useCollection(q, {ssrKey:ssrKey.value})
}
