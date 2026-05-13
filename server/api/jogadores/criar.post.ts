import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
import { baseJogadorSchema } from "@/schemas/jogador.schema";
export default defineEventHandler(async (event) => {
  // 1. header
  const authorization = getHeader(event, "authorization");
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: "nao-autenticado",
      message: "Houve um problema de autenticação."
    });
  }
  // 2.token
  const token = authorization.replace("Bearer ", "");
  // 3. firebase auth
  const decodedToken = await adminAuth.verifyIdToken(token);
  // 4. body
  const body = await readBody(event);
  // console.log(body);
  // 5. zod
  const validacao = baseJogadorSchema.safeParse(body);
  if (!validacao.success) throw createError({
    statusCode: 400,
    statusMessage: 'dados-invalidos',
    message: "Os dados forncedios não passaram pela validação."
  })
  const payload = validacao.data
  // 6. jogador que está fazendo a requisicao pertence ao grupo?
   // pela UI isso é impossível de acontecer, mas é uma camada de segurança
  const criadorSnapshot = await adminDb
    .collection('jogadores')
    .where('grupoId', '==', payload.grupoId)
    .where('usuarioId', '==', decodedToken.uid)
    .limit(1)
    .get()
  if (criadorSnapshot.empty) {
    throw createError({
      statusCode: 403,
      statusMessage: 'nao-membro',
      message: "É necessário ser membro do grupo para adicionar jogadores."
    })
  } 
  const criador = criadorSnapshot.docs[0]!.data()
  // 7. verifica a atribuição (avulsos não podem adicionar jogadores)
  if (criador.atribuicao === 'avulso') {
    throw createError({
      statusCode: 403,
      statusMessage: 'nao-autorizado',
      message: 'Avulsos não podem criar jogadores. Peça para um membro do grupo adicionar o jogador.'
    })
  }
  // 8. transaction: verifica duplicidade e grava o jogador na mesma operação
  const result = await adminDb.runTransaction(async (transaction) => {
    // 8.1 duplicidade
    const snapshot = await transaction.get(
      adminDb
        .collection("jogadores")
        .where("grupoId", "==", payload.grupoId)
        .where("nomeNormalizado", "==", payload.nomeNormalizado)
        .limit(1)
    );
    if (!snapshot.empty) {
      throw createError({
        statusCode: 409,
        statusMessage: "jogador-ja-existe",
        message:"Já existe um jogador com esse nome no grupo"
      });
    }
    // 8.2 gravação
    const jogadorRef = adminDb.collection("jogadores").doc();
    transaction.set(jogadorRef, {
      ...payload,
      criadoEm: Timestamp.now(),
    });
    return {
      jogadorId: jogadorRef.id,
    };
  });
  // 9. resposta
  return result;
});
