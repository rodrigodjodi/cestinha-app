import { query, where, collection } from "firebase/firestore";

export function useListaJogadores(grupoId: Ref<string | undefined>) {
  const db = useFirestore();
  const jogadoresRef = collection(db, 'jogadores')
  const ssrKey = computed(() => `jogadores-${grupoId.value}`)
  const q = computed(()=>{
    if(!grupoId.value){
      return null
    }
    return query(
      jogadoresRef,
      where('grupoId', '==', grupoId.value)
    )
  })
  const jogadoresRaw = useCollection(q, {ssrKey:ssrKey.value})

  return  jogadoresRaw
}
