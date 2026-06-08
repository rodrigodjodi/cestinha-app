import { query, where, collection } from "firebase/firestore";
import { jogadorConverter } from "~/firebase/jogadorConverter";
export function useListaJogadores(grupoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore();
  const jogadoresRef = collection(db, 'jogadores')
  const ssrKey = computed(() => `jogadores-${toValue(grupoId)}`)
  const q = computed(()=>{
    if(!toValue(grupoId)) return null
    return query(
      jogadoresRef.withConverter(jogadorConverter),
      where('grupoId', '==', toValue(grupoId))
    )
  })
  const {data, pending, error} = useCollection(q, {ssrKey:ssrKey.value})
  const jogadores = computed(() => {
    if( !data.value) return []
    return data.value
      .filter(doc=> doc.valid)
      .map(doc => doc.jogador)
  })
  const errosParseJogador = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => !doc.valid)
      .map((doc) => { 
        return {doc: doc.raw, erroValidacao: doc.error }
      })
  })
  const stopWatchNetworkError = watch(error, (err) => {
    if (err) {
      console.error('Erro ao carregar Jogadores:', err)
      useToast().add({
        color: 'error',
        title: 'Erro',
        description: 'Ocorreu um erro ao carregar os jogadores. Por favor, tente novamente mais tarde.',
      })
    }
  })
  const stopWatchErrosParse = watch(errosParseJogador, (erros) => {
    // console.log(' Erros de conversão:', erros)
    if (erros.length > 0) {
      console.warn('Foram encontrados erros de conversão ao carregar os jogadores:', erros)
    }
  })
  onBeforeUnmount(() => {stopWatchNetworkError();stopWatchErrosParse()})

  return {jogadores, pending, error, errosParseJogador}

}
