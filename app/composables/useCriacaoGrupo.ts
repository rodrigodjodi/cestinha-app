import { type FormCriacaoGrupo } from "@/schemas/grupo.schema";
import type { User } from 'firebase/auth'
export default async function useCriacaoGrupo(payload: FormCriacaoGrupo) {
  // console.log('[usecriacaogrupo] o payload do composable é:  ', payload)
  const user:User = await getCurrentUser()
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  return $fetch('/api/grupos/criar', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`},
    body: payload
  })
}
