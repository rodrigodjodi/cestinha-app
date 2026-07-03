import { collection, query, where } from 'firebase/firestore'
import { jogadaConverter } from '~/firebase/jogadaConverter'

export function useListaJogadasDia(
  diaId: MaybeRefOrGetter<string | undefined>
) {
  const db = useFirestore()
  const jogadasRef = collection(db, 'jogadas')
  const consulta = computed(() => {
    const id = toValue(diaId)
    if (!id) return null

    return query(
      jogadasRef.withConverter(jogadaConverter),
      where('diaId', '==', id)
    )
  })

  const { data, pending, error } = useCollection(consulta)
  const jogadas = computed(() =>
    (data.value ?? [])
      .filter(documento => documento.valid)
      .map(documento => documento.jogada)
  )
  const errosParseJogadas = computed(() =>
    (data.value ?? [])
      .filter(documento => !documento.valid)
      .map(documento => ({
        doc: documento.raw,
        erroValidacao: documento.error,
      }))
  )

  return {
    jogadas,
    pending,
    error,
    errosParseJogadas,
  }
}
