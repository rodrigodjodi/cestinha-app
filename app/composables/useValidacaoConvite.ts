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
  const {
    grupo,
    pending: grupoPending,
    error: grupoError,
  } = useGrupo(grupoId)
  const pending = computed(() => {
    return convitePending.value || (!!grupoId.value && grupoPending.value)
  })
  const error = computed(() => conviteError.value ?? grupoError.value)
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
