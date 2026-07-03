import { doc } from 'firebase/firestore'
import { conviteConverter } from '~/firebase/conviteConverter'

export function useConviteGrupo(
  conviteId: MaybeRefOrGetter<string | undefined>
) {
  const db = useFirestore()
  const conviteRef = computed(() => {
    const id = toValue(conviteId)
    if (!id) return null

    return doc(db, 'convites', id).withConverter(conviteConverter)
  })

  const { data, pending, error } = useDocument(conviteRef)
  const convite = computed(() =>
    data.value?.valid ? data.value.convite : null
  )
  const errosParseConvite = computed(() => {
    if (!data.value || data.value.valid) return null

    return {
      doc: data.value.raw,
      erroValidacao: data.value.error,
    }
  })
  const notFound = computed(() =>
    !pending.value && !error.value && convite.value === null
  )

  return {
    convite,
    pending,
    error,
    errosParseConvite,
    notFound,
  }
}
