import { query, where, collection, orderBy } from "firebase/firestore";
import { presencaConverter } from '@/firebase/presencaConverter'
export function useListaPresencasDiaGrupo(diaId:MaybeRefOrGetter<string|undefined>, grupoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
  const presencasRef = collection(db, 'presencas')
  const ssrKey = computed(() => `presencas-${toValue(diaId)}-${toValue(grupoId)}`)
  const q = computed(()=>{
    if(!toValue(grupoId) || !toValue(diaId)){
      return null
    }
    // console.log('[useListaPresencasDiaGrupo] criando query presencas com diaId ', toValue(diaId), 'grupoId ', toValue(grupoId))
    return query(
      presencasRef.withConverter(presencaConverter),
      where('grupoId', '==', toValue(grupoId)),
      where('diaId', '==', toValue(diaId)),
      orderBy('situacao'), // ! garanta que existe campo situação, senão não retorna
      orderBy('situacaoEm')
    )
  })
  const { data, pending, error} = useCollection(q, {ssrKey:ssrKey.value})
  const presencas = computed(() => {
    if( !data.value) return []
    return data.value
      .filter(doc=> doc.valid)
      .map(doc => doc.presenca)
  })
  const errosParsePresenca = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => !doc.valid)
      .map((doc) => { 
        return {doc: doc.raw, erroValidacao: doc.error }
      })
  })

  return {presencas, pending, error, errosParsePresenca}

}
