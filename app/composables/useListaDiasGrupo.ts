import { query, where, collection } from "firebase/firestore";

export function useListaDiasGrupo(grupoId: Ref<string | undefined>) {
  const db = useFirestore();
  const diasRef = collection(db, 'dias')
  const ssrKey = computed(() => `dias-${grupoId.value}`)
  const q = computed(()=>{
    if(!grupoId.value){
      return null
    }
    return query(
      diasRef,
      where('grupoId', '==', grupoId.value)
    )
  })
  const dias = useCollection(q, {ssrKey:ssrKey.value})

  return  dias
}
