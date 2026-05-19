import { Timestamp } from "firebase-admin/firestore"
import { adminAuth, adminDb } from "#server/utils/firebase-admin"
import { baseJogoSchema } from "@/schemas/jogo.schema"
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
  console.log(body);
  // 5. zod
  const validacao = baseJogoSchema.safeParse(body);
  if (!validacao.success) throw createError({
    statusCode: 400,
    statusMessage: 'dados-invalidos',
    message: "Os dados forncedios não passaram pela validação."
  })
  const payload = validacao.data
  // lógica?
  // dá pra por título automático no video contando o numero de jogos do dia.
  // template: {{ nome do grupo }} - {{ Data}} - Jogo {{ numero do jogo no dia }}

  // gravacao
    const jogoRef = adminDb.collection('jogos').doc()
    await jogoRef.set({
    ...payload,
    criadoEm: Timestamp.now(),
    criadoPor: decodedToken.uid
  }, { merge: true })

  return {
    jogoId: jogoRef.id,
  };
});
