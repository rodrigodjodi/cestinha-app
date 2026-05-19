import { query, where, collection, orderBy } from "firebase/firestore";

export function useListaPresencasDiaGrupo(diaId:Ref<string | undefined>, grupoId: Ref<string | undefined>) {
  const db = useFirestore();
  const presencasRef = collection(db, 'presencas')
  const ssrKey = computed(() => `presencas-${diaId.value}-${grupoId.value}`)
  const q = computed(()=>{
    if(!grupoId.value || !diaId.value){
      return null
    }
    // console.log('[useListaPresencasDiaGrupo] criando query presencas com diaId ', diaId.value, 'grupoId ', grupoId.value)
    return query(
      presencasRef,
      where('grupoId', '==', grupoId.value),
      where('diaId', '==', diaId.value),
      orderBy('situacao'), // ! garanta que existe campo situação, senão não retorna
      orderBy('criadoEm')
    )
  })
  

  return  useCollection(q, {ssrKey:ssrKey.value})
}
