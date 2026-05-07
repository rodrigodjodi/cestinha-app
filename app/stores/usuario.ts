import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useCurrentUser, useDocument } from "vuefire"
import type { User } from "firebase/auth"

import {
  usuarioSchema,
  baseUsuarioSchema,
  type Usuario
} from "@/schemas/usuario.schema"

export const useUsuarioStore = defineStore("usuario", () => {
  console.log("[usuarioStore] chamada da store de usuário")
  const db = useFirestore()
  const firebaseUser = useCurrentUser()

  const usuarioRef = computed(() => {
    if (!firebaseUser.value) return null
    return doc(db, "usuarios", firebaseUser.value.uid)
  })

  const usuarioRaw = useDocument(usuarioRef)

  const usuario = computed<Usuario | null>(() => {
    if (!usuarioRaw.value) return null
    const result = usuarioSchema.safeParse(usuarioRaw.value)
    if (!result.success) {
      console.error("[usuarioStore] erro ao validar usuário", result.error)
      return null
    }
    return result.data
  })

  async function criarUsuarioComFirebaseUser(firebaseUser: User) {
      const parseResult = baseUsuarioSchema.safeParse({
        nome: firebaseUser.displayName,
        email: firebaseUser.email,
      })
      if (!parseResult.success) {
        console.error("[usuarioStore] erro ao criar usuário", parseResult.error)
        throw new Error("Dados do usuário inválidos")
      }
      const payload = {
        ...parseResult.data,
        criadoEm: serverTimestamp(),
      }
      return setDoc(doc(db, "usuarios", firebaseUser.uid), payload)
  }
  const uid = computed(() => firebaseUser.value?.uid)
  
  return {
    usuario, uid, criarUsuarioComFirebaseUser
  }
})