import { doc } from 'firebase/firestore'
export function useValidacaoConvite(convite: MaybeRefOrGetter<string|undefined>) {
  if (!toValue(convite)) return null
  const db = useFirestore()
    const docRefConvite = doc(db, 'convites', toValue(convite)! )
    const {pending, data, error} = useDocument(docRefConvite)
    const grupoId = computed(() => {
      if(!data.value) return null
      return data.value[0]?.grupo
  
    })
    const notFound = computed(
    () => !pending.value && !error.value && !data.value,
  );
    return {grupoId, pending, error, notFound}
}