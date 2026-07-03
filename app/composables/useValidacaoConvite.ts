import { doc } from 'firebase/firestore'
import { conviteConverter } from '~/firebase/conviteConverter'

export function useValidacaoConvite(
  codigoConvite: MaybeRefOrGetter<string | undefined>
) {
  const db = useFirestore()
  const conviteRef = computed(() => {
    const codigo = toValue(codigoConvite)
    if (!codigo) return null

    return doc(db, 'convites', codigo).withConverter(conviteConverter)
  })
  const {
    data,
    pending: convitePending,
    error: conviteError,
  } = useDocument(conviteRef)
  const convite = computed(() => {
    return data.value?.valid ? data.value.convite : null
  })
  const grupoId = computed(() => convite.value?.grupoId)
  const grupo = computed(() => {
    if (!convite.value) return null

    return {
      id: convite.value.grupoId,
      nome: convite.value.grupoNome ?? 'grupo',
    }
  })
  const pending = computed(() => convitePending.value)
  const error = computed(() => conviteError.value)
  const notFound = computed(() => {
    return !pending.value && !error.value && (!convite.value || !grupo.value)
  })

  return {
    convite,
    grupo,
    grupoId,
    pending,
    error,
    notFound,
  }
}
