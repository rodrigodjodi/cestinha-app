import { query, where, collection, orderBy } from "firebase/firestore";

export function useListaJogosDiasGrupo(diaId:Ref<string | undefined>, grupoId: Ref<string | undefined>) {
  const db = useFirestore();
  const jogosRef = collection(db, 'jogos')
  const ssrKey = computed(() => `jogos-${diaId.value}-${grupoId.value}`)
  const q = computed(()=>{
    if(!grupoId.value || !diaId.value){
      return null
    }
    return query(
      jogosRef,
      where('grupoId', '==', grupoId.value),
      where('diaId', '==', diaId.value),
      orderBy('criadoEm')
    )
  })
  
  return  useCollection(q, {ssrKey:ssrKey.value})
}
