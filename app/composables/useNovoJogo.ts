import { apiFetch } from "~/services/apiFetch";
import { type BaseJogo } from "@/schemas/jogo.schema";
export default async function useNovoJogo(
  diaId: MaybeRefOrGetter<string|undefined>,
  grupoId: MaybeRefOrGetter<string|undefined>,
  anotadorId: string|null
) {
  if(!toValue(grupoId) || !toValue(diaId)) {} // todo: throw, precisa desses elementos, aqui não é reativo
  const payload: BaseJogo = {
    diaId: toValue(diaId)!,
    grupoId: toValue(grupoId)!,
    videoId: null,
    timer: {
      status: "ocioso",
      iniciadoEm: null,
      pausadoEm: null,
      finalizadoEm: null,
      duracao: 615,
      tempoPausadoTotalMs: 0
    },
    escalacao: null,
    anotadorId: anotadorId
  };
  console.log("[useNovoJogo]payload ", payload);
  return apiFetch<{ jogoId: string }>("/api/jogos/criar", {
    method: "POST",
    body: payload,
  });
}
