import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
import { criacaoGrupoSchema } from "@/schemas/grupo.schema";
import { baseJogadorSchema } from "@/schemas/jogador.schema";
export default defineEventHandler(async (event) => {
  // 1. header
  const authorization = getHeader(event, "authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, statusMessage: "Não autenticado" });
  }
  // 2.token
  const token = authorization.replace("Bearer ", "");
  // 3. firebase auth
  const decodedToken = await adminAuth.verifyIdToken(token);
  // 4. body
  const body = await readBody(event);
  console.log(body);
  // 5. zod
  const validacao = criacaoGrupoSchema.safeParse(body);
  if (!validacao.success)
    throw createError({
      statusCode: 400,
      statusMessage: "Dados inválidos",
    });
  const payloadGrupo = validacao.data;
  // 6. batch: se grupo ou usuário ou convite falhar, nada é criado
  const now = Timestamp.now();
  const grupoRef = adminDb.collection("grupos").doc();
  const jogadorRef = adminDb.collection("jogadores").doc();
  const conviteRef = adminDb.collection("convites").doc();
  try {

    const batch = adminDb.batch();
    // 6.1 grupo
    const grupo = {
      nome: payloadGrupo.nome,
      usuarios: [decodedToken.uid],
      criadoPor: decodedToken.uid,
      criadoEm: now,
    };
    batch.set(grupoRef, grupo);
    // 6.2 jogador
    const jogador = baseJogadorSchema.parse({
      nome: payloadGrupo.apelido,
      grupoId: grupoRef.id,
      usuarioId: decodedToken.uid,
      atribuicao: "admin",
    });
    batch.set(jogadorRef, { ...jogador, criadoEm: now });
    // 6.3 convite
    const payloadConvite = {
      grupoId: grupoRef.id,
      criadoEm: now,
    };
    batch.set(conviteRef, payloadConvite)
    await batch.commit();
  } catch (error) {
    throw error
  }
  // 7. resposta
  return {
    grupoId: grupoRef.id,
    jogadadorId: jogadorRef.id,
    conviteId: conviteRef.id,
  };
});
