import { collection, query, where } from 'firebase/firestore'

import { grupoSchema } from '@/schemas/grupo.schema'

export function useGruposDoUsuario() {
  const db = useFirestore()
  const user = useCurrentUser()
  const ssrKey = computed(() => `grupos-${user.value?.uid}`)
  const gruposRef = collection(db, 'grupos')
  const q = computed(()=>{
    if(!user.value?.uid){
      return null
    }
    return query(
      gruposRef,
      where('usuarios', 'array-contains', user.value.uid)
    )
  })
  const gruposRaw = useCollection(q, {ssrKey:ssrKey.value})

  const grupos = computed(() => {
    return gruposRaw.value
      .map((g) => {
        const result = grupoSchema.safeParse(g)

        if (!result.success) {
          console.error('Grupo inválido:', result.error)
          return null
        }

        return {
          ...result.data,
          id: g.id, // VueFire injeta id
        }
      })
      .filter(Boolean)
  })

  return {
    grupos,
    loading: computed(() => !gruposRaw.value),
  }
}
