import { apiFetch } from "~/services/apiFetch";
import { type BaseJogo } from "@/schemas/jogo.schema";
export default async function useNovoJogo(
  diaId: MaybeRefOrGetter<string>,
  grupoId: MaybeRefOrGetter<string>,
) {
  const payload: BaseJogo = {
    diaId: toValue(diaId),
    grupoId: toValue(grupoId),
    videoId: null,
    status: "0.ocioso",
    iniciadoEm: null,
    pausadoEm: null,
    escalacao: null,
  };
  // console.log("payload ", payload);
  return apiFetch<{ jogoId: string }>("/api/jogos/criar", {
    method: "POST",
    body: payload,
  });
}
