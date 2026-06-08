import { collection, doc, getDocs, query, where } from "firebase/firestore";
import type { ZodError } from "zod";
type ErroConversao = {
  id: string;
  erros: ZodError;
};
type ResultadoGrupos = {
  grupos: Grupo[];
  errosConversao: ErroConversao[];
};
import { type Grupo, grupoSchema } from "~/schemas/grupo.schema";
export async function listarGruposPorUsuario(
  usuarioId: string,
): Promise<ResultadoGrupos> {
  console.log("[grupo.service] listarGruposPorUsuario chamado com usuarioId:", usuarioId);
  const grupos: Grupo[] = [];
  const db = useFirestore();
  const errosConversao: ErroConversao[] = [];
  const gruposRef = collection(db, "grupos");
  // grupos não precisam de realtime, então usamos getDocs ao invés de onSnapshot
  const q = query(gruposRef, where("usuarios", "array-contains", usuarioId));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const resultado = grupoSchema.safeParse({
      id: doc.id,
      ...doc.data(),
    });
    if (!resultado.success) {
      errosConversao.push({
        id: doc.id,
        erros: resultado.error,
      });
    } else {
      grupos.push(resultado.data!);
    }
  });
  return { grupos, errosConversao };
}
