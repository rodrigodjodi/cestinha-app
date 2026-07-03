import { collection, query, where } from 'firebase/firestore'
import { grupoConverter } from '@/firebase/grupoConverter'
export function useGruposUsuario() {
  const db = useFirestore()
  const user = useCurrentUser()
  const ssrKey = computed(() => `grupos-${user.value?.uid}`)
  const gruposRef = collection(db, 'grupos').withConverter(grupoConverter)
  const q = computed(()=>{
    if(!user.value?.uid) return null
    return query(
      gruposRef,
      where('usuarios', 'array-contains', user.value!.uid)
    )
  })
  const { data, pending, error } = useCollection(q, {ssrKey:ssrKey.value})
  // console.log('[useGruposUsuario] data (grupos validos e invalidos):', data)
  const grupos = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => doc.valid)
      .map((doc) => doc.grupo)
  })
  const errosParseGrupo = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => !doc.valid)
      .map((doc) => { 
        return {doc: doc.raw, erroValidacao: doc.error }
      })
  })
  /* const stopWatchNetworkError = watch(error, (err) => {
    if (err) {
      console.error('Erro ao carregar grupos do usuário:', err)
      useToast().add({
        color: 'error',
        title: 'Erro',
        description: 'Ocorreu um erro ao carregar seus grupos. Por favor, tente novamente mais tarde.',
      })
    }
  })
  const stopWatchErrosParse = watch(errosParseGrupo, (erros) => {
    // console.log(' Erros de conversão:', erros)
    if (erros.length > 0) {
      console.warn('Foram encontrados erros de conversão ao carregar grupos do usuário:', erros)
    }
  }) 
  onBeforeUnmount(() => {stopWatchNetworkError();stopWatchErrosParse()})*/
  return { grupos, pending, error, errosParseGrupo }
}
