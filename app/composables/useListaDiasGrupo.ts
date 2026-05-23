import { query, where, collection } from "firebase/firestore";

export function useListaDiasGrupo(grupoId: MaybeRefOrGetter<string | undefined>) {
  const db = useFirestore();
  const diasRef = collection(db, 'dias')
  const ssrKey = computed(() => `dias-${toValue(grupoId)}`)
  const q = computed(()=>{
    if(!toValue(grupoId)){
      return null
    }
    return query(
      diasRef,
      where('grupoId', '==', toValue(grupoId))
    )
  })
  const dias = useCollection(q, {ssrKey:ssrKey.value})

  return  dias
}
