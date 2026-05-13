import {  baseJogadorSchema,  type CriacaoJogador} from "~/schemas/jogador.schema";
import type { User } from "firebase/auth";
export default async function useCriacaoJogador(payload: CriacaoJogador) {
  console.log('[usecriacaojogador] o payload do composable é:  ', payload)
  const user: User = await getCurrentUser();
  if (!user) throw new Error("Usuário não autenticado");
  const token = await user.getIdToken();

  return $fetch("/api/jogadores/criar", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: payload,
  });
}