import { apiFetch } from "~/services/apiFetch";
import { type BaseJogo } from "@/schemas/jogo.schema";
export default async function useNovoJogo(
  diaId: MaybeRefOrGetter<string|undefined>,
  grupoId: MaybeRefOrGetter<string|undefined>,
) {
  if(!toValue(grupoId) || !toValue(diaId)) {} // todo: throw, precisa desses elementos, aqui não é reativo
  const payload: BaseJogo = {
    diaId: toValue(diaId)!,
    grupoId: toValue(grupoId)!,
    videoId: null,
    status: "0.ocioso",
    iniciadoEm: null,
    pausadoEm: null,
    escalacao: null,
    finalizadoEm: null
  };
  console.log("[useNovoJogo]payload ", payload);
  return apiFetch<{ jogoId: string }>("/api/jogos/criar", {
    method: "POST",
    body: payload,
  });
}
