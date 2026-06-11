import { collection, limit, query, where } from 'firebase/firestore'
import { jogadorConverter } from '~/firebase/jogadorConverter'
export function useJogadorLogado(grupoId: MaybeRefOrGetter<string|undefined>) {
  const db = useFirestore()
  const user = useCurrentUser()
  const q = computed(() => {
    const resolvedGrupoId = toValue(grupoId)
    if (!user.value || !resolvedGrupoId) return null
    return query(
      collection(db, 'jogadores').withConverter(jogadorConverter),
      where('usuarioId', '==', user.value.uid),
      where('grupoId', '==', resolvedGrupoId),
      limit(1)
    )
  })
  const {pending, data, error} = useCollection(q)
  const jogadorLogado = computed(() => {
    if(!data.value) return null
    return data.value
      .filter((doc) => doc.valid)
      .map((doc) => doc.jogador)
      [0] ?? null
  })
  const errosParseJogador = computed(() => {
    if(!data.value) return []
    return data.value
      .filter((doc) => !doc.valid)
      .map((doc) => { 
        return {doc: doc.raw, erroValidacao: doc.error }
      })
  })
  
  const stopWatchErrosParse = watch(errosParseJogador, (erros) => {
    // console.log(' Erros de conversão:', erros)
    if (erros.length > 0) {
      console.warn('Foram encontrados erros de conversão ao carregar o jogador logado:', erros)
    }
  })
  onBeforeUnmount(() => {stopWatchErrosParse()})
  return {jogadorLogado, pending, error, errosParseJogador}
}
